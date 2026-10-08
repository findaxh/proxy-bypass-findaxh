# Domain Bypass System Proxy

[中文](#中文) · [English](#english)

---

## 中文

### 设计初衷

我每天都在用本地代理客户端（Clash Verge），但总有一些网站——国内站、内网、银行、公司系统——**必须直连**：走代理会导致登录异常、验证码出不来或者被地域限制；可把代理整个关掉，其他网站又全废了。

于是写了这个 Manifest V3 小扩展：代理保持开着，只有一份自定义域名列表走直连。工具栏点一下就能在两种模式之间切。

### 功能

- **一键切换** —— 点工具栏图标在"分流开启"（绿色图标 + 白色对勾）和"分流关闭"（红色图标 + 白色叉）之间切换。
- **自动端口探测** —— 接管浏览器代理前先探一下配置的代理端口通不通。本地代理没启动时，**自动回退到系统代理**，浏览器不会卡在一个死代理上，也不用手动去取消勾选。
- **自愈** —— 每 30 秒自动复检一次（本地解包开发版为 10 秒），每次新开标签页 / 刷新页面也会复检。你启动或关闭 Clash Verge 后，几秒内扩展会自动跟着切换。
- **自动匹配子域名** —— 列表里写 `example.com`，`www.example.com`、`api.example.com` 等全部直连。
- **只有两种模式** —— 绿色：列表内域名直连，其余走代理；红色：把代理控制权交还给 Windows 系统代理。

### 使用方式

1. 安装扩展（在 `edge://extensions` / `chrome://extensions` 打开"开发者模式"后"加载解压缩的扩展"，或上架后从商店安装）。
2. 右键工具栏图标 → **选项**（或在扩展详情页点"选项"）。
3. 填写代理服务器地址，例如 `socks5://127.0.0.1:7890`。
4. 每行一个需要直连的域名，例如：
   ```
   baidu.com
   zhihu.com
   192.168.1.0
   ```
5. 点**保存**即可。

平时点工具栏图标即可切换模式，悬停图标可以看到当前状态：

- 绿色、无角标 → 分流开启，代理端口连通。
- 红色、无角标 → 你手动关闭了分流。
- 红色、带 `!` 角标 → 代理端口不通，已自动回退系统代理（启动 Clash Verge 后会自动恢复）。

> 注意：本扩展**不自带代理服务器**，请自行另外运行 Clash Verge 等本地代理客户端。

---

## English

### Why I built this

I use a local proxy client (Clash Verge) every day, but some websites — Chinese domestic sites, intranet portals, banks, and company systems — **must connect directly**. Routing them through the proxy breaks login, captcha, or geo-restrictions, while turning the proxy off entirely kills everything else.

So I wrote this small Manifest V3 extension: it lets me keep the proxy on for everything, while a configurable list of domains goes direct. One click on the toolbar icon toggles the two modes.

### Features

- **One-click toggle** — click the toolbar icon to switch between "bypass on" (green icon, white checkmark) and "bypass off" (red icon, white cross).
- **Auto port probe** — before taking over the browser proxy, it pings the configured proxy port. If the local proxy client isn't running, it **automatically falls back to system proxy** so the browser never gets stuck on a dead proxy. No manual unchecking needed.
- **Self-healing** — re-checks automatically every 30 seconds (10 seconds in local development builds), and on every new tab / page refresh. Start or stop Clash Verge and the extension follows within seconds.
- **Subdomain matching** — list `example.com` and `www.example.com`, `api.example.com` etc. all go direct.
- **Two modes only** — green = custom domains direct, everything else via proxy; red = release control back to the Windows system proxy.

### How to use

1. Install the extension (load unpacked in `edge://extensions` / `chrome://extensions` with Developer mode on, or install from the store once published).
2. Right-click the toolbar icon → **Options** (or open the extension's detail page and click "Options").
3. Fill in your proxy server, e.g. `socks5://127.0.0.1:7890`.
4. Paste the domains that must go direct, one per line, e.g.:
   ```
   baidu.com
   zhihu.com
   192.168.1.0
   ```
5. Click **Save**. Done.

Click the toolbar icon anytime to toggle. Hover the icon to see the current state:

- Green + no badge → bypass is on, port reachable.
- Red + no badge → you manually turned it off.
- Red + `!` badge → proxy port unreachable, automatically fell back to system proxy (start Clash Verge and it will auto-recover).

> Note: this extension does **not** bundle a proxy server. Run Clash Verge (or any local proxy client) separately.

---

## License / 协议

Licensed under the **Apache License, Version 2.0**. See [LICENSE](./LICENSE) for the full text.

本项目采用 **Apache License 2.0** 协议，完整文本见 [LICENSE](./LICENSE)。

## AI 协助声明 / AI Assistance

本项目在开发过程中使用 **Codex / 豆包 App** 协助编写与调试，所用账号为：

This project was developed with assistance from **Codex / Doubao App**, using the following accounts:

- `findaxh@outlook.com`
- `wangxuehao2024@163.com`

## Author / 作者

- 王雪豪
- Email: [findaxh@outlook.com](mailto:findaxh@outlook.com)
- Version: v1.0
- Updated: 2026-10-08
