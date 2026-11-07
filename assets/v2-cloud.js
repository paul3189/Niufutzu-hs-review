/* 學測複習講義 v2 線上版 — 作答紀錄雲端同步＋頁首帳號區（比照 高中數學教學系統/assets/practice-cloud.js）
 *
 * 在 reflex-cloud.js 之後、v2.js 之前載入：
 *   1. 攔截 localStorage 對 v2_rec_<單元碼> 的寫入 → 登入時去抖動上傳（ReflexCloud.practiceSave("v2-<單元碼>", rec)）
 *   2. 登入後比對雲端：雲端較新（或本機沒有、或雲端題數較多）就覆蓋本機並重新載入一次；本機較新就上傳
 *   3. 頁首 #acct 放帳號區（Email 連結登入／登出／同步狀態）
 * 沒有 reflex-cloud.js 或雲端未設定時什麼都不做，帳號區保持隱藏。
 */
(function () {
  "use strict";
  var C = window.ReflexCloud;
  var CODE = document.body && document.body.getAttribute("data-unit");
  if (!C || !CODE) return;
  var CH = "v2-" + CODE, KEY = "v2_rec_" + CODE, FLAG = "v2.synced." + CODE;
  var on = false, timer = null, lastUp = "";

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function localRec() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function localTs() { try { return +localStorage.getItem(KEY + ".ts") || 0; } catch (e) { return 0; } }
  function stampLocal(ts) { try { origSet(KEY + ".ts", String(ts)); } catch (e) {} }
  function countOf(r) { return (r && r.items && Object.keys(r.items).length) || 0; }

  /* 1. 攔截寫入 */
  var origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (k, v) {
    origSet(k, v);
    if (k !== KEY) return;
    stampLocal(Date.now());
    if (!on || !C.user()) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (v === lastUp) return;
      C.practiceSave(CH, JSON.parse(v)).then(function () { lastUp = v; setStatus("☁️ 已同步 " + new Date().toLocaleTimeString()); })
        .catch(function (e) { setStatus("⚠ 上傳失敗：" + esc(e && e.message)); });
    }, 1500);
  };

  /* 2. 登入後合併 */
  function reconcile() {
    if (!C.user()) return;
    C.practiceLoad(CH).then(function (cloud) {
      var loc = localRec(), lts = localTs();
      if (!cloud || !cloud.rec) {
        if (countOf(loc)) return C.practiceSave(CH, loc).then(function () { setStatus("☁️ 已把這台裝置的紀錄上傳"); });
        setStatus("☁️ 已登入，作答紀錄會自動同步");
        return;
      }
      var cloudNewer = cloud.ts > lts || !loc || countOf(cloud.rec) > countOf(loc);
      if (cloudNewer && JSON.stringify(cloud.rec) !== JSON.stringify(loc)) {
        if (sessionStorage.getItem(FLAG)) { setStatus("☁️ 雲端有較新的紀錄，重新整理後套用"); return; }
        origSet(KEY, JSON.stringify(cloud.rec)); stampLocal(cloud.ts || Date.now());
        sessionStorage.setItem(FLAG, "1");
        location.reload();
        return;
      }
      if (!cloudNewer && loc) return C.practiceSave(CH, loc).then(function () { setStatus("☁️ 已同步"); });
      setStatus("☁️ 已同步");
    }).catch(function (e) { setStatus("⚠ 讀取雲端失敗：" + esc(e && e.message)); });
  }

  /* 3. 帳號區（頁首） */
  var host = null, pop = null, btn = null, status = "";
  function setStatus(t) { status = t; var s = pop && pop.querySelector(".st"); if (s) s.innerHTML = t; }
  function build() {
    host = document.getElementById("acct");
    if (!host) return false;
    host.className = "acct"; host.hidden = false;
    host.innerHTML = '<button type="button" class="tb-btn acct-btn">☁️ 登入</button><div class="acct-pop" hidden></div>';
    btn = host.querySelector(".acct-btn"); pop = host.querySelector(".acct-pop");
    btn.onclick = function () { pop.hidden = !pop.hidden; };
    document.addEventListener("click", function (e) { if (!host.contains(e.target)) pop.hidden = true; });
    return true;
  }
  function render() {
    if (!host && !build()) return;
    var u = C.user();
    if (u) {
      btn.textContent = "☁️ " + (C.nick() || "已登入"); btn.classList.add("on");
      pop.innerHTML = "<b>作答紀錄同步</b><div>" + esc(u.email) + "（" + esc(C.nick() || "") + '）</div><div class="st">' + status + "</div>" +
        '<div class="small">登入後，這個單元的作答紀錄存到你的帳號，換裝置也看得到。</div>' +
        '<button type="button" class="btn out" style="margin-top:6px">登出</button>';
      pop.querySelector(".out").onclick = function () { C.signOut(); };
      reconcile();
    } else {
      btn.textContent = "☁️ 登入"; btn.classList.remove("on");
      pop.innerHTML = "<b>作答紀錄同步</b><div class=\"small\">目前紀錄只存在這台裝置。用 Email 登入（免密碼）就能跨裝置同步。</div>" +
        '<input type="email" class="em" placeholder="你的 Email" value="' + esc(C.rememberedEmail()) + '">' +
        '<button type="button" class="btn pri send">寄登入連結</button><div class="st">' + status + "</div>";
      pop.querySelector(".send").onclick = function () {
        var em = pop.querySelector(".em").value.trim();
        if (!C.validEmail(em)) { setStatus("請輸入正確的 Email"); return; }
        setStatus("寄送中…");
        C.sendLink(em).then(function () {
          if (C.mode && C.mode() === "mock" && C.mockLogin) { status = "（測試模式：直接登入）"; C.mockLogin(); return; }
          setStatus("✉️ 已寄出。請在這台裝置打開信裡的連結，就會登入。");
        }).catch(function (e) { setStatus("⚠ 寄送失敗：" + esc(e && e.message)); });
      };
    }
  }

  C.ready.then(function (ok) {
    if (!ok) return;
    on = true;
    return C.finishLink().then(function (r) {
      if (r === "need-email") {
        var em = prompt("請輸入你申請登入連結時用的 Email：");
        if (em) return C.finishLink(em);
      }
    }).catch(function (e) { if (window.console) console.warn("[v2-cloud] 登入連結處理失敗", e); })
      .then(function () {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { C.onAuth(render); });
        else C.onAuth(render);
      });
  });
})();
