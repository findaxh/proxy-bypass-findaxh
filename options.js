const enableSwitch = document.getElementById('enableSwitch');
const proxyInput = document.getElementById('proxyInput');
const domainList = document.getElementById('domainList');
const saveBtn = document.getElementById('saveBtn');

async function loadConfig() {
  const cfg = await chrome.storage.sync.get(["enableBypass", "directDomains", "proxyServer"]);
  enableSwitch.checked = cfg.enableBypass ?? true;
  proxyInput.value = cfg.proxyServer ?? "socks5://127.0.0.1:7897";
  domainList.value = (cfg.directDomains || []).join("\n");
}

saveBtn.onclick = async () => {
  const domains = domainList.value.split("\n").map(s => s.trim()).filter(Boolean);
  await chrome.storage.sync.set({
    enableBypass: enableSwitch.checked,
    directDomains: domains,
    proxyServer: proxyInput.value.trim()
  });
  alert("保存成功，配置已生效");
};

loadConfig();
