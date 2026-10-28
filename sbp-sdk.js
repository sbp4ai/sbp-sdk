/*!
 * SBP SDK v0.1 — Session Bridge Protocol 网页端
 * 单文件，<script src="/sbp-sdk.js"></script> 后 SBP.mount(el, opts)
 * 设计约束：首屏只拿 sessionId + 标题；历史点击才拉；倒序分页。
 */
(function (global) {
  "use strict";

  var V = "sbp/0.1";

  var CSS = `
.sbp{--bg:#f6f7f9;--card:#fff;--bd:#e6e8ec;--tx:#111827;--mu:#6b7280;--ac:#2563eb;--rd:#dc2626;--gn:#16a34a;
  position:relative;display:flex;flex-direction:column;height:100dvh;max-height:100dvh;background:var(--bg);
  color:var(--tx);font:14px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC","Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;overflow:hidden}
.sbp *{box-sizing:border-box}
.sbp-hd{display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--card);border-bottom:1px solid var(--bd);flex:0 0 auto}
.sbp-dot{width:7px;height:7px;border-radius:50%;background:#cbd5e1;flex:0 0 auto}
.sbp-dot.on{background:var(--gn);box-shadow:0 0 0 3px rgba(22,163,74,.12)}
.sbp-dot.off{background:#cbd5e1}
.sbp-hd .nm{font-weight:600;font-size:13px}
.sbp-hd .sub{color:var(--mu);font-size:11px;margin-left:auto}
.sbp-ghost{border:0;background:transparent;color:var(--mu);font-size:16px;padding:4px 6px;cursor:pointer}
.sbp-body{flex:1 1 auto;overflow:auto;-webkit-overflow-scrolling:touch;position:relative}

/* 会话列表 */
.sbp-list{padding:8px 10px 24px}
.sbp-empty{color:var(--mu);text-align:center;padding:48px 16px;font-size:13px}
.sbp-item{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--bd);
  border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;transition:.12s}
.sbp-item:active{transform:scale(.985);background:#fafbfc}
.sbp-item .ic{width:28px;height:28px;border-radius:8px;background:#eef2ff;color:var(--ac);
  display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex:0 0 auto}
.sbp-item .mid{flex:1 1 auto;min-width:0}
.sbp-item .t{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sbp-item .p{font-size:11.5px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.sbp-item .r{text-align:right;flex:0 0 auto}
.sbp-item .tm{font-size:10.5px;color:#9ca3af}
.sbp-badge{display:inline-block;font-size:10px;padding:1px 6px;border-radius:99px;margin-top:4px;
  background:#eef2ff;color:#4338ca}
.sbp-badge.run{background:#ecfdf5;color:#047857}
.sbp-badge.wait{background:#fff7ed;color:#c2410c}

/* 会话详情 */
.sbp-thread{display:flex;flex-direction:column;height:100%}
.sbp-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--card);
  border-bottom:1px solid var(--bd);flex:0 0 auto}
.sbp-bar .ti{font-size:13px;font-weight:600;flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sbp-msgs{flex:1 1 auto;overflow:auto;padding:12px 12px 6px;-webkit-overflow-scrolling:touch}
.sbp-more{text-align:center;color:var(--mu);font-size:11.5px;padding:6px 0 12px;cursor:pointer}
.sbp-msg{margin-bottom:10px;max-width:92%}
.sbp-msg.user{margin-left:auto}
.sbp-msg .who{font-size:10px;color:#9ca3af;margin-bottom:3px}
.sbp-msg.user .who{text-align:right}
.sbp-bub{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:9px 11px;
  font-size:13px;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  line-height:1.55;max-height:320px;overflow:auto}
.sbp-msg.user .sbp-bub{background:#eff6ff;border-color:#dbeafe}
.sbp-sec{display:flex;align-items:center;gap:8px;color:#9ca3af;font-size:10.5px;margin:14px 0 6px}
.sbp-sec:after{content:"";flex:1;height:1px;background:var(--bd)}
.sbp-screen{margin:0;background:#0f172a;color:#e2e8f0;border-radius:10px;padding:10px;
  font:11.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;max-height:44vh;overflow:auto;white-space:pre}
.sbp-screen .cur{display:inline-block;width:7px;height:12px;background:#60a5fa;vertical-align:-1px;animation:sbp-b 1s steps(2) infinite}
@keyframes sbp-b{50%{opacity:0}}

/* 底部输入 */
.sbp-ft{flex:0 0 auto;background:var(--card);border-top:1px solid var(--bd);padding:8px 10px calc(8px + env(safe-area-inset-bottom))}
.sbp-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.sbp-chips::-webkit-scrollbar{display:none}
.sbp-chip{flex:0 0 auto;border:1px solid var(--bd);background:#fafbfc;color:#374151;border-radius:99px;
  padding:5px 10px;font-size:12px;cursor:pointer;white-space:nowrap}
.sbp-chip.on{border-color:var(--ac);background:#eff6ff;color:var(--ac)}
.sbp-chip.danger.on{border-color:var(--rd);background:#fef2f2;color:var(--rd)}
.sbp-chip:active{transform:scale(.97)}
.sbp-row{display:flex;gap:8px;align-items:flex-end}
.sbp-input{flex:1 1 auto;border:1px solid var(--bd);border-radius:12px;padding:9px 11px;font-size:14px;
  resize:none;max-height:96px;min-height:38px;font-family:inherit;background:#fafbfc;outline:none}
.sbp-input:focus{border-color:var(--ac);background:#fff}
.sbp-send{border:0;background:var(--ac);color:#fff;border-radius:12px;padding:0 14px;height:38px;
  font-size:13px;font-weight:600;cursor:pointer;flex:0 0 auto}
.sbp-send[disabled]{background:#cbd5e1}
.sbp-keys{display:flex;gap:6px;margin-top:6px}
.sbp-k{flex:1;border:1px solid var(--bd);background:#fafbfc;border-radius:8px;height:32px;font-size:12px;cursor:pointer}
.sbp-offline{position:absolute;left:0;right:0;bottom:0;background:#fff7ed;color:#c2410c;font-size:11px;
  padding:4px 12px;text-align:center;border-top:1px solid #fed7aa;z-index:9}
.sbp-hidden{display:none!important}
`;

  function injectCSS() {
    if (document.getElementById("sbp-style")) return;
    var s = document.createElement("style");
    s.id = "sbp-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function ago(ts) {
    var d = Math.max(0, Date.now() - (ts || 0)) / 1000;
    if (d < 60) return "刚刚";
    if (d < 3600) return Math.floor(d / 60) + " 分钟前";
    if (d < 86400) return Math.floor(d / 3600) + " 小时前";
    return Math.floor(d / 86400) + " 天前";
  }

  // ------------------------------------------------------------------ Panel
  function Panel(el, opts) {
    this.el = typeof el === "string" ? document.querySelector(el) : el;
    this.opts = opts || {};
    var h = {};
    (location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0]) h[p[0]] = decodeURIComponent(p[1] || "");
    });
    this.server = (this.opts.server || h.s || "").replace(/\/$/, "") || location.origin;
    this.token = this.opts.token || h.t || sessionStorage.getItem("sbp.token") || "";
    this.did = this.opts.deviceId || h.d || "";
    if (this.token) try { sessionStorage.setItem("sbp.token", this.token); } catch (e) {}

    this.ws = null;
    this.seq = 0;
    this.pending = {};
    this.sessions = [];
    this.msgs = [];
    this.oldestSeq = Infinity;
    this.sid = null;
    this.caps = [];
    this.state = { status: "idle", choices: [] };
    this.screen = [];
    this.retry = 0;
    this.closed = false;
    this.render();
    this.connect();
  }

  Panel.prototype.render = function () {
    injectCSS();
    this.el.classList.add("sbp");
    this.el.innerHTML =
      '<div class="sbp-hd"><span class="sbp-dot" data-dev></span>' +
      '<span class="nm" data-devname>设备</span>' +
      '<span class="sub" data-sub>连接中…</span>' +
      '<button class="sbp-ghost" data-refresh title="刷新">⟳</button></div>' +
      '<div class="sbp-body">' +
      '  <div class="sbp-list" data-list><div class="sbp-empty">加载会话…</div></div>' +
      '  <div class="sbp-thread sbp-hidden" data-thread>' +
      '    <div class="sbp-bar"><button class="sbp-ghost" data-back>‹</button>' +
      '      <span class="ti" data-title></span><span class="sbp-badge" data-status></span></div>' +
      '    <div class="sbp-msgs" data-msgs></div>' +
      '  </div>' +
      '</div>' +
      '<div class="sbp-ft sbp-hidden" data-ft>' +
      '  <div class="sbp-chips" data-chips></div>' +
      '  <div class="sbp-row"><textarea class="sbp-input" rows="1" placeholder="输入指令，回车发送…" data-input></textarea>' +
      '    <button class="sbp-send" data-send disabled>发送</button></div>' +
      '  <div class="sbp-keys sbp-hidden" data-keys>' +
      '    <button class="sbp-k" data-key="ENTER">⏎</button><button class="sbp-k" data-key="ESC">Esc</button>' +
      '    <button class="sbp-k" data-key="UP">↑</button><button class="sbp-k" data-key="DOWN">↓</button>' +
      '    <button class="sbp-k" data-key="TAB">Tab</button></div>' +
      '</div>';

    var q = (s) => this.el.querySelector(s);
    this.$ = q;
    var self = this;
    q("[data-refresh]").onclick = function () { self.loadSessions(); };
    q("[data-back]").onclick = function () { self.closeSession(); };
    q("[data-send]").onclick = function () { self.sendText(); };
    var input = q("[data-input]");
    input.addEventListener("input", function () {
      self.autosize(input);
      q("[data-send]").disabled = !input.value.trim();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); self.sendText(); }
    });
    this.el.querySelectorAll("[data-key]").forEach(function (b) {
      b.onclick = function () { self.sendInput({ kind: "key", key: b.dataset.key }); };
    });
  };

  Panel.prototype.autosize = function (t) {
    t.style.height = "auto";
    t.style.height = Math.min(96, t.scrollHeight) + "px";
  };

  // ---------------------------------------------------------------- ws
  Panel.prototype.connect = function () {
    var self = this;
    var url = this.server.replace(/^http/, "ws") + "/sbp";
    this.$("[data-sub]").textContent = "连接中…";
    var ws = new WebSocket(url, ["sbp.v0.1"]);
    this.ws = ws;
    ws.onopen = function () {
      self.retry = 0;
      ws.send(JSON.stringify({
        v: V, id: "h1", type: "req", name: "hello", ts: Date.now(),
        payload: { role: "client", token: self.token }
      }));
    };
    ws.onmessage = function (ev) {
      var f;
      try { f = JSON.parse(ev.data); } catch (e) { return; }
      self.onFrame(f);
    };
    ws.onclose = function () {
      if (self.closed) return;
      self.$("[data-dev]").classList.remove("on");
      self.$("[data-dev]").classList.add("off");
      self.$("[data-sub]").textContent = "已断开，重连中…";
      self.retry++;
      setTimeout(function () { self.connect(); }, Math.min(30000, 800 * Math.pow(2, self.retry)));
    };
  };

  Panel.prototype.send = function (obj) {
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(obj));
  };

  Panel.prototype.req = function (name, payload, sid) {
    var self = this;
    var id = "c" + (++this.seq);
    var frame = { v: V, id: id, type: "req", name: name, ts: Date.now(), payload: payload || {} };
    if (sid) frame.sid = sid;
    return new Promise(function (resolve, reject) {
      self.pending[id] = { resolve: resolve, reject: reject };
      self.send(frame);
      setTimeout(function () {
        if (self.pending[id]) { delete self.pending[id]; reject(new Error("timeout:" + name)); }
      }, 10000);
    });
  };

  Panel.prototype.onFrame = function (f) {
    if (f.type === "res") {
      var p = this.pending[f.ref];
      if (p) {
        delete this.pending[f.ref];
        f.ok ? p.resolve(f.payload || {}) : p.reject(f.err || {});
        return;
      }
      if (f.name === "hello.ok") this.onHello(f.payload || {});
      return;
    }
    if (f.type !== "evt") return;

    switch (f.name) {
      case "session.index":
        this.onIndex((f.payload || {}).sessions || []);
        break;
      case "session.message":
        if (f.sid === this.sid) this.addMessage(f.payload || {}, false);
        break;
      case "output.delta":
        if (f.sid === this.sid) this.applyScreen(f.payload || {});
        break;
      case "session.state":
        if (f.sid === this.sid) this.onState(f.payload || {});
        break;
      default:
        break; // 未知事件：静默丢弃（前向兼容）
    }
  };

  Panel.prototype.onHello = function (pl) {
    var dev = pl.device || {};
    this.caps = pl.caps || [];
    this.did = dev.id || this.did;
    this.$("[data-devname]").textContent = dev.name || "设备";
    this.$("[data-dev]").classList.add("on");
    this.$("[data-sub]").textContent = dev.online ? "在线" : "离线";
    this.loadSessions();
    if (this.sid) this.attach(this.sid);
  };

  // ---------------------------------------------------------------- list
  Panel.prototype.loadSessions = function () {
    var self = this;
    this.req("session.list", {}).then(function (pl) {
      self.onIndex(pl.sessions || []);
    }).catch(function () {
      self.$("[data-list]").innerHTML = '<div class="sbp-empty">无法获取会话列表</div>';
    });
  };

  Panel.prototype.onIndex = function (list) {
    this.sessions = list || [];
    if (this.sid) return;
    var box = this.$("[data-list]");
    if (!this.sessions.length) {
      box.innerHTML = '<div class="sbp-empty">还没有会话。<br>在电脑上运行 <code>sbp-bridge up</code> 后回车刷新。</div>';
      return;
    }
    box.innerHTML = this.sessions.map(function (s) {
      var st = s.status || "idle";
      var cls = st === "running" ? "run" : st === "waiting_input" ? "wait" : "";
      var label = st === "running" ? "运行中" : st === "waiting_input" ? "等待确认" : st === "exited" ? "已退出" : "空闲";
      return '<div class="sbp-item" data-sid="' + esc(s.sid) + '">' +
        '<div class="ic">' + esc((s.agent || "?").slice(0, 2).toUpperCase()) + '</div>' +
        '<div class="mid"><div class="t">' + esc(s.title || s.sid) + '</div>' +
        '<div class="p">' + esc(s.preview || "（无输出）") + '</div></div>' +
        '<div class="r"><div class="tm">' + ago(s.updated_at) + '</div>' +
        '<span class="sbp-badge ' + cls + '">' + label + '</span></div></div>';
    }).join("");
    var self = this;
    box.querySelectorAll("[data-sid]").forEach(function (n) {
      n.onclick = function () { self.openSession(n.dataset.sid); };
    });
  };

  // ---------------------------------------------------------------- thread
  Panel.prototype.openSession = function (sid) {
    this.sid = sid;
    this.msgs = [];
    this.oldestSeq = Infinity;
    this.screen = [];
    var s = this.sessions.filter(function (x) { return x.sid === sid; })[0] || {};
    this.$("[data-list]").classList.add("sbp-hidden");
    this.$("[data-thread]").classList.remove("sbp-hidden");
    this.$("[data-ft]").classList.remove("sbp-hidden");
    this.$("[data-title]").textContent = s.title || sid;
    this.$("[data-msgs]").innerHTML = '<div class="sbp-more" data-hint>加载中…</div>';
    this.renderChips();
    this.loadLatest();
  };

  Panel.prototype.closeSession = function () {
    this.sid = null;
    this.$("[data-thread]").classList.add("sbp-hidden");
    this.$("[data-ft]").classList.add("sbp-hidden");
    this.$("[data-list]").classList.remove("sbp-hidden");
    this.loadSessions();
  };

  // 首屏：只拉最新一页（懒加载核心）
  Panel.prototype.loadLatest = function () {
    var self = this;
    this.req("session.history", { sid: this.sid, limit: 20 }).then(function (pl) {
      self.prepend(pl.items || [], pl.has_more);
      var last = pl.items && pl.items.length ? pl.items[pl.items.length - 1].seq : 0;
      self.attach(self.sid, last + 1);
    }).catch(function (e) {
      self.$("[data-msgs]").innerHTML = '<div class="sbp-empty">历史加载失败</div>';
    });
  };

  Panel.prototype.loadOlder = function () {
    if (!this.sid || !isFinite(this.oldestSeq)) return;
    var self = this;
    var msgs = this.$("[data-msgs]");
    var keepH = msgs.scrollHeight;
    this.req("session.history", { sid: this.sid, before_seq: this.oldestSeq, limit: 20 }).then(function (pl) {
      self.prepend(pl.items || [], pl.has_more);
      msgs.scrollTop = msgs.scrollHeight - keepH;
    });
  };

  Panel.prototype.prepend = function (items, hasMore) {
    var box = this.$("[data-msgs]");
    var hint = box.querySelector("[data-hint]");
    if (hint) hint.remove();
    if (!items.length) {
      if (!this.msgs.length) box.innerHTML = '<div class="sbp-empty">暂无历史</div>';
      return;
    }
    var known = {};
    this.msgs.forEach(function (m) { known[m.seq] = 1; });
    var fresh = items.filter(function (m) { return !known[m.seq]; });
    var html = fresh.map(this.msgHTML.bind(this)).join("");
    box.insertAdjacentHTML("afterbegin", html);
    this.msgs = fresh.concat(this.msgs).sort(function (a, b) { return a.seq - b.seq; });
    this.oldestSeq = this.msgs[0].seq;
    if (hasMore) {
      box.insertAdjacentHTML("afterbegin", '<div class="sbp-more" data-hint>上滑加载更早</div>');
    }
    var self = this;
    box.onscroll = function () {
      if (box.scrollTop < 24) self.loadOlder();
    };
  };

  Panel.prototype.msgHTML = function (m) {
    var role = m.role === "user" ? "user" : "agent";
    var who = role === "user" ? "我" : (m.meta && m.meta.tool ? "工具 · " + m.meta.tool : "Agent");
    return '<div class="sbp-msg ' + role + '"><div class="who">' + esc(who) +
      " · " + (m.seq || "") + '</div><div class="sbp-bub">' + esc(m.text || "") + "</div></div>";
  };

  Panel.prototype.addMessage = function (m, prepend) {
    if (!m.seq) return;
    for (var i = 0; i < this.msgs.length; i++) if (this.msgs[i].seq === m.seq) return;
    this.msgs.push(m);
    var box = this.$("[data-msgs]");
    var empty = box.querySelector(".sbp-empty");
    if (empty) empty.remove();
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.insertAdjacentHTML("beforeend", this.msgHTML(m));
    if (near) box.scrollTop = box.scrollHeight;
    if (m.seq > this.seq_ack || 0) this.seq_ack = m.seq;
    this.send({ v: V, type: "evt", name: "ack", sid: this.sid, seq: m.seq });
  };

  Panel.prototype.attach = function (sid, fromSeq) {
    var self = this;
    this.req("session.attach", { sid: sid, from_seq: fromSeq || 0 }, sid).then(function (pl) {
      self.$("[data-sub]").textContent = "已订阅";
      if (!fromSeq && pl.last_seq) {
        self.screen = [];
      }
    }).catch(function () {});
  };

  // ---------------------------------------------------------------- screen
  Panel.prototype.applyScreen = function (pl) {
    if (pl.mode !== "screen") return;
    if (pl.full || !this.screen.length) {
      this.screen = pl.lines || [];
    } else {
      var start = pl.start || 0;
      var arr = this.screen.slice();
      (pl.lines || []).forEach(function (ln, i) { arr[start + i] = ln; });
      this.screen = arr;
    }
    var box = this.$("[data-msgs]");
    var pre = box.querySelector("[data-screen]");
    if (!pre) {
      box.insertAdjacentHTML("beforeend", '<div class="sbp-sec">实时屏幕</div><pre class="sbp-screen" data-screen></pre>');
      pre = box.querySelector("[data-screen]");
      box.scrollTop = box.scrollHeight;
    }
    var atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 90;
    pre.textContent = this.screen.join("\n");
    if (atBottom) box.scrollTop = box.scrollHeight;
  };

  Panel.prototype.onState = function (pl) {
    this.state = { status: pl.status || "idle", choices: pl.choices || [] };
    var b = this.$("[data-status]");
    var map = { running: ["运行中", "run"], waiting_input: ["等待确认", "wait"], idle: ["空闲", ""], exited: ["已退出", ""] };
    var v = map[this.state.status] || ["空闲", ""];
    b.textContent = v[0];
    b.className = "sbp-badge " + v[1];
    this.renderChips();
  };

  // ---------------------------------------------------------------- 能力勾选
  Panel.prototype.renderChips = function () {
    var caps = this.caps.length ? this.caps : [];
    var has = function (c) { return caps.indexOf(c) >= 0; };
    var chips = [];
    var ch = this.state.choices || [];
    if (has("input.choice") && ch.length) {
      ch.forEach(function (c, i) {
        chips.push('<button class="sbp-chip" data-choice="' + i + '">' + c.index + ". " + esc(c.label) + "</button>");
      });
    }
    chips.push('<button class="sbp-chip" data-toggle="keys"' + (has("input.key") ? "" : " hidden") + '>⌨ 按键</button>');
    if (has("input.interrupt")) chips.push('<button class="sbp-chip danger" data-interrupt>■ 中断</button>');
    chips.push('<button class="sbp-chip" data-refresh-screen>⟳ 抓屏</button>');
    var box = this.$("[data-chips]");
    box.innerHTML = chips.join("");
    var self = this;
    box.querySelectorAll("[data-choice]").forEach(function (b) {
      b.onclick = function () {
        var c = self.state.choices[+b.dataset.choice];
        self.sendInput({ kind: "choice", index: c.index, label: c.label });
      };
    });
    var t = box.querySelector("[data-toggle=keys]");
    if (t) t.onclick = function () {
      t.classList.toggle("on");
      self.$("[data-keys]").classList.toggle("sbp-hidden", !t.classList.contains("on"));
    };
    var it = box.querySelector("[data-interrupt]");
    if (it) it.onclick = function () {
      if (it.dataset.arm !== "1") { it.dataset.arm = "1"; it.textContent = "再点一次确认中断"; setTimeout(function () { it.dataset.arm = "0"; it.textContent = "■ 中断"; }, 3000); return; }
      self.sendInput({ kind: "interrupt" });
      it.dataset.arm = "0"; it.textContent = "■ 中断";
    };
    var rs = box.querySelector("[data-refresh-screen]");
    if (rs) rs.onclick = function () { self.req("session.snapshot", { sid: self.sid }, self.sid).catch(function () {}); };
  };

  // ---------------------------------------------------------------- input
  Panel.prototype.sendText = function () {
    var input = this.$("[data-input]");
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    this.autosize(input);
    this.$("[data-send]").disabled = true;
    this.sendInput({ kind: "text", text: text });
  };

  Panel.prototype.sendInput = function (payload) {
    payload.sid = this.sid;
    payload.cid = "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    this.send({
      v: V, type: "req", id: payload.cid, name: "session.input",
      sid: this.sid, ts: Date.now(), payload: payload
    });
  };

  Panel.prototype.destroy = function () {
    this.closed = true;
    if (this.ws) this.ws.close();
  };

  var SBP = {
    version: V,
    mount: function (el, opts) { return new Panel(el, opts); },
    Panel: Panel
  };
  global.SBP = SBP;
})(typeof window !== "undefined" ? window : this);
