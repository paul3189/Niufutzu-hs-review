/* 學測複習講義 v2 線上版 — 付費單元的預覽頁（由 build_web.py --public 產生的 u/<碼>.html 用）
 *
 * 只渲染考點地圖與節點清單／題數，不含任何題目、答案、詳解、圖片。
 * 資料來自頁面內嵌的 window.V2_PREVIEW（不是外部 data/<碼>.json，避免被整批讀走）。
 * 數學排版與 v2.js 同一套寫法（直接呼叫 katex.renderToString，不經 auto-render）。
 */
(function () {
  "use strict";
  var D = window.V2_PREVIEW;
  var root = document.getElementById("unit-root");
  var HEAT = { "高": "★★★", "中": "★★☆", "低": "★☆☆" };

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  var TOK = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\*\*[\s\S]+?\*\*)/;
  function tex(t, disp) {
    if (!window.katex) return "<code>" + esc(t) + "</code>";
    t = String(t).replace(/✓/g, "\\checkmark").replace(/、/g, ",\\ ");
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
    /* type === "image" 不會出現在這裡：build_web.py 產生預覽資料時已經把圖片區塊拿掉了 */
    return "<p>" + rich(b.text || "") + "</p>";
  }
  function table(header, rows, cls) {
    var h = '<div class="tbl-wrap"><table class="v2-tbl ' + (cls || "") + '">';
    if (header) h += "<tr>" + header.map(function (x) { return "<th>" + rich(x) + "</th>"; }).join("") + "</tr>";
    (rows || []).forEach(function (r) { h += "<tr>" + r.map(function (x) { return "<td>" + (x && x.html ? x.html : rich(String(x))) + "</td>"; }).join("") + "</tr>"; });
    return h + "</table></div>";
  }
  var BOX = { key: "★ ", warn: "", niu: "牛夫子", alt: "", supp: "＋ 補充", link: "⇄ 串聯" };
  function box(b) {
    var st = BOX[b.style] ? b.style : "key", title = b.title || "", head;
    if (st === "niu" || st === "supp" || st === "link") {
      title = title.replace(/^(牛夫子|補充|串聯)\s*[：:・]?\s*/, "");
      head = BOX[st] + (title ? "・" + rich(title) : "");
    } else head = BOX[st] + rich(title);
    /* 串聯框在完整單元頁會連到別的單元／節點；預覽頁沒有那份索引，這裡只顯示內容，不做連結（不會洩漏，只是沒有超連結）。 */
    return '<div class="bx bx-' + st + '"><div class="bx-h">' + head + "</div>" + blocks(b.body) + "</div>";
  }

  function render() {
    if (!D || !root) return;
    var h = '<div class="intro">' + blocks(D.intro) + "</div>";
    if (D.exam_map && D.exam_map.length) {
      h += '<h2 class="sec-bar" id="map"><span class="sb-l">考點地圖</span><span class="sb-t">近五年學測數A（111–115）怎麼考「' + esc(D.unit) + '」</span></h2>';
      h += table(["節點", "熱度", "出現（年份）", "配分", "近年怎麼考"], D.exam_map.map(function (m) {
        return [{ html: "<b>" + esc(m.node || "") + "</b>　" + rich(m.title || "") }, HEAT[m.heat] || "", (m.exam || []).join("、") || "—", m.points == null ? "" : String(m.points), m.note || ""];
      }), "map-tbl");
    }
    if (D.nodes && D.nodes.length) {
      h += '<h2 class="sec-bar soft" id="nodes"><span class="sb-l">節點</span><span class="sb-t">節點清單與題數</span></h2>';
      h += table(["節點", "標題", "熱度", "題數"], D.nodes.map(function (n) {
        return [{ html: "<b>" + esc(n.id || "") + "</b>" }, rich(n.title || ""), HEAT[n.heat] || "", String(n.count || 0)];
      }), "map-tbl");
    }
    root.innerHTML = h;
  }

  if (!window.katex) { if (root) root.innerHTML = '<p class="loading">數學排版元件（KaTeX）沒有載入，請重新整理。</p>'; }
  else render();
})();
