/* 牛夫子高中數學 — 雲端（Firebase）：Email 登入、道場成績與排行榜、道場錯題本、練習本紀錄同步、回饋回報
 *
 * 對外只暴露 window.ReflexCloud；reflex.js／練習本／線上講義只跟它講話，不直接碰 Firebase。
 * 沒有設定（assets/firebase-config.js 的 FIREBASE_CONFIG 為 null）或載入失敗時，
 * ReflexCloud.ready 會解析成 false，所有雲端功能自動隱藏，頁面本身不受影響。
 *
 * 與國中版共用同一個 Firebase 專案（niufutzu-jh），高中的資料一律加 hs_ 前綴，不會混在一起：
 *   users/{uid}                              { nick, email, updatedAt }（兩版共用，一個人一個暱稱）
 *   hs_boards/{boardId}/entries/{uid}        道場排行榜，一人一筆最佳成績；boardId = all_s10 或 w2026-39_s10
 *   hs_runs/{autoId}                         道場每一場（老師在主控台看；學生讀不到）
 *   users/{uid}/hs_wrong/{key}               道場錯題本：{ key, cat, ch, kp, q, ans, tip, stage, due, hist:[…], done, ts }
 *   users/{uid}/hs_practice/{ch}             分級練習本的紀錄（就是 localStorage 的 pgen_rec_<章> 整包）{ rec, ts }
 *   hs_feedback/{autoId}                     學生回報（詳解看不懂／題目有問題…）{ uid?, page, id, kind, note, ts }
 *
 * 登入方式：Email 連結（免密碼）。在網址加 ?cloud=mock 會改用記憶體假後端，方便沒有網路時試畫面。
 */
(function () {
  "use strict";

  var SDK = "https://www.gstatic.com/firebasejs/11.6.0/";
  var DIFFS = ["s20", "s15", "s10", "s5", "s3"];
  var EMAIL_KEY = "hsmath.cloud.email";
  var TOP = 30, RANK_SCAN = 100;
  var P = "hs_";                                   /* 集合前綴 */

  function weekKey(now) {
    var d = new Date(now || Date.now());
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    var y = t.getUTCFullYear();
    var w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
    return "w" + y + "-" + (w < 10 ? "0" : "") + w;
  }
  function boardId(kind, diff) { return (kind === "week" ? weekKey() : "all") + "_" + diff; }
  var SUM = "sum";
  function mergeBoards(lists) {
    var by = {};
    lists.forEach(function (rows) {
      rows.forEach(function (x) {
        var o = by[x.uid] || (by[x.uid] = { uid: x.uid, nick: x.nick, score: 0, plays: 0, levels: 0 });
        o.score += x.score || 0; o.plays += x.plays || 0; o.levels++;
        if (x.nick) o.nick = x.nick;
      });
    });
    return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.score - a.score; });
  }
  function cleanNick(s) { return String(s || "").replace(/[<>&"'\u0000-\u001f]/g, "").trim().slice(0, 12); }
  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
  function defaultNick(email) { return cleanNick(String(email || "").split("@")[0]) || "牛夫子學徒"; }
  /* 錯題本文件 id 不能含 "/"；題目 key 本來是 "cat|題幹"，題幹可能很長，一律縮成安全字串 */
  function safeId(key) {
    var s = String(key || "").replace(/[\/#?\[\]]/g, "_");
    if (s.length <= 120) return s;
    var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return s.slice(0, 90) + "~" + h.toString(36);
  }

  var listeners = [];
  var state = { user: null, nick: "", mode: null };
  function emit() { listeners.forEach(function (f) { try { f(state.user, state.nick); } catch (e) {} }); }

  var api = {
    weekKey: weekKey, boardId: boardId, cleanNick: cleanNick, validEmail: validEmail, safeId: safeId,
    onAuth: function (f) { listeners.push(f); if (state.mode) f(state.user, state.nick); },
    user: function () { return state.user; },
    nick: function () { return state.nick; },
    mode: function () { return state.mode; },
    rememberedEmail: function () { try { return localStorage.getItem(EMAIL_KEY) || ""; } catch (e) { return ""; } }
  };
  window.ReflexCloud = api;

  /* ══════════ 記憶體假後端（?cloud=mock） ══════════ */
  function mockBackend() {
    var db = { users: {}, boards: {}, runs: [], wrong: {}, practice: {}, feedback: [] };
    var uid = "mock-me";
    ["小明", "阿華", "小美", "大雄", "靜香"].forEach(function (n, i) {
      DIFFS.forEach(function (d) {
        ["all", "week"].forEach(function (k) {
          var b = db.boards[boardId(k, d)] = db.boards[boardId(k, d)] || {};
          b["mock-" + i] = { uid: "mock-" + i, nick: n, score: 1200 + i * 730 + DIFFS.indexOf(d) * 90,
            acc: 60 + i * 8, combo: 3 + i, avg: (5 - i * 0.6).toFixed(2), diff: d, scope: "學測範圍",
            ts: Date.now() - i * 864e5, plays: 1 + i * 2 };
        });
      });
    });
    function top(id) { return Object.keys(db.boards[id] || {}).map(function (k) { return db.boards[id][k]; }).sort(function (a, b) { return b.score - a.score; }); }
    return {
      init: function () { state.mode = "mock"; state.user = null; emit(); return Promise.resolve(true); },
      sendLink: function (email) { try { localStorage.setItem(EMAIL_KEY, email); } catch (e) {} return Promise.resolve(); },
      finishLink: function () { return Promise.resolve(false); },
      mockLogin: function () {
        state.user = { uid: uid, email: api.rememberedEmail() || "me@example.com" };
        state.nick = (db.users[uid] && db.users[uid].nick) || defaultNick(state.user.email);
        emit();
      },
      signOut: function () { state.user = null; state.nick = ""; emit(); return Promise.resolve(); },
      setNick: function (n) {
        db.users[uid] = { nick: n };
        Object.keys(db.boards).forEach(function (id) { if (db.boards[id][uid]) db.boards[id][uid].nick = n; });
        state.nick = n; emit(); return Promise.resolve();
      },
      submit: function (run) {
        db.runs.push(run);
        var out = {};
        ["all", "week"].forEach(function (k) {
          var id = boardId(k, run.diff), b = db.boards[id] = db.boards[id] || {};
          var old = b[uid], improved = !old || run.score > old.score, plays = ((old && old.plays) || 0) + 1;
          b[uid] = improved ? Object.assign({}, run, { uid: uid, nick: state.nick, plays: plays }) : Object.assign({}, old, { plays: plays });
          var rows = top(id);
          out[k] = { improved: improved, best: b[uid].score, plays: plays, rank: rows.findIndex(function (r) { return r.uid === uid; }) + 1, total: rows.length };
        });
        return Promise.resolve(out);
      },
      board: function (kind, diff) {
        if (diff === SUM) {
          var all = mergeBoards(DIFFS.map(function (d) { return top(boardId(kind, d)); }));
          return Promise.resolve({ rows: all.slice(0, TOP), sum: true, myUid: uid, me: all.filter(function (x) { return x.uid === uid; })[0] || null });
        }
        var rows = top(boardId(kind, diff)).slice(0, TOP);
        return Promise.resolve({ rows: rows, me: (db.boards[boardId(kind, diff)] || {})[uid] || null, myUid: uid });
      },
      /* 錯題本 */
      wrongAdd: function (items) { items.forEach(function (w) { var id = safeId(w.key); db.wrong[id] = Object.assign({}, db.wrong[id] || {}, w, { id: id }); }); return Promise.resolve(items.length); },
      wrongList: function () { return Promise.resolve(Object.keys(db.wrong).map(function (k) { return db.wrong[k]; })); },
      wrongUpdate: function (id, patch) { if (db.wrong[id]) Object.assign(db.wrong[id], patch); return Promise.resolve(); },
      wrongRemove: function (id) { delete db.wrong[id]; return Promise.resolve(); },
      /* 練習本紀錄 */
      practiceSave: function (ch, rec) { db.practice[ch] = { rec: rec, ts: Date.now() }; return Promise.resolve(); },
      practiceLoad: function (ch) { return Promise.resolve(db.practice[ch] || null); },
      practiceAll: function () { return Promise.resolve(db.practice); },
      /* 回饋 */
      feedback: function (doc) { db.feedback.push(doc); return Promise.resolve(); }
    };
  }

  /* ══════════ 真的 Firebase ══════════ */
  function firebaseBackend(cfg) {
    var A, F, auth, fs;
    function load() {
      return Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + "firebase-firestore.js")])
        .then(function (m) {
          A = m[1]; F = m[2];
          var app = m[0].initializeApp(cfg);
          auth = A.getAuth(app); fs = F.getFirestore(app);
          A.setPersistence(auth, A.browserLocalPersistence).catch(function () {});
        });
    }
    function userDoc(uid) { return F.doc(fs, "users", uid); }
    function entryDoc(id, uid) { return F.doc(fs, P + "boards", id, "entries", uid); }
    function need() { var u = state.user; if (!u) return Promise.reject(new Error("not signed in")); return Promise.resolve(u); }
    function loadNick(u) {
      return F.getDoc(userDoc(u.uid)).then(function (s) {
        var n = s.exists() ? (s.data().nick || "") : "";
        if (n) { state.nick = n; return; }
        n = defaultNick(u.email);
        return F.setDoc(userDoc(u.uid), { nick: n, email: u.email, updatedAt: F.serverTimestamp() }, { merge: true }).then(function () { state.nick = n; });
      }).catch(function () { state.nick = ""; });
    }
    function rank(id, uid) {
      var q = F.query(F.collection(fs, P + "boards", id, "entries"), F.orderBy("score", "desc"), F.limit(RANK_SCAN));
      return F.getDocs(q).then(function (s) { var i = s.docs.findIndex(function (d) { return d.id === uid; }); return { rank: i + 1, total: s.size }; });
    }

    return {
      init: function () {
        return load().then(function () {
          state.mode = "firebase";
          return new Promise(function (resolve) {
            var first = true;
            A.onAuthStateChanged(auth, function (u) {
              state.user = u ? { uid: u.uid, email: u.email } : null;
              (u ? loadNick(u) : Promise.resolve(state.nick = "")).then(function () { emit(); if (first) { first = false; resolve(true); } });
            });
          });
        });
      },
      sendLink: function (email) {
        try { localStorage.setItem(EMAIL_KEY, email); } catch (e) {}
        return A.sendSignInLinkToEmail(auth, email, { url: location.origin + location.pathname, handleCodeInApp: true });
      },
      finishLink: function (emailFromUser) {
        if (!A.isSignInWithEmailLink(auth, location.href)) return Promise.resolve(false);
        var email = emailFromUser || api.rememberedEmail();
        if (!email) return Promise.resolve("need-email");
        return A.signInWithEmailLink(auth, email, location.href).then(function () {
          try { localStorage.setItem(EMAIL_KEY, email); } catch (e) {}
          history.replaceState(null, "", location.origin + location.pathname);
          return "done";
        });
      },
      signOut: function () { return A.signOut(auth); },
      setNick: function (n) {
        return need().then(function (u) {
          return F.setDoc(userDoc(u.uid), { nick: n, email: u.email, updatedAt: F.serverTimestamp() }, { merge: true }).then(function () {
            state.nick = n; emit();
            var ids = []; DIFFS.forEach(function (d) { ids.push(boardId("all", d), boardId("week", d)); });
            return Promise.all(ids.map(function (id) { return F.updateDoc(entryDoc(id, u.uid), { nick: n }).catch(function () {}); }));
          });
        });
      },
      submit: function (run) {
        var u = state.user;
        if (!u || !state.nick) return Promise.reject(new Error("not signed in"));
        var base = { uid: u.uid, nick: state.nick, score: run.score, acc: run.acc, combo: run.combo, avg: run.avg, diff: run.diff, scope: run.scope };
        var out = {};
        return F.addDoc(F.collection(fs, P + "runs"), Object.assign({ week: weekKey(), email: u.email, ts: F.serverTimestamp(), perKp: run.perKp || null }, base))
          .catch(function () {})
          .then(function () {
            return Promise.all(["all", "week"].map(function (k) {
              var id = boardId(k, run.diff), ref = entryDoc(id, u.uid);
              return F.getDoc(ref).then(function (s) {
                var old = s.exists() ? s.data() : null;
                var improved = !old || run.score > old.score, plays = ((old && old.plays) || 0) + 1;
                var next = improved ? Object.assign({}, base, { ts: F.serverTimestamp(), plays: plays }) : Object.assign({}, old, { nick: state.nick, plays: plays });
                return F.setDoc(ref, next).then(function () { return rank(id, u.uid); }).then(function (r) {
                  out[k] = { improved: improved, plays: plays, best: improved ? run.score : old.score, rank: r.rank, total: r.total };
                });
              });
            }));
          }).then(function () { return out; });
      },
      board: function (kind, diff) {
        var uid = state.user ? state.user.uid : null;
        if (diff === SUM) {
          return Promise.all(DIFFS.map(function (d) {
            var q = F.query(F.collection(fs, P + "boards", boardId(kind, d), "entries"), F.orderBy("score", "desc"), F.limit(RANK_SCAN));
            return F.getDocs(q).then(function (s) { return s.docs.map(function (x) { return x.data(); }); });
          })).then(function (lists) {
            var all = mergeBoards(lists);
            return { rows: all.slice(0, TOP), sum: true, myUid: uid, me: all.filter(function (x) { return x.uid === uid; })[0] || null };
          });
        }
        var id = boardId(kind, diff);
        var q = F.query(F.collection(fs, P + "boards", id, "entries"), F.orderBy("score", "desc"), F.limit(TOP));
        var me = uid ? F.getDoc(entryDoc(id, uid)).then(function (s) { return s.exists() ? s.data() : null; }) : Promise.resolve(null);
        return Promise.all([F.getDocs(q), me]).then(function (r) { return { rows: r[0].docs.map(function (d) { return d.data(); }), me: r[1], myUid: uid }; });
      },

      /* ── 道場錯題本（users/{uid}/hs_wrong/{id}）── */
      wrongAdd: function (items) {
        return need().then(function (u) {
          var batch = F.writeBatch(fs);
          items.forEach(function (w) {
            var id = safeId(w.key);
            batch.set(F.doc(fs, "users", u.uid, P + "wrong", id), Object.assign({}, w, { id: id, ts: F.serverTimestamp() }), { merge: true });
          });
          return batch.commit().then(function () { return items.length; });
        });
      },
      wrongList: function () {
        return need().then(function (u) {
          return F.getDocs(F.collection(fs, "users", u.uid, P + "wrong")).then(function (s) { return s.docs.map(function (d) { return d.data(); }); });
        });
      },
      wrongUpdate: function (id, patch) {
        return need().then(function (u) { return F.setDoc(F.doc(fs, "users", u.uid, P + "wrong", id), patch, { merge: true }); });
      },
      wrongRemove: function (id) {
        return need().then(function (u) { return F.deleteDoc(F.doc(fs, "users", u.uid, P + "wrong", id)); });
      },

      /* ── 練習本紀錄同步（users/{uid}/hs_practice/{章}）── */
      practiceSave: function (ch, rec) {
        return need().then(function (u) { return F.setDoc(F.doc(fs, "users", u.uid, P + "practice", ch), { rec: JSON.stringify(rec), ts: F.serverTimestamp() }); });
      },
      practiceLoad: function (ch) {
        return need().then(function (u) {
          return F.getDoc(F.doc(fs, "users", u.uid, P + "practice", ch)).then(function (s) {
            if (!s.exists()) return null;
            var d = s.data(); var rec = null; try { rec = JSON.parse(d.rec); } catch (e) {}
            return { rec: rec, ts: d.ts && d.ts.toMillis ? d.ts.toMillis() : 0 };
          });
        });
      },
      practiceAll: function () {
        return need().then(function (u) {
          return F.getDocs(F.collection(fs, "users", u.uid, P + "practice")).then(function (s) {
            var out = {}; s.docs.forEach(function (d) { var x = d.data(); try { out[d.id] = { rec: JSON.parse(x.rec), ts: x.ts && x.ts.toMillis ? x.ts.toMillis() : 0 }; } catch (e) {} });
            return out;
          });
        });
      },

      /* ── 回饋（hs_feedback）：登入與否都可以送 ── */
      feedback: function (doc) {
        var u = state.user;
        return F.addDoc(F.collection(fs, P + "feedback"), Object.assign({ uid: u ? u.uid : null, ts: F.serverTimestamp() }, doc));
      }
    };
  }

  /* ══════════ 啟動 ══════════ */
  var useMock = /[?&]cloud=mock(&|$)/.test(location.search);
  var cfg = window.FIREBASE_CONFIG;
  var backend = useMock ? mockBackend() : (cfg && cfg.apiKey ? firebaseBackend(cfg) : null);

  api.ready = !backend ? Promise.resolve(false)
    : backend.init().then(function () {
        Object.keys(backend).forEach(function (k) { if (k !== "init") api[k] = backend[k]; });
        return true;
      }).catch(function (e) {
        if (window.console) console.warn("[reflex-cloud] 雲端啟動失敗，改用純本機模式：", e && e.message);
        state.mode = null;
        return false;
      });
})();
