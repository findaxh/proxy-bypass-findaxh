const ICONS = {
  on: {
    "16": "icon-green-16.png",
    "32": "icon-green-32.png",
    "48": "icon-green-48.png",
    "128": "icon-green-128.png"
  },
  off: {
    "16": "icon-red-16.png",
    "32": "icon-red-32.png",
    "48": "icon-red-48.png",
    "128": "icon-red-128.png"
  }
};

/**
 * 探测代理端口是否可连通。
 * 原理：向 host:port 发一个普通 HTTP 请求。
 *  - 端口没开 → fetch 快速 reject（TypeError，ECONNREFUSED）
 *  - 端口已开（Clash mixed 端口）→ Clash 会回一个 HTTP 响应（哪怕是 400），fetch resolve
 *  - 端口已开但是纯 SOCKS5，不会回 HTTP → fetch 挂住直到 Abort 超时（AbortError）
 * 因此：resolve 或 AbortError 都说明 TCP 可连通；其它 TypeError 说明连不通。
 */
async function probeProxy(host, port, timeoutMs = 2000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(`http://${host}:${port}/`, {
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal
    });
    return true;
  } catch (e) {
    // 超时 = TCP 已连上但对方不说 HTTP，仍然说明端口活着
    return e && e.name === "AbortError";
  } finally {
    clearTimeout(timer);
  }
}

async function setToolbar(icon, title, badgeText) {
  try {
    await chrome.action.setIcon({ path: icon });
    await chrome.action.setTitle({ title });
    await chrome.action.setBadgeBackgroundColor({ color: "#d93025" });
    await chrome.action.setBadgeText({ text: badgeText || "" });
  } catch (e) {
    console.warn("toolbar update failed", e);
  }
}

async function setSystemProxy() {
  await chrome.proxy.settings.set({
    value: { mode: "system" },
    scope: "regular"
  });
}

async function applyProxyConfig() {
  const config = await chrome.storage.sync.get(["enableBypass", "directDomains", "proxyServer"]);
  // 默认启用分流
  const enableBypass = config.enableBypass ?? true;
  const directDomains = config.directDomains || [];
  const proxyServerStr = (config.proxyServer || "socks5://127.0.0.1:7890").trim();

  // 手动关闭分流：直接回系统代理，红色图标无角标
  if (!enableBypass) {
    await setSystemProxy();
    await setToolbar(ICONS.off, "域名直连分流：已关闭（点击开启）", "");
    return;
  }

  // 解析代理服务器地址
  let proxyObj = null;
  try {
    const url = new URL(proxyServerStr);
    proxyObj = {
      scheme: url.protocol.replace(":", ""),
      host: url.hostname,
      port: parseInt(url.port, 10)
    };
  } catch (e) {
    console.warn("bad proxyServer url", proxyServerStr, e);
  }

  // 地址不合法，或端口探测不通 → 自动回退系统代理，不再接管浏览器
  const reachable = proxyObj ? await probeProxy(proxyObj.host, proxyObj.port) : false;
  if (!reachable) {
    await setSystemProxy();
    await setToolbar(
      ICONS.off,
      `代理 ${proxyObj ? proxyObj.host + ":" + proxyObj.port : proxyServerStr} 端口不通（Clash 未启动？），已自动回退系统代理。启动后点图标重试`,
      "!"
    );
    return;
  }

  // 端口连通 → 启用分流：fixed_servers + bypassList
  const bypassList = directDomains.filter(s => s.trim() !== "");
  await chrome.proxy.settings.set({
    value: {
      mode: "fixed_servers",
      rules: {
        singleProxy: proxyObj,
        bypassList: bypassList
      }
    },
    scope: "regular"
  });
  await setToolbar(
    ICONS.on,
    `分流已开启：${bypassList.length} 个域名直连，其余走 ${proxyObj.host}:${proxyObj.port}（点击关闭）`,
    ""
  );
}

// 点击工具栏图标：直接在两种模式间切换
chrome.action.onClicked.addListener(async () => {
  const cfg = await chrome.storage.sync.get("enableBypass");
  const next = !(cfg.enableBypass ?? true);
  await chrome.storage.sync.set({ enableBypass: next });
  // storage.onChanged 会自动触发 applyProxyConfig，无需在此重复设置代理
});

chrome.storage.onChanged.addListener(() => {
  applyProxyConfig();
});

// 自动探测周期：
//  - 未打包本地加载（installType === "development"）→ 10 秒
//  - 打包 crx / 商店 / 旁加载 → 30 秒（Chromium 对非开发版扩展的 alarm 下限）
let AUTO_CHECK_MS = 30000;
function scheduleAutoCheck() {
  chrome.alarms.create("proxy-recheck", {
    delayInMinutes: AUTO_CHECK_MS / 60000,
    periodInMinutes: AUTO_CHECK_MS / 60000
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "proxy-recheck") applyProxyConfig();
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.status !== "loading") return;
  applyProxyConfig();
  scheduleAutoCheck();
});

// 启动：先按打包版默认 30 秒跑一次，同时异步识别是否为本地开发版，
// 若是则把周期切到 10 秒并重新挂 alarm。
async function boot() {
  try {
    const self = await chrome.management.getSelf();
    if (self && self.installType === "development") {
      AUTO_CHECK_MS = 10000;
    }
  } catch (e) {
    console.warn("getSelf failed, keep 30s", e);
  }
  await applyProxyConfig();
  scheduleAutoCheck();
}

boot();
