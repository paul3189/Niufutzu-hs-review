/* 學測複習講義 v2 線上版 — 單元頁（由 build_web.py 產生的 data/<單元碼>.json 渲染）
 *
 * 版面與紙本主講義一致：考點地圖 → 節點（觀念提要、精選例題、隨堂類題）→ 課後練習四級 → 混合題 → 延伸閱讀。
 * 每題：單選／多選點選項後「作答」立刻判對錯；選填／填充／非選先寫「我的答案」，看答案後自己標 ○／✗。
 *       送出前先評信心（有把握／不確定／猜的）；「破題點」只給 key，「詳解」給 solution＋常見錯誤＋另解。
 * 紀錄：localStorage「v2_rec_<單元碼>」= {v:1, items:{rid:{ok, conf, t, a?, h?}}}；rid 為 qid，題組小題為 qid#小題號。
 *       a＝選擇題選了哪些（還原畫面用）；h＝作答前先看了破題點（key）或詳解（sol）。
 *       雲端同步由 v2-cloud.js 攔截 setItem 處理，本檔不直接碰雲端（回報除外）。
 * 數學：直接呼叫 katex.renderToString（不經 auto-render），所以 $…$ 裡的 < > 不會被當成 HTML。
 */
(function () {
  "use strict";
  var CODE = document.body.getAttribute("data-unit");
  var KEY = "v2_rec_" + CODE, VIEW_KEY = "v2_view";
  var root = document.getElementById("unit-root");
  var D = null, REC = null, NIU_I = 0;
  var Q = {}, ITEMS = [], ITEM = {}, HINT = {};
  var NIU = { teach: "cow_teach.png", baton: "cow_baton.jpg", cheer: "cow_cheer.png", stand: "cow_stand.png", scholar: "cow_scholar.png", cos: "cow_cos.jpg", float: "cow_float.jpg", zzz: "cow_zzz.jpg", elim: "cow_elim.png" };
  var NIU_ROT = ["teach", "baton", "cheer", "stand", "cos", "float"];
  var CONF = { h: "有把握", m: "不確定", l: "猜的" };
  var HEAT = { "高": "★★★", "中": "★★☆", "低": "★☆☆" };
  var ROLE = { "基本": "teal", "變化": "steel", "大考": "wine", "隨堂": "green", "基礎": "teal", "進階": "steel", "挑戰": "warn", "大考精選": "wine", "混合": "purple" };
  var TIERS = [["基礎", "觀念熱身"], ["進階", "綜合應用"], ["挑戰", "滿分難題"], ["大考精選", "學測・指考・分科原題"]];
  var TOOLMAP = "https://paul3189.github.io/Niufutzu-hs-math/branch.html";
  var REFLEX = "https://paul3189.github.io/Niufutzu-hs-math/reflex.html";
  var PRACTICE = "https://paul3189.github.io/Niufutzu-hs-practice/";

  /* ══════════ 小工具 ══════════ */
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtT(t) { var d = new Date(t); return (d.getMonth() + 1) + "/" + d.getDate() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }

  /* ══════════ 數學與富文字 ══════════ */
  var TOK = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\*\*[\s\S]+?\*\*)/;
  function tex(t, disp) {
    if (!window.katex) return "<code>" + esc(t) + "</code>";
    /* 資料裡偶爾把「✔」「、」寫進數學式（檢查總和那類句子）：換成 KaTeX 認得的寫法，不然會在主控台跳警告 */
    t = String(t).replace(/✔/g, "\\checkmark").replace(/、/g, ",\\ ");
    try { return katex.renderToString(t, { displayMode: !!disp, throwOnError: false, strict: "ignore" }); }
    catch (e) { return '<code class="kx-err">' + esc(t) + "</code>"; }
  }
  function rich(s) {
    var out = "";
    String(s == null ? "" : s).split(TOK).forEach(function (p) {
      if (!p) return;
      if (p.length > 4 && p.slice(0, 2) === "$$" && p.slice(-2) === "$$") out += '<span class="mdisp">' + tex(p.slice(2, -2), true) + "</span>";
      else if (p.length > 2 && p.charAt(0) === "$" && p.slice(-1) === "$") out += tex(p.slice(1, -1), false);
      else if (p.length > 4 && p.slice(0, 2) === "**" && p.slice(-2) === "**") out += "<b>" + rich(p.slice(2, -2)) + "</b>";
      else out += esc(p).replace(/\n/g, "<br>");
    });
    return out;
  }

  /* ══════════ 區塊（與紙本 render_blocks 對應）══════════ */
  function blocks(arr) { return (arr || []).map(block).join(""); }
  function block(b) {
    if (typeof b === "string") b = { type: "p", text: b };
    var t = b.type || "p";
    if (t === "p") {
      var s = String(b.text || "").trim();
      if (/^\$\$[\s\S]*\$\$$/.test(s) && s.split("$$").length === 3) return '<div class="mdisp">' + tex(s.slice(2, -2), true) + "</div>";
      return "<p>" + rich(s) + "</p>";
    }
    if (t === "list") return '<ul class="v2-list">' + (b.items || []).map(function (it) { return "<li>" + (typeof it === "string" ? rich(it) : block(it)) + "</li>"; }).join("") + "</ul>";
    if (t === "box") return box(b);
    if (t === "table") return table(b.header, b.rows, "");
    if (t === "image") return figure(b.file, b.width_cm, b.caption, "fig");
    return "<p>" + rich(b.text || "") + "</p>";
  }
  function table(header, rows, cls) {
    var h = '<div class="tbl-wrap"><table class="v2-tbl ' + (cls || "") + '">';
    if (header) h += "<tr>" + header.map(function (x) { return "<th>" + rich(x) + "</th>"; }).join("") + "</tr>";
    (rows || []).forEach(function (r) { h += "<tr>" + r.map(function (x) { return "<td>" + (x && x.html ? x.html : rich(String(x))) + "</td>"; }).join("") + "</tr>"; });
    return h + "</table></div>";
  }
  function figure(file, wcm, caption, cls) {
    var w = Math.round((+wcm || 6) * 42);          /* 1 cm ≈ 42 px（螢幕上略放大，手機會被 max-width 壓回來） */
    return '<figure class="' + cls + '"><img src="../' + esc(file) + '" style="width:' + w + 'px" alt="' + esc(caption || "附圖") + '" loading="lazy">' +
      (caption ? "<figcaption>" + rich(caption) + "</figcaption>" : "") + "</figure>";
  }
  var BOX = { key: "★ ", warn: "⚠ ", niu: "♥ 牛夫子", alt: "✎ ", supp: "＋ 補充", link: "⇄ 串聯" };
  function box(b) {
    var st = BOX[b.style] ? b.style : "key", title = b.title || "", head;
    if (st === "niu" || st === "supp" || st === "link") {
      title = title.replace(/^(牛夫子|補充|串聯)\s*[：:・]?\s*/, "");
      head = BOX[st] + (title ? "・" + rich(title) : "");
    } else head = BOX[st] + rich(title);
    var body = blocks(b.body);
    if (st === "link" && b.to && b.to.length) {
      body += '<p class="bx-to">' + b.to.map(function (id) {
        var L = D.links[id];
        return '<span class="to-i">→ ' + (L && L.href ? '<a href="' + esc(L.href) + '">' + rich(L.text) + "</a>" : (L ? rich(L.text) : esc(id))) + "</span>";
      }).join("") + "</p>";
    }
    if (st === "niu") {
      var pose = NIU[b.pose] ? b.pose : NIU_ROT[NIU_I++ % NIU_ROT.length];
      return '<div class="bx-niu"><img class="niu-img" src="../assets/niu/' + NIU[pose] + '" alt="牛夫子">' +
        '<div class="niu-say"><div class="bx-h">' + head + "</div>" + body + "</div></div>";
    }
    return '<div class="bx bx-' + st + '"><div class="bx-h">' + head + "</div>" + body + "</div>";
  }

  /* ══════════ 題目 ══════════ */
  function choiceSet(item) {
    if (item.qtype !== "單選" && item.qtype !== "多選") return null;
    var m = String(item.answer || "").match(/^\s*((?:\(\s*\d\s*\)[\s、,，]*)+)/);
    if (!m) return null;
    var s = m[1].match(/\d/g).sort();
    return s.join(",");
  }
  function shortOpt(o) { return String(o).replace(/\$|\\[a-zA-Z]+|[{}]/g, "").length <= 9 && String(o).indexOf("begin") < 0; }
  function ansUI(item, rid) {
    var set = choiceSet(item), h;
    if (set) {
      var opts = item.options && item.options.length ? item.options : null;
      var n = opts ? opts.length : Math.max(5, +set.split(",").pop());
      var short = !opts || opts.every(shortOpt);
      h = '<div class="ans" data-rid="' + esc(rid) + '" data-kind="choice" data-multi="' + (item.qtype === "多選" ? 1 : 0) + '">';
      if (!opts) h += '<div class="note-sm">選項在圖上，直接點選項編號。</div>';
      h += '<div class="opts' + (short ? " short" : "") + '">';
      for (var i = 0; i < n; i++) h += '<button type="button" class="opt" data-i="' + (i + 1) + '"><span class="on">(' + (i + 1) + ")</span>" + (opts ? '<span class="ot">' + rich(opts[i]) + "</span>" : "") + "</button>";
      h += "</div>";
      if (item.qtype === "多選") h += '<div class="note-sm">多選題：可以選不只一個。</div>';
    } else {
      h = '<div class="ans" data-rid="' + esc(rid) + '" data-kind="self">';
      if (item.options && item.options.length) h += '<ol class="opts-static">' + item.options.map(function (o, i) { return '<li><span class="on">(' + (i + 1) + ")</span>" + rich(o) + "</li>"; }).join("") + "</ol>";
      h += '<textarea class="my" rows="2" placeholder="我的答案（寫給自己看，不判分）"></textarea>';
    }
    h += '<div class="conf"><span class="cl">送出前先評：</span><button type="button" data-c="h">有把握</button><button type="button" data-c="m">不確定</button><button type="button" data-c="l">猜的</button></div>';
    h += '<div class="act"><button type="button" class="btn pri go">' + (set ? "作答" : "看答案") + '</button><span class="msg"></span></div><div class="res"></div></div>';
    return h;
  }
  function qCard(q) {
    var role = ROLE[q.role] || "wine", ex = q.role === "基本" || q.role === "變化" || q.role === "大考";
    var h = '<article class="q role-' + role + '" id="q-' + esc(q.qid) + '" data-qid="' + esc(q.qid) + '">';
    h += '<header class="q-h"><span class="q-no">' + esc(q.no) + '</span><span class="q-type">◎ ' + esc(q.qtype) + (ex ? "<small>" + esc(q.role) + "例題</small>" : "") + "</span>" +
      '<span class="q-src">' + esc(q.src || "") + '</span><span class="q-mark"></span></header><div class="q-body">';
    var img = q.image;
    if (img && (img.place || "right") === "right") {
      h += '<div class="stem-row"><div class="stem-main">' + blocks(q.stem) + '</div><figure class="stem-img"><img src="../' + esc(img.file) + '" style="width:' + Math.round((+img.width_cm || 5) * 42) + 'px" alt="附圖" loading="lazy"></figure></div>';
    } else {
      h += blocks(q.stem);
      if (img) h += figure(img.file, img.width_cm || 6, "", "fig q-img");
    }
    if (q.parts && q.parts.length) {
      q.parts.forEach(function (p, i) {
        var rid = q.qid + "#" + (i + 1);
        h += '<div class="part" id="q-' + esc(q.qid) + "-p" + (i + 1) + '"><div class="part-h">(' + (i + 1) + ')<span class="pq">〔' + esc(p.qtype || "") + "〕" + (p.label ? esc(p.label) : "") + "</span></div>" +
          blocks(p.stem) + ansUI(p, rid) +
          (p.solution && p.solution.length ? '<button type="button" class="lnk tp" data-p="' + i + '">看這一小題的詳解</button><div class="part-sol" hidden></div>' : "") + "</div>";
      });
    } else h += ansUI(q, q.qid);
    h += '<div class="q-tools">' + (q.key ? '<button type="button" class="btn tk">💡 破題點</button>' : "") +
      '<button type="button" class="btn ts">📖 詳解</button><span class="grow"></span>' +
      '<button type="button" class="btn fb" data-k="unclear">詳解看不懂</button><button type="button" class="btn fb" data-k="error">題目有問題</button></div>' +
      '<div class="q-key" hidden></div><div class="q-sol" hidden></div><div class="fb-box" hidden></div>';
    return h + "</div></article>";
  }
  function answerText(q) {
    if (!q.parts || !q.parts.length) return rich(q.answer || "");
    return q.parts.map(function (p, i) { return "(" + (i + 1) + ") " + rich(p.answer || ""); }).join("　");
  }
  function solHtml(q) {
    var h = '<div class="sol"><p class="sol-ans"><b>答案</b>　' + answerText(q) + "</p>";
    if (q.point) h += '<p class="sol-pt">▸ 這題在考：' + rich(q.point) + "</p>";
    h += '<div class="sol-h">詳解</div>' + blocks(q.solution);
    (q.parts || []).forEach(function (p, i) {
      if (p.solution && p.solution.length) h += '<div class="sol-part"><b>(' + (i + 1) + ")</b>" + blocks(p.solution) + "</div>";
    });
    if (q.pitfall) h += box({ style: "warn", title: "常見錯誤", body: [q.pitfall] });
    if (q.alt && q.alt.length) h += box({ style: "alt", title: "另解", body: q.alt });
    return h + "</div>";
  }

  /* ══════════ 整頁 ══════════ */
  function secBar(l, t, r, id, soft) {
    return '<h2 class="sec-bar' + (soft ? " soft" : "") + '" id="' + id + '"><span class="sb-l">' + esc(l) + '</span><span class="sb-t">' + rich(t) + "</span>" + (r ? '<span class="sb-r">' + esc(r) + "</span>" : "") + "</h2>";
  }
  function register(q) {
    Q[q.qid] = q;
    if (q.parts && q.parts.length) q.parts.forEach(function (p, i) { add(q.qid + "#" + (i + 1), q, p); });
    else add(q.qid, q, q);
    function add(rid, qq, item) { var o = { rid: rid, qid: qq.qid, node: qq.node, item: item, no: qq.no + (rid.indexOf("#") > 0 ? "(" + rid.split("#")[1] + ")" : "") }; ITEMS.push(o); ITEM[rid] = o; }
  }
  function render() {
    var h = "", u = D.unit;
    h += '<nav class="node-nav" aria-label="節點導覽"><a href="#map">考點地圖</a>' + D.nodes.map(function (n) { return '<a href="#node-' + esc(n.id) + '" data-nav="' + esc(n.id) + '">' + esc(n.id) + " " + esc(n.title) + '<span class="pct"></span></a>'; }).join("") +
      '<a href="#practice">課後練習</a>' + (D.mixed.length ? '<a href="#mixed">混合題</a>' : "") + (D.supplement.length ? '<a href="#supp">延伸閱讀</a>' : "") + "</nav>";
    h += secBar("考點地圖", "近五年學測數A（111–115）怎麼考「" + u + "」", "", "map");
    h += '<div class="intro">' + blocks(D.intro) + "</div>";
    if (D.exam_map.length) {
      h += table(["節點", "熱度", "出現（年-題號）", "配分", "近年怎麼考"], D.exam_map.map(function (m) {
        return [{ html: '<a href="#node-' + esc(m.node) + '">' + esc(m.node) + "</a>　" + rich(m.title) }, HEAT[m.heat] || "", (m.exam || []).join("、") || "—", m.points == null ? "" : String(m.points), m.note || ""];
      }), "map-tbl");
    }
    D.nodes.forEach(function (nd) {
      h += secBar("節點 " + nd.id, nd.title, "熱度 " + (HEAT[nd.heat] || ""), "node-" + nd.id);
      h += '<button type="button" class="btn concept-open" data-n="' + esc(nd.id) + '">展開觀念提要</button><div class="node-concept" data-n="' + esc(nd.id) + '">' + blocks(nd.concept) + "</div>";
      if (nd.examples.length) h += '<div class="sub-h">▍精選例題<small>基本 → 變化 → 大考</small></div>' + nd.examples.map(qCard).join("");
      if (nd.drill.length) h += '<div class="sub-h drill">▍隨堂類題<small>學完馬上練</small></div>' + nd.drill.map(qCard).join("");
    });
    h += secBar("課後練習", u + "・四級練習", "基礎 → 進階 → 挑戰 → 大考精選", "practice");
    TIERS.forEach(function (t) {
      var qs = D.practice[t[0]] || [];
      if (!qs.length) return;
      h += '<div class="tier-h role-' + ROLE[t[0]] + '" id="tier-' + t[0] + '">◆ ' + (t[0] === "大考精選" ? "大考精選（" + t[1] + "）" : t[0] + "題（" + t[1] + "）") + "</div>" + qs.map(qCard).join("");
    });
    if (D.mixed.length) h += secBar("混合題", u + "・題組專區", "仿學測混合題", "mixed") + D.mixed.map(qCard).join("");
    if (D.supplement.length) h += secBar("補充", "延伸閱讀（了解即可，不列入練習）", "", "supp", true) + blocks(D.supplement);
    root.innerHTML = h;
  }

  /* ══════════ 紀錄 ══════════ */
  function loadRec() {
    var r = null;
    try { r = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!r || r.v !== 1 || typeof r.items !== "object" || !r.items) r = { v: 1, items: {} };
    return r;
  }
  function saveRec() { try { localStorage.setItem(KEY, JSON.stringify(REC)); } catch (e) {} updateCounts(); }

  function selOf(ans) { return $$(".opt.sel", ans).map(function (b) { return b.getAttribute("data-i"); }).sort().join(","); }
  function fmtSet(s) { return s ? s.split(",").map(function (x) { return "(" + x + ")"; }).join("") : ""; }
  function showDone(ans, rec) {
    var it = ITEM[ans.getAttribute("data-rid")]; if (!it) return;
    var kind = ans.getAttribute("data-kind"), item = it.item;
    ans.classList.add("done");
    $$(".conf button", ans).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-c") === rec.conf); b.disabled = true; });
    $(".go", ans).hidden = true; $(".msg", ans).textContent = "";
    var h = "";
    if (kind === "choice") {
      var right = choiceSet(item).split(","), mine = (rec.a || "").split(",");
      $$(".opt", ans).forEach(function (b) {
        var i = b.getAttribute("data-i"); b.disabled = true;
        b.classList.toggle("sel", mine.indexOf(i) >= 0);
        b.classList.toggle("right", right.indexOf(i) >= 0);
        b.classList.toggle("wrong", mine.indexOf(i) >= 0 && right.indexOf(i) < 0);
      });
      h += rec.ok ? '<span class="ok">○ 答對</span>' : '<span class="ng">✗ 答錯</span>　正解 <b>' + rich(item.answer) + "</b>";
    } else {
      var ta = $("textarea.my", ans); if (ta && rec.my != null && !ta.value) ta.value = rec.my;
      h += '<div class="ans-show"><b>答案</b>　' + rich(item.answer) + "</div>" + (rec.ok ? '<span class="ok">○ 我答對了</span>' : '<span class="ng">✗ 我答錯了</span>');
    }
    h += '<span class="meta">' + (CONF[rec.conf] || "") + "・" + fmtT(rec.t) + (rec.h ? "・作答前看過" + (rec.h === "key" ? "破題點" : "詳解") : "") + "</span>" +
      '<button type="button" class="lnk redo">重做</button>';
    if (!rec.ok && rec.conf === "h") h += '<span class="nudge hc">⚠ 有把握卻答錯：這種「以為會」最值得回頭看詳解，找出卡在哪一步。</span>';
    else if (!rec.ok) h += '<span class="nudge">按「📖 詳解」對照，找出卡在哪一步；或先看「💡 破題點」再重做一次。</span>';
    else if (rec.conf === "l") h += '<span class="nudge">猜對的還不算會，過幾天再做一次。</span>';
    $(".res", ans).innerHTML = h;
    fitWide($(".res", ans));
    markCard(it.qid);
  }
  function resetAns(ans) {
    ans.classList.remove("done"); delete ans.dataset.conf;
    $$(".opt", ans).forEach(function (b) { b.disabled = false; b.classList.remove("sel", "right", "wrong"); });
    $$(".conf button", ans).forEach(function (b) { b.disabled = false; b.classList.remove("on"); });
    var go = $(".go", ans); go.hidden = false; go.disabled = false;
    $(".res", ans).innerHTML = ""; $(".msg", ans).textContent = "";
  }
  function markCard(qid) {
    var card = document.getElementById("q-" + qid); if (!card) return;
    var its = ITEMS.filter(function (x) { return x.qid === qid; }), done = its.filter(function (x) { return REC.items[x.rid]; });
    var el = $(".q-mark", card), ok = done.filter(function (x) { return REC.items[x.rid].ok; }).length;
    if (!done.length) { el.textContent = ""; el.className = "q-mark"; return; }
    if (its.length === 1) { el.textContent = ok ? "○" : "✗"; el.className = "q-mark " + (ok ? "ok" : "ng"); }
    else { el.textContent = ok + "/" + its.length + " 對"; el.className = "q-mark " + (ok === its.length ? "ok" : "ng"); }
  }
  function record(ans, ok, extra) {
    var rid = ans.getAttribute("data-rid"), it = ITEM[rid];
    var rec = { ok: !!ok, conf: ans.dataset.conf, t: Date.now() };
    for (var k in extra) if (extra[k] != null && extra[k] !== "") rec[k] = extra[k];
    if (HINT[it.qid]) rec.h = HINT[it.qid];
    REC.items[rid] = rec; saveRec(); showDone(ans, rec);
  }

  /* ══════════ 事件 ══════════ */
  function onClick(e) {
    var t = e.target.closest("button, a"); if (!t || !root.contains(t)) return;
    var ans = t.closest(".ans"), card = t.closest(".q");
    if (t.classList.contains("opt") && ans && !ans.classList.contains("done")) {
      if (ans.getAttribute("data-multi") === "1") t.classList.toggle("sel");
      else { $$(".opt", ans).forEach(function (b) { b.classList.remove("sel"); }); t.classList.add("sel"); }
      $(".msg", ans).textContent = "";
      return;
    }
    if (t.parentNode.classList.contains("conf") && ans && !ans.classList.contains("done")) {
      ans.dataset.conf = t.getAttribute("data-c");
      $$(".conf button", ans).forEach(function (b) { b.classList.toggle("on", b === t); });
      $(".msg", ans).textContent = "";
      return;
    }
    if (t.classList.contains("go") && ans) {
      var kind = ans.getAttribute("data-kind"), msg = $(".msg", ans), it = ITEM[ans.getAttribute("data-rid")];
      if (kind === "choice" && !selOf(ans)) { msg.textContent = "先點選項。"; return; }
      if (!ans.dataset.conf) { msg.textContent = "先評一下：有把握、不確定，還是猜的？"; return; }
      if (kind === "choice") { var s = selOf(ans); record(ans, s === choiceSet(it.item), { a: s }); return; }
      t.disabled = true; msg.textContent = "";
      $$(".conf button", ans).forEach(function (b) { b.disabled = true; });
      $(".res", ans).innerHTML = '<div class="ans-show"><b>答案</b>　' + rich(it.item.answer) + '</div><div class="self-mark">對照之後自己標：<button type="button" class="btn mk" data-ok="1">○ 我答對了</button><button type="button" class="btn mk" data-ok="0">✗ 我答錯了</button></div>';
      fitWide($(".res", ans));
      return;
    }
    if (t.classList.contains("mk") && ans) {
      var ta = $("textarea.my", ans);
      record(ans, t.getAttribute("data-ok") === "1", { my: ta ? ta.value.trim().slice(0, 200) : "" });
      return;
    }
    if (t.classList.contains("redo") && ans) { resetAns(ans); return; }
    if (card && (t.classList.contains("tk") || t.classList.contains("ts"))) {
      var q = Q[card.getAttribute("data-qid")], isKey = t.classList.contains("tk");
      var pane = $(isKey ? ".q-key" : ".q-sol", card);
      if (!pane.dataset.done) { pane.innerHTML = isKey ? box({ style: "key", title: "破題點", body: [q.key] }) : solHtml(q); pane.dataset.done = 1; fitWide(pane); }
      pane.hidden = !pane.hidden; t.classList.toggle("open", !pane.hidden);
      if (!pane.hidden) {
        var answered = ITEMS.some(function (x) { return x.qid === q.qid && REC.items[x.rid]; });
        if (!answered && HINT[q.qid] !== "sol") HINT[q.qid] = isKey ? "key" : "sol";
      }
      return;
    }
    if (t.classList.contains("tp") && card) {
      var qq = Q[card.getAttribute("data-qid")], p = qq.parts[+t.getAttribute("data-p")], ps = t.nextElementSibling;
      if (!ps.dataset.done) { ps.innerHTML = '<div class="sol"><p class="sol-ans"><b>答案</b>　' + rich(p.answer) + "</p>" + blocks(p.solution) + "</div>"; ps.dataset.done = 1; fitWide(ps); }
      ps.hidden = !ps.hidden;
      if (!ps.hidden && !REC.items[qq.qid + "#" + (+t.getAttribute("data-p") + 1)] && !HINT[qq.qid]) HINT[qq.qid] = "sol";
      return;
    }
    if (t.classList.contains("fb") && card) { openFb(card, t.getAttribute("data-k")); return; }
    if (t.classList.contains("fb-send") && card) { sendFb(card); return; }
    if (t.classList.contains("fb-cancel") && card) { $(".fb-box", card).hidden = true; return; }
    if (t.classList.contains("concept-open")) {
      var c = t.nextElementSibling; c.classList.toggle("open");
      t.textContent = c.classList.contains("open") ? "收起觀念提要" : "展開觀念提要";
      if (c.classList.contains("open")) fitWide(c);
    }
  }

  /* ══════════ 回報 ══════════ */
  var SENT = {};
  function openFb(card, kind) {
    var fb = $(".fb-box", card), qid = card.getAttribute("data-qid");
    fb.hidden = false; fb.dataset.kind = kind;
    if (SENT[qid + "|" + kind]) { fb.innerHTML = '<span class="fb-done">已收到這則回報，謝謝！</span>'; return; }
    fb.innerHTML = "<div><b>" + (kind === "unclear" ? "詳解看不懂" : "題目有問題") + "</b>（" + esc(Q[qid].no) + "）　想多說一句的話寫在這裡（可以不填）：</div>" +
      '<input type="text" maxlength="200" class="fb-note" placeholder="' + (kind === "unclear" ? "例：第二步怎麼來的？" : "例：選項 (3) 好像打錯") + '">' +
      '<button type="button" class="btn pri fb-send">送出</button> <button type="button" class="lnk fb-cancel">取消</button> <span class="fb-st note-sm"></span>';
    var inp = $(".fb-note", fb); if (inp) inp.focus();
  }
  function sendFb(card) {
    var fb = $(".fb-box", card), qid = card.getAttribute("data-qid"), kind = fb.dataset.kind, C = window.ReflexCloud;
    var note = ($(".fb-note", fb).value || "").trim().slice(0, 200), st = $(".fb-st", fb), btn = $(".fb-send", fb);
    if (!C || !C.feedback) { st.textContent = "雲端還沒準備好，稍後再試。"; return; }
    btn.disabled = true; st.textContent = "送出中…";
    var doc = { page: "v2/" + CODE, id: qid, kind: kind };
    if (note) doc.note = note;
    C.feedback(doc).then(function () {
      SENT[qid + "|" + kind] = 1;
      fb.innerHTML = '<span class="fb-done">✓ 已收到，謝謝！老師會看到這則回報。</span>';
    }).catch(function (e) { btn.disabled = false; st.textContent = "⚠ 送出失敗：" + ((e && e.message) || "請稍後再試"); });
  }

  /* ══════════ 長公式：超出寬度的行內公式包一層可左右捲的框 ══════════ */
  function fitWide(el) {
    if (!el) return;
    $$(".katex", el).forEach(function (k) {
      if (k.closest(".katex-display") || k.parentNode.classList.contains("kx-scroll")) return;
      var box = k.parentNode; while (box && getComputedStyle(box).display === "inline") box = box.parentNode;
      if (!box || !box.clientWidth || k.offsetWidth <= box.clientWidth) return;
      var w = document.createElement("span"); w.className = "kx-scroll"; k.parentNode.insertBefore(w, k); w.appendChild(k);
    });
  }

  /* ══════════ 進度與弱節點處方 ══════════ */
  function stats() {
    var by = {}, T = { n: 0, d: 0, ok: 0, hc: 0, g: 0, hint: 0 };
    D.nodes.forEach(function (n) { by[n.id] = { n: 0, d: 0, ok: 0, hc: 0, g: 0, wrong: [] }; });
    ITEMS.forEach(function (it) {
      var s = by[it.node] || (by[it.node] = { n: 0, d: 0, ok: 0, hc: 0, g: 0, wrong: [] }), r = REC.items[it.rid];
      s.n++; T.n++;
      if (!r) return;
      s.d++; T.d++;
      if (r.ok) { s.ok++; T.ok++; if (r.conf === "l") { s.g++; T.g++; } if (r.h) T.hint++; }
      else { s.wrong.push(it); if (r.conf === "h") { s.hc++; T.hc++; } }
    });
    return { by: by, T: T };
  }
  function updateCounts() {
    var S = stats(), b = document.getElementById("btnProg");
    if (b) $(".cnt", b).textContent = S.T.d + "/" + S.T.n;
    $$(".node-nav a[data-nav]").forEach(function (a) {
      var s = S.by[a.getAttribute("data-nav")]; $(".pct", a).textContent = s && s.d ? Math.round(100 * s.ok / s.d) + "%" : "";
    });
  }
  var KPIDX = null;
  function kpIndex() {
    if (KPIDX) return KPIDX;
    var main = {}, any = {}, names = {};
    var T = window.KP_TOOLS || {};
    Object.keys(T).forEach(function (path) {
      (T[path] || []).forEach(function (c, i) { (any[c] = any[c] || []).push(path); if (!i) (main[c] = main[c] || []).push(path); });
    });
    ((window.KP && window.KP.codes) || []).forEach(function (c) { names[c.id] = c.n; });
    return (KPIDX = { main: main, any: any, names: names });
  }
  function toolLink(path) {
    var s = path.split("/"), d = s[0], t = s[1], x = s.slice(2).join("/");
    return '<a href="' + TOOLMAP + "#d=" + encodeURIComponent(d) + "&t=" + encodeURIComponent(t) + "&x=" + encodeURIComponent(x) + '" target="_blank" rel="noopener">' + esc(x) + "</a>";
  }
  function practiceLinks(code) {
    var P = window.KP_PRACTICE || {}, TI = window.KP_PRACTICE_TITLES || {}, NM = window.KP_PRACTICE_NAMES || {}, hits = [];
    Object.keys(P).forEach(function (ch) {
      Object.keys(P[ch]).forEach(function (key) {
        var list = P[ch][key] || [];
        if (list.indexOf(code) >= 0) hits.push({ ch: ch, key: key, primary: list[0] === code, gen: /^L[0123]\./.test(key), core: !/^L0\./.test(key) });
      });
    });
    hits.sort(function (a, b) { return (b.primary - a.primary) || (b.gen - a.gen) || (b.core - a.core); });   /* L0 是先備題，排在本章題型之後 */
    var base = (window.KP && window.KP.practiceSite) || PRACTICE;
    return hits.slice(0, 2).map(function (h) {
      var anchor = h.gen ? "#c-" + h.key : "#" + h.key;
      return '<a href="' + esc(base + "handouts/" + h.ch + "/practice.html" + anchor) + '" target="_blank" rel="noopener">' + esc((NM[h.ch] || h.ch) + "・" + ((TI[h.ch] && TI[h.ch][h.key]) || h.key)) + "</a>";
    });
  }
  function rxHtml(nd, s) {
    var h = '<div class="rx"><div class="rx-h">' + esc(nd.id + " " + nd.title) + "　答對 " + s.ok + "/" + s.d + (s.hc ? "・有把握卻錯 " + s.hc : "") + "</div><ul>";
    h += '<li>先回頭讀 <a href="#node-' + esc(nd.id) + '" class="pg-go">' + esc(nd.id) + " 的觀念提要</a>" +
      (s.wrong.length ? "，再重做錯的題：" + s.wrong.slice(0, 6).map(function (it) { return '<a href="#q-' + esc(it.qid) + '" class="pg-go">' + esc(it.no) + "</a>"; }).join("、") : "") + "（先看破題點、不看詳解）。</li>";
    var I = kpIndex();
    (nd.kp || []).forEach(function (c) {
      var tools = (I.main[c] || I.any[c] || []).slice(0, 3), pr = practiceLinks(c);
      h += '<li><span class="kpn">考點 ' + esc(c) + (I.names[c] ? " " + esc(I.names[c]) : "") + "</span>：" +
        (tools.length ? "工具地圖 " + tools.map(toolLink).join("、") + "｜" : "") +
        '<a href="' + REFLEX + "?kp=" + encodeURIComponent(c) + '" target="_blank" rel="noopener">⚔️ 直覺道場練反射</a>' +
        (pr.length ? "｜練習本 " + pr.join("、") : "") + "</li>";
    });
    return h + "</ul></div>";
  }
  function progHtml() {
    var S = stats(), T = S.T, h = '<div class="prog-card"><h2>📊 我的進度・' + esc(D.unit) + '<button type="button" class="btn x pg-close">關閉</button></h2>';
    h += '<p class="pg-sum">本單元共 <b>' + T.n + "</b> 題（題組逐小題算），做了 <b>" + T.d + "</b> 題，答對 <b>" + T.ok + "</b> 題" + (T.d ? "（" + Math.round(100 * T.ok / T.d) + "%）" : "") + "。</p>";
    if (!T.d) h += '<p class="pg-flag">還沒有紀錄。每題作答後會自動記在這台裝置（登入後跨裝置同步）。建議從第一個節點的<b>隨堂類題</b>開始；卡住就先按「💡 破題點」。</p>';
    if (T.hc) h += '<p class="pg-flag hc">⚠ 有把握卻答錯 <b>' + T.hc + "</b> 題——以為會、其實還沒會，這些最值得先回頭看。</p>";
    if (T.g) h += '<p class="pg-flag">猜對 ' + T.g + " 題：答對了，但還不算會。</p>";
    if (T.hint) h += '<p class="pg-flag">看過破題點或詳解之後才答對 ' + T.hint + " 題：這是在學，很好；過幾天不看提示再做一次，才算真的會。</p>";
    h += table(["節點", "做了", "答對率"], D.nodes.map(function (nd) {
      var s = S.by[nd.id], r = s.d ? s.ok / s.d : 0;
      return [{ html: '<a href="#node-' + esc(nd.id) + '" class="pg-go">' + esc(nd.id) + "</a> " + rich(nd.title) }, s.d + "/" + s.n,
        { html: s.d ? '<span class="bar ' + (r < .6 ? "lo" : r < .8 ? "mid" : "") + '"><i style="width:' + Math.round(100 * r) + '%"></i></span>' + Math.round(100 * r) + "%" : '<span class="note-sm">還沒做</span>' }];
    }), "pg-tbl");
    var weak = D.nodes.filter(function (nd) { var s = S.by[nd.id]; return s.d && (s.ok / s.d < 0.7 || s.hc); })
      .sort(function (a, b) { var x = S.by[a.id], y = S.by[b.id]; return (x.ok / x.d) - (y.ok / y.d) || y.hc - x.hc; });
    if (weak.length) {
      h += '<div class="sub-h">弱節點處方<small>答對率低於 70%，或有「有把握卻錯」</small></div>' + weak.map(function (nd) { return rxHtml(nd, S.by[nd.id]); }).join("");
      if (!window.KP_TOOLS) h += '<p class="note-sm">（考點對照表還沒載入，只列節點；重新整理後會補上工具地圖與道場連結。）</p>';
    } else if (T.d) h += '<p class="pg-flag">目前沒有弱節點。' + (T.d < T.n ? "還有 " + (T.n - T.d) + " 題沒做，挑還沒做過的節點往下練。" : "整個單元都做完了！過幾天挑錯過的題再做一次。") + "</p>";
    var untouched = D.nodes.filter(function (nd) { return !S.by[nd.id].d; });
    if (T.d && untouched.length) h += '<p class="pg-flag">還沒碰的節點：' + untouched.map(function (nd) { return '<a href="#node-' + esc(nd.id) + '" class="pg-go">' + esc(nd.id + " " + nd.title) + "</a>"; }).join("、") + "</p>";
    h += '<div class="pg-foot"><button type="button" class="btn pg-clear">清除本單元紀錄</button><span class="note-sm">紀錄存在這台裝置；登入後會同步到帳號。</span></div></div>';
    return h;
  }
  function openProg() {
    var p = document.getElementById("progPanel");
    p.innerHTML = progHtml(); p.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeProg() { var p = document.getElementById("progPanel"); p.hidden = true; document.body.style.overflow = ""; }
  function bindChrome() {
    var bp = document.getElementById("btnProg"); if (bp) bp.onclick = openProg;
    var pp = document.getElementById("progPanel");
    pp.addEventListener("click", function (e) {
      var t = e.target;
      if (t === pp || t.classList.contains("pg-close")) { closeProg(); return; }
      if (t.classList.contains("pg-go")) { closeProg(); return; }       /* 讓連結照常跳到錨點 */
      if (t.classList.contains("pg-clear")) {
        if (!confirm("確定清除「" + D.unit + "」的全部作答紀錄？（登入時雲端那份也會被這份空紀錄覆蓋）")) return;
        REC = { v: 1, items: {} }; saveRec();
        $$(".ans.done", root).forEach(resetAns); Object.keys(Q).forEach(markCard); openProg();
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pp.hidden) closeProg(); });
    var bv = document.getElementById("btnView");
    function applyView(v) {
      document.body.classList.toggle("qonly", v === "q");
      if (bv) { bv.classList.toggle("on", v === "q"); bv.textContent = v === "q" ? "只做題 ✓" : "只做題"; bv.title = v === "q" ? "目前收起觀念提要；再按一次恢復完整講義" : "收起觀念提要，只留題目"; }
    }
    var view = "full"; try { view = localStorage.getItem(VIEW_KEY) || "full"; } catch (e) {}
    applyView(view);
    if (bv) bv.onclick = function () { view = view === "q" ? "full" : "q"; try { localStorage.setItem(VIEW_KEY, view); } catch (e) {} applyView(view); };
  }

  /* ══════════ 啟動 ══════════ */
  function start(data) {
    D = data; REC = loadRec();
    ["intro", "exam_map", "nodes", "mixed", "supplement"].forEach(function (k) { D[k] = D[k] || []; });
    D.practice = D.practice || {}; D.links = D.links || {};
    D.nodes.forEach(function (nd) { nd.examples = nd.examples || []; nd.drill = nd.drill || []; nd.kp = nd.kp || []; nd.examples.concat(nd.drill).forEach(register); });
    TIERS.forEach(function (t) { (D.practice[t[0]] || []).forEach(register); });
    D.mixed.forEach(register);
    render();
    root.addEventListener("click", onClick);
    $$(".ans", root).forEach(function (ans) { var r = REC.items[ans.getAttribute("data-rid")]; if (r && r.conf) showDone(ans, r); });
    bindChrome(); updateCounts();
    fitWide(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitWide(root); });   /* KaTeX 字型載入後寬度會變，再量一次 */
    if (location.hash) { var el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) el.scrollIntoView(); }
    if (window.ReflexCloud && window.ReflexCloud.ready) window.ReflexCloud.ready.then(function (ok) { if (ok) document.body.classList.add("cloud-on"); });
  }
  function fail(msg) { root.innerHTML = '<p class="loading">⚠ ' + esc(msg) + "</p>"; }
  function boot() {
    if (!window.katex) { fail("數學排版元件（KaTeX）沒有載入，請重新整理。"); return; }
    if (window.V2_UNIT) { start(window.V2_UNIT); return; }
    fetch("../data/" + CODE + ".json?v=" + (document.body.getAttribute("data-v") || "")).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(start).catch(function () {
      /* file:// 直接開檔時 fetch 會被擋：改載同內容的 .js 版 */
      var s = document.createElement("script"); s.src = "../data/" + CODE + ".js?v=" + (document.body.getAttribute("data-v") || "");
      s.onload = function () { if (window.V2_UNIT) start(window.V2_UNIT); else fail("讀不到單元資料。"); };
      s.onerror = function () { fail("讀不到單元資料（data/" + CODE + ".json）。"); };
      document.head.appendChild(s);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
