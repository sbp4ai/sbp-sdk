# sbp-sdk · SBP single-file web client

The **shared web library** of SBP (Session Bridge Protocol): one file `sbp-sdk.js` (with inline CSS).
After a `<script>` include, call `SBP.mount(el, opts)` to render the session list + live screen +
option cards + input box — no build step required.

## Role

- This is a **shared library**, not the UI of any specific client:
  - `sbp-server` serves it as a static file (`/sbp-sdk.js`, `/sdk/*`); the IM card's "lazy-loaded web page" path uses exactly this;
  - any third-party web page / iframe can also reference it directly.
- It shares the **same protocol semantics** with `sbp-minis` (WeChat mini-program) and `sbp-agent/panel` (local panel),
  but each implements its own transport (the mini-program is limited by the wx environment; the panel has its own REST/WS switch).

## Usage

```html
<script src="/sbp-sdk.js"></script>
<div id="app"></div>
<script>
  SBP.mount(document.getElementById('app'), {
    wsUrl: 'wss://your-sbp-server/ws',
    token: 'DEVICE_TOKEN'
  })
</script>
```

Constraints (first screen only fetches sessionId + title; history loads on click; reverse paging) — see
`spec/SBP-0.1.md` in the `sbp-spec` repository.

## Dependency in sbp-server

`sbp-server` pulls in this repository via **git submodule**, mounted at `server/sdk/` (matching `SDK_DIR = REPO / "sdk"` in code).
When cloning sbp-server, use:

```bash
git clone --recurse-submodules https://github.com/sbp4ai/sbp-server.git
```

After editing this library, run `git submodule update --remote sdk` inside sbp-server to sync.

---

# sbp-sdk · SBP 单文件网页客户端（中文）

SBP（Session Bridge Protocol）的**网页端共享库**：一个文件 `sbp-sdk.js`
（含内联 CSS），`<script>` 引入后调用 `SBP.mount(el, opts)` 即可渲染会话列表 +
实时屏幕 + 选项卡片 + 输入框，无需构建。

## 角色

- 这是一份**共享库**，不是某个具体客户端的 UI：
  - `sbp-server` 把它作为静态文件对外提供（`/sbp-sdk.js`、`/sdk/*`），IM 卡片的
    「懒加载网页」路径正是用它；
  - 任何第三方网页 / iframe 也可以直接引用。
- 它与 `sbp-minis`（微信小程序）和 `sbp-agent/panel`（本地面板）**协议语义一致**，
  但传输层各自实现（小程序受 wx 环境限制、面板有自己的 REST/WS 切换）。

## 用法

```html
<script src="/sbp-sdk.js"></script>
<div id="app"></div>
<script>
  SBP.mount(document.getElementById('app'), {
    wsUrl: 'wss://your-sbp-server/ws',
    token: 'DEVICE_TOKEN'
  })
</script>
```

约束（首屏只拿 sessionId + 标题；历史点击才拉；倒序分页）见
`sbp-spec` 仓库的 `spec/SBP-0.1.md`。

## 在 sbp-server 中的依赖

`sbp-server` 通过 **git submodule** 把本仓库挂到 `server/sdk/`（对应代码里的
`SDK_DIR = REPO / "sdk"`）。克隆 sbp-server 时请用：

```bash
git clone --recurse-submodules https://github.com/sbp4ai/sbp-server.git
```

单独修改本库后，去 sbp-server 里 `git submodule update --remote sdk` 即可同步。
