/* 高中數學（道場、練習本、線上講義）的雲端設定（Firebase）——與國中版共用同一個專案 niufutzu-jh，高中資料加 hs_ 前綴
 *
 * 把 Firebase 主控台給的 firebaseConfig 貼在下面（步驟見 firebase/SETUP.md）。
 * 這組 apiKey 是「網頁用的公開金鑰」，放在前端是 Firebase 的正常用法，
 * 真正的權限由 Firestore 安全規則（firebase/firestore.rules）控制。
 *
 * 保持 null 時，道場照常可玩，只是沒有登入與排行榜。
 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCAhkU8voKqQ1zmaDG08H_JRdDtvtAOors",
  authDomain: "niufutzu-jh.firebaseapp.com",
  projectId: "niufutzu-jh",
  storageBucket: "niufutzu-jh.firebasestorage.app",
  messagingSenderId: "720189351439",
  appId: "1:720189351439:web:ed6b5a849a9493d720e57a"
};

/* 貼上後長這樣（範例，請換成自己專案的）：
window.FIREBASE_CONFIG = {
  apiKey: "AIza....",
  authDomain: "xxxx.firebaseapp.com",
  projectId: "xxxx",
  storageBucket: "xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
*/
