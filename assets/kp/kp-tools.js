/* 工具地圖 → 考點代碼（自動檢查：node _audit/check_data.js、node _audit/check_kp.js）
 * 路徑 = 領域id/主題id/工具名（與 data/tm-*.js 逐字相同）；代碼見 data/kp.js。
 * 每個工具掛 1～2 個碼，主考點放第一個；判斷依據是工具實際在教什麼，不是它掛在哪個領域。
 * 2026-09-24 建立：343 個工具、51 個主題。tm 檔改工具名或增刪工具時，這裡要同步（check_kp.js 會抓）。
 */
window.KP_TOOLS = {
  /* ── number 數與式 ── */
  // number/setlogic 集合與邏輯
  "number/setlogic/集合的兩種表示法": ["N-04"],
  "number/setlogic/屬於 ∈ 與包含 ⊆": ["N-04"],
  "number/setlogic/子集個數": ["N-04"],
  "number/setlogic/交集、聯集、差集、餘集": ["N-04"],
  "number/setlogic/笛摩根定律": ["N-04"],
  "number/setlogic/取捨原理（文氏圖）": ["N-04","D-05"],
  "number/setlogic/命題的否定（全稱 ↔ 存在）": ["N-04"],
  "number/setlogic/逆、否、逆否命題": ["N-04"],
  "number/setlogic/充分條件與必要條件": ["N-04"],
  // number/real 實數與數線
  "number/real/數系家族樹": ["N-01"],
  "number/real/因數個數": ["N-01","D-05"],
  "number/real/循環小數化分數": ["N-01"],
  "number/real/根式化簡與分母有理化": ["N-05"],
  "number/real/√(a²)＝|a| 陷阱": ["N-05","N-02"],
  "number/real/雙重根號拆解": ["N-05"],
  "number/real/區間的表示法": ["N-01"],
  "number/real/高斯符號（floor）": ["N-01"],
  "number/real/稠密性（估算夾擠）": ["N-01"],
  // number/abs 絕對值
  "number/abs/定義（分段脫殼）": ["N-02"],
  "number/abs/距離解釋": ["N-02"],
  "number/abs/絕對值不等式（單一）": ["N-02"],
  "number/abs/兩點距離和的最小值": ["N-02"],
  "number/abs/兩點距離差的最大值": ["N-02"],
  "number/abs/三角不等式": ["N-02"],
  "number/abs/絕對值的運算性質": ["N-02"],
  "number/abs/含絕對值的方程式": ["N-02"],
  // number/exp 指數與根式
  "number/exp/指數律": ["E-01"],
  "number/exp/零與負指數": ["E-01"],
  "number/exp/分數指數與根式互換": ["E-01"],
  "number/exp/比較大小三步驟": ["E-01","E-04"],
  "number/exp/指數方程式（同底比較）": ["E-02"],
  "number/exp/指數型換元": ["E-02"],
  "number/exp/科學記號": ["E-01","E-06"],
  // number/log 對數
  "number/log/對數定義": ["E-04"],
  "number/log/對數律": ["E-04"],
  "number/log/換底公式": ["E-04"],
  "number/log/常用恆等式": ["E-04"],
  "number/log/位數判定": ["E-06"],
  "number/log/首位數字": ["E-06"],
  "number/log/小數位判定": ["E-06"],
  // number/poly 多項式
  "number/poly/除法原理": ["P-01"],
  "number/poly/餘式定理": ["P-01"],
  "number/poly/因式定理": ["P-02"],
  "number/poly/先試 f(1) 與 f(-1)": ["P-02"],
  "number/poly/綜合除法": ["P-01"],
  "number/poly/有理根定理": ["P-02"],
  "number/poly/根與係數（二次）": ["P-02"],
  "number/poly/根與係數（三次）": ["P-02"],
  "number/poly/勘根定理": ["P-02"],
  "number/poly/多項式相等（比較係數）": ["P-07"],
  "number/poly/係數和技巧": ["P-07","D-15"],
  // number/remainder 餘式的設法
  "number/remainder/① 總則：先決定餘式設幾次": ["P-01"],
  "number/remainder/② 除式為一次式 → 設常數": ["P-01"],
  "number/remainder/③ 除式可分解且無重根 → 代兩根": ["P-01"],
  "number/remainder/④ 除式有重根 → 連除兩次（微分法為補充）": ["P-01"],
  "number/remainder/⑤ 除式不可分解 → 代虛根": ["P-01"],
  "number/remainder/⑥ 合併兩個已知的餘式": ["P-01"],
  "number/remainder/⑦ 高次冪 → 降次代換": ["P-01"],
  "number/remainder/⑧ 除以 (x−a) 的高次方 → 泰勒式": ["P-01"],
  "number/remainder/⑨ 條件是係數關係 → 比較係數": ["P-01","P-07"],
  // number/complex 複數
  "number/complex/虛數單位與循環": ["N-03"],
  "number/complex/共軛複數性質": ["N-03"],
  "number/complex/實係數虛根成對": ["N-03","P-02"],
  "number/complex/複數的絕對值": ["N-03"],
  "number/complex/極式與棣美弗定理": ["N-03"],
  "number/complex/n 次方根（等分圓周）": ["N-03"],
  "number/complex/複數平面的幾何意義": ["N-03"],

  /* ── equation 方程式與不等式 ── */
  // equation/quad 二次方程式與判別式
  "equation/quad/公式解": ["P-04"],
  "equation/quad/判別式": ["P-04"],
  "equation/quad/配方法": ["P-03"],
  "equation/quad/由根造方程式": ["P-02"],
  "equation/quad/二次式恆正／恆負": ["P-04","P-06"],
  "equation/quad/實根的分布（圖形三條件）": ["P-04","P-03"],
  // equation/solve 高次・分式・根式方程式
  "equation/solve/因式分解四招": ["P-07"],
  "equation/solve/有理根＋綜合除法降次": ["P-02"],
  "equation/solve/換元法": ["P-02"],
  "equation/solve/分式方程式": ["P-07"],
  "equation/solve/根式方程式": ["N-05"],
  "equation/solve/對稱式降次": ["N-05","P-02"],
  // equation/ineq 不等式的解法
  "equation/ineq/一元二次不等式": ["P-06"],
  "equation/ineq/高次不等式符號表": ["P-06"],
  "equation/ineq/分式不等式": ["P-06"],
  "equation/ineq/根式不等式": ["P-06"],
  "equation/ineq/恆成立問題轉最值": ["P-06"],
  "equation/ineq/分離參數法": ["P-06"],
  // equation/estimate 不等式的估計工具
  "equation/estimate/算幾不等式（AM–GM）": ["N-05"],
  "equation/estimate/柯西不等式": ["G-05","N-05"],
  "equation/estimate/平方非負": ["N-05"],
  "equation/estimate/判別式法求值域": ["P-04"],
  "equation/estimate/三角不等式（絕對值／向量）": ["N-02","G-05"],
  // equation/linear 聯立方程式與行列式
  "equation/linear/二階行列式": ["G-10"],
  "equation/linear/克拉瑪公式": ["G-10"],
  "equation/linear/解的三種情況（二元）": ["G-10"],
  "equation/linear/幾何意義（兩直線）": ["G-10","G-01"],
  "equation/linear/三元一次與三階行列式": ["G-10"],
  "equation/linear/加減消去與矩陣列運算": ["G-10"],
  // equation/lp 線性規劃
  "equation/lp/可行域作圖": ["G-03","G-12"],
  "equation/lp/頂點檢驗法": ["G-12"],
  "equation/lp/平移法（斜率比較）": ["G-12"],
  "equation/lp/整數規劃的處理": ["G-12"],

  /* ── function 函數與圖形 ── */
  // function/fbasic 函數的基本概念
  "function/fbasic/定義域三大限制": ["P-08","E-05"],
  "function/fbasic/垂直線檢驗（是否為函數）": ["P-08"],
  "function/fbasic/水平線法：y=f(x) 與 y=k 的交點個數": ["P-08","P-05"],
  "function/fbasic/合成函數": ["P-08"],
  "function/fbasic/反函數": ["P-08","E-05"],
  "function/fbasic/奇函數與偶函數": ["P-05","T-06"],
  // function/quadf 一次與二次函數
  "function/quadf/標準式（頂點式）": ["P-03"],
  "function/quadf/一般式與頂點公式": ["P-03"],
  "function/quadf/交點式": ["P-03","P-02"],
  "function/quadf/限制區間的最值": ["P-06","P-03"],
  "function/quadf/圖形與判別式的關係": ["P-04","P-03"],
  // function/polyf 多項式函數的圖形
  "function/polyf/首項決定端點行為": ["P-05"],
  "function/polyf/根的重數與穿越": ["P-05"],
  "function/polyf/三次函數的對稱中心": ["P-05"],
  "function/polyf/三次方程式實根個數": ["P-05"],
  "function/polyf/平移消去二次項": ["P-05"],
  // function/explog 指數與對數函數
  "function/explog/指數函數的圖形": ["E-03"],
  "function/explog/對數函數的圖形": ["E-05"],
  "function/explog/指對不等式的方向": ["E-03","E-05"],
  "function/explog/指數成長／衰減模型": ["E-03"],
  "function/explog/取對數解指數方程式": ["E-02","E-04"],
  // function/transform 圖形的變換
  "function/transform/平移": ["P-03","T-06"],
  "function/transform/伸縮": ["T-06"],
  "function/transform/對稱變換": ["E-03"],
  "function/transform/絕對值套在外面": ["N-02","P-03"],
  "function/transform/絕對值套在裡面": ["N-02"],
  // function/maxmin 最大最小值策略表
  "function/maxmin/代入消元": ["P-03"],
  "function/maxmin/① 配方法": ["P-03"],
  "function/maxmin/② 算幾不等式": ["N-05"],
  "function/maxmin/③ 柯西不等式": ["G-05","N-05"],
  "function/maxmin/④ 判別式法": ["P-04"],
  "function/maxmin/⑤ 微分（一階導數）": ["C-03"],
  "function/maxmin/⑥ 幾何解釋": ["G-01"],
  "function/maxmin/⑦ 端點與單調性": ["P-06"],

  /* ── trig 三角 ── */
  // trig/def 三角比的定義
  "trig/def/直角三角形定義": ["T-01"],
  "trig/def/單位圓（廣義角）定義": ["T-02"],
  "trig/def/象限符號口訣": ["T-02"],
  "trig/def/特殊角的三角比": ["T-01"],
  "trig/def/參考角化簡": ["T-02"],
  "trig/def/弧度與角度互換": ["T-02"],
  "trig/def/弧長與扇形面積": ["T-02"],
  "trig/def/斜角與斜率": ["G-01","T-02"],
  "trig/def/極坐標": ["T-02"],
  // trig/identity 三角恆等式
  "trig/identity/平方關係": ["T-01"],
  "trig/identity/和差角公式": ["T-04"],
  "trig/identity/正切和差角": ["T-04"],
  "trig/identity/倍角公式": ["T-04"],
  "trig/identity/半角（降次）公式": ["T-04"],
  "trig/identity/和差化積／積化和差（補充）": ["T-04"],
  "trig/identity/萬能公式（補充）": ["T-04"],
  // trig/solvetri 解三角形
  "trig/solvetri/正弦定理": ["T-03"],
  "trig/solvetri/餘弦定理": ["T-03"],
  "trig/solvetri/正射影定理": ["T-03"],
  "trig/solvetri/三角形面積公式群": ["T-03"],
  "trig/solvetri/坐標下的面積": ["T-03","G-05"],
  "trig/solvetri/中線與角平分線": ["T-03"],
  "trig/solvetri/三角形的內角關係": ["T-03","T-04"],
  "trig/solvetri/三角形形狀判斷（銳角／直角／鈍角）": ["T-03"],
  // trig/graph 三角函數的圖形與疊合
  "trig/graph/基本圖形與週期": ["T-06"],
  "trig/graph/標準形與四參數": ["T-06"],
  "trig/graph/正弦疊合": ["T-05"],
  "trig/graph/三角函數的值域": ["T-06"],
  "trig/graph/換元求三角式最值": ["T-06","P-03"],
  "trig/graph/週期性模型": ["T-06"],
  // trig/trigeq 三角方程式與不等式
  "trig/trigeq/統一角與函數": ["T-07","T-04"],
  "trig/trigeq/基本解與通解": ["T-07"],
  "trig/trigeq/區間伸縮的陷阱": ["T-07"],
  "trig/trigeq/三角不等式（看單位圓）": ["T-07"],

  /* ── geometry 坐標幾何 ── */
  // geometry/line 點與直線
  "geometry/line/距離與中點": ["G-01"],
  "geometry/line/分點公式": ["G-01","G-05"],
  "geometry/line/斜率與平行垂直": ["G-01"],
  "geometry/line/直線方程式五種寫法": ["G-01"],
  "geometry/line/三點共線": ["G-01"],
  "geometry/line/點到直線的距離": ["G-01"],
  "geometry/line/兩直線的夾角": ["G-01","T-04"],
  "geometry/line/角平分線": ["G-01"],
  "geometry/line/三角形的心": ["G-04"],
  // geometry/circle 圓
  "geometry/circle/標準式與一般式": ["G-02"],
  "geometry/circle/圓與直線的關係": ["G-02"],
  "geometry/circle/弦長公式": ["G-02"],
  "geometry/circle/切線公式（切點已知）": ["G-02"],
  "geometry/circle/過圓外一點的切線": ["G-02"],
  "geometry/circle/切線長": ["G-02"],
  "geometry/circle/兩圓的位置關係": ["G-02"],
  "geometry/circle/共弦線（根軸）": ["G-02"],
  "geometry/circle/圓周角＝圓心角的一半": ["G-04","T-03"],
  // geometry/conic 圓錐曲線
  "geometry/conic/拋物線": ["G-11"],
  "geometry/conic/橢圓": ["G-11"],
  "geometry/conic/雙曲線": ["G-11"],
  "geometry/conic/正焦弦與離心率": ["G-11"],
  "geometry/conic/光學（反射）性質": ["G-11"],
  "geometry/conic/平移後的圓錐曲線": ["G-11"],
  // geometry/locus 軌跡與對稱
  "geometry/locus/軌跡三步驟": ["G-02","G-01"],
  "geometry/locus/常見軌跡對照": ["G-01","G-02"],
  "geometry/locus/阿波羅尼斯圓": ["G-02"],
  "geometry/locus/對稱點公式": ["G-01"],
  "geometry/locus/圖形對稱的代換": ["G-01"],
  // geometry/space 空間中的位置關係
  "geometry/space/兩直線的位置關係": ["G-06"],
  "geometry/space/直線與平面的位置關係": ["G-06"],
  "geometry/space/三垂線定理": ["G-06"],
  "geometry/space/兩面角（二面角）": ["G-06"],
  "geometry/space/空間坐標與距離": ["G-07"],
  "geometry/space/正射影與投影面積": ["G-06"],
  "geometry/space/柱錐球的體積與表面積": ["G-06"],

  /* ── vector 向量與矩陣 ── */
  // vector/vbasic 向量的基本運算
  "vector/vbasic/向量的表示與加減": ["G-05"],
  "vector/vbasic/共線判定": ["G-05"],
  "vector/vbasic/分點與係數和定理": ["G-05"],
  "vector/vbasic/線性組合與唯一分解": ["G-05"],
  "vector/vbasic/單位向量與方向": ["G-05"],
  "vector/vbasic/重心的向量式": ["G-05"],
  // vector/dot 內積與其應用
  "vector/dot/內積的兩種算法": ["G-05"],
  "vector/dot/長度與內積的互換": ["G-05"],
  "vector/dot/垂直判定": ["G-05"],
  "vector/dot/正射影": ["G-05"],
  "vector/dot/柯西不等式（向量形式）": ["G-05"],
  "vector/dot/夾角的正負判斷": ["G-05"],
  // vector/cross 空間向量與外積
  "vector/cross/外積的定義": ["G-07"],
  "vector/cross/外積的長度＝面積": ["G-07"],
  "vector/cross/純量三重積＝體積": ["G-07"],
  "vector/cross/行列式的幾何意義": ["G-05"],
  "vector/cross/空間中兩向量的夾角": ["G-07"],
  // vector/plane 空間中的平面與直線
  "vector/plane/平面方程式": ["G-08"],
  "vector/plane/點到平面的距離": ["G-08"],
  "vector/plane/直線的參數式與比例式": ["G-08"],
  "vector/plane/空間中點到直線的距離": ["G-08"],
  "vector/plane/線面夾角": ["G-08"],
  "vector/plane/兩平面夾角": ["G-08","G-06"],
  "vector/plane/兩歪斜線的距離": ["G-08"],
  "vector/plane/三平面的相交關係": ["G-10","G-08"],
  // vector/matrix 矩陣與線性變換
  "vector/matrix/矩陣乘法": ["G-09"],
  "vector/matrix/二階反方陣": ["G-09"],
  "vector/matrix/行列式與面積比": ["G-09"],
  "vector/matrix/常見的線性變換": ["G-09"],
  "vector/matrix/旋轉矩陣": ["G-09","T-04"],
  "vector/matrix/轉移矩陣（馬可夫）": ["G-09"],
  "vector/matrix/求 A 的 n 次方": ["G-09"],
  "vector/matrix/解穩定狀態": ["G-09","G-10"],
  // vector/persp 單點透視法
  "vector/persp/消失點的求法": ["G-01"],
  "vector/persp/地平線": ["G-01","G-04"],
  "vector/persp/透視長度公式": ["G-04"],
  "vector/persp/背面＝正面以 V 為中心的縮小（分點公式）": ["G-05","G-04"],
  "vector/persp/面積比 → 邊長比 → 距離比": ["G-04"],
  "vector/persp/比較實際高度（h 除以 d）": ["G-04"],
  "vector/persp/等比例位置的點自成一條深度線": ["G-04","G-01"],
  "vector/persp/對角線交點找中央": ["G-01"],

  /* ── sequence 數列・級數・極限 ── */
  // sequence/seq 數列與遞迴
  "sequence/seq/等差數列": ["D-01"],
  "sequence/seq/等比數列": ["D-02"],
  "sequence/seq/遞迴數列：先算前五項": ["D-03"],
  "sequence/seq/遞迴式：一階線性": ["D-03"],
  "sequence/seq/遞迴式：累加與累乘": ["D-03"],
  "sequence/seq/由前 n 項和反求通項": ["D-01"],
  "sequence/seq/二階差分（找規律）": ["D-03","D-01"],
  // sequence/series 級數求和
  "sequence/series/等差級數和": ["D-01"],
  "sequence/series/等比級數和": ["D-02"],
  "sequence/series/自然數冪次和": ["D-01"],
  "sequence/series/分項相消（望遠鏡法）": ["D-01"],
  "sequence/series/錯位相減": ["D-02","D-01"],
  "sequence/series/Σ 的指標平移": ["D-01"],
  // sequence/induction 數學歸納法
  "sequence/induction/標準三步驟": ["D-08"],
  "sequence/induction/整除性的歸納": ["D-08"],
  "sequence/induction/不等式的歸納": ["D-08"],
  "sequence/induction/強歸納法（補充）": ["D-08","D-03"],
  // sequence/limit 極限與無窮級數
  "sequence/limit/數列極限的四則運算": ["D-04"],
  "sequence/limit/分式極限（同除最高次）": ["D-04"],
  "sequence/limit/無窮等比級數": ["D-04"],
  "sequence/limit/夾擠定理": ["D-04"],
  "sequence/limit/函數極限與連續": ["C-01"],
  "sequence/limit/介值定理": ["C-01","P-02"],
  "sequence/limit/漸近線（補充）": ["C-01"],
  "sequence/limit/連續複利與常數 e": ["D-04","E-03"],
  "sequence/limit/無窮等比的幾何應用": ["D-04"],

  /* ── prob 計數・機率・統計 ── */
  // prob/count 計數原理
  "prob/count/有系統的窮舉與樹狀圖": ["D-05"],
  "prob/count/加法原理（分類）": ["D-05"],
  "prob/count/乘法原理（分步）": ["D-05"],
  "prob/count/取捨原理": ["D-05","N-04"],
  "prob/count/補集法": ["D-05"],
  "prob/count/正整數解個數": ["D-07"],
  // prob/perm 排列
  "prob/perm/直線排列": ["D-06"],
  "prob/perm/重複排列": ["D-06"],
  "prob/perm/不盡相異物排列": ["D-06"],
  "prob/perm/環狀排列": ["D-06"],
  "prob/perm/相鄰：捆綁法": ["D-06"],
  "prob/perm/不相鄰：插空法": ["D-06"],
  "prob/perm/順序固定": ["D-06"],
  // prob/comb 組合與二項式定理
  "prob/comb/組合數": ["D-07"],
  "prob/comb/重複組合": ["D-07"],
  "prob/comb/分堆與分配": ["D-07"],
  "prob/comb/方格路徑": ["D-07","D-06"],
  "prob/comb/二項式定理": ["D-15"],
  "prob/comb/巴斯卡性質": ["D-15"],
  // prob/probability 機率
  "prob/probability/古典機率": ["D-09"],
  "prob/probability/客觀機率 vs 主觀機率": ["D-09"],
  "prob/probability/加法定理": ["D-09"],
  "prob/probability/餘事件": ["D-10"],
  "prob/probability/條件機率": ["D-11"],
  "prob/probability/獨立事件": ["D-10"],
  "prob/probability/獨立 vs 互斥": ["D-10"],
  "prob/probability/貝氏定理": ["D-11"],
  "prob/probability/樹狀圖與分段乘法": ["D-11","D-10"],
  // prob/rv 期望值與隨機變數
  "prob/rv/期望值": ["D-09"],
  "prob/rv/期望值的線性": ["D-14","D-09"],
  "prob/rv/變異數與標準差": ["D-14"],
  "prob/rv/二項分布": ["D-14"],
  "prob/rv/幾何分布": ["D-14"],
  "prob/rv/期望值的決策應用": ["D-09"],
  // prob/stat 數據分析
  "prob/stat/集中量數": ["D-12"],
  "prob/stat/標準差": ["D-12"],
  "prob/stat/線性變換的影響": ["D-12"],
  "prob/stat/標準化（z 分數）": ["D-12"],
  "prob/stat/百分位數與四分位數": ["D-12"],
  "prob/stat/幾何平均與平均成長率": ["D-12"],
  "prob/stat/相關係數": ["D-13"],
  "prob/stat/最適直線": ["D-13"],
  "prob/stat/散布圖與離群值": ["D-13"],

  /* ── calculus 微積分 ── */
  // calculus/deriv 導數的意義
  "calculus/deriv/導數定義": ["C-02"],
  "calculus/deriv/切線與法線": ["C-02"],
  "calculus/deriv/可微與連續": ["C-02","C-01"],
  "calculus/deriv/物理意義": ["C-02"],
  // calculus/rules 微分公式與技巧
  "calculus/rules/冪次法則": ["C-02"],
  "calculus/rules/線性性質": ["C-02"],
  "calculus/rules/乘積法則": ["C-02"],
  "calculus/rules/商法則": ["C-02"],
  "calculus/rules/連鎖律": ["C-02"],
  "calculus/rules/高階導數": ["C-02","C-03"],
  "calculus/rules/一次估計（線性近似）": ["C-02"],
  // calculus/analysis 函數性質的判定
  "calculus/analysis/一階導數與增減": ["C-03"],
  "calculus/analysis/極值的判定": ["C-03"],
  "calculus/analysis/二階導數與凹凸": ["C-03"],
  "calculus/analysis/反曲點": ["C-03","P-05"],
  "calculus/analysis/增減凹凸表": ["C-03"],
  "calculus/analysis/用單調性證不等式": ["C-03"],
  "calculus/analysis/最佳化應用": ["C-03"],
  // calculus/integ 積分
  "calculus/integ/不定積分（反導數）": ["C-04"],
  "calculus/integ/微積分基本定理": ["C-04"],
  "calculus/integ/定積分的性質": ["C-04"],
  "calculus/integ/黎曼和": ["C-04"],
  "calculus/integ/變數代換（補充）": ["C-04"],
  "calculus/integ/奇偶函數的定積分": ["C-04"],
  // calculus/integapp 積分的應用
  "calculus/integapp/兩曲線間的面積": ["C-05"],
  "calculus/integapp/旋轉體體積（圓盤法）": ["C-05"],
  "calculus/integapp/切片積分法": ["C-05"],
  "calculus/integapp/位移與總路程": ["C-05","C-04"],
  "calculus/integapp/平均值": ["C-05"]
};

/* 主題層（給「主題→考點」查詢用） */
window.KP_TOPICS = {
  "number/setlogic": ["N-04"],   // 集合與邏輯
  "number/real": ["N-01","N-05"],   // 實數與數線
  "number/abs": ["N-02"],   // 絕對值
  "number/exp": ["E-01","E-02"],   // 指數與根式
  "number/log": ["E-04","E-06"],   // 對數
  "number/poly": ["P-01","P-02"],   // 多項式
  "number/remainder": ["P-01"],   // 餘式的設法
  "number/complex": ["N-03"],   // 複數
  "equation/quad": ["P-04","P-03"],   // 二次方程式與判別式
  "equation/solve": ["P-02","P-07"],   // 高次・分式・根式方程式
  "equation/ineq": ["P-06"],   // 不等式的解法
  "equation/estimate": ["N-05","G-05"],   // 不等式的估計工具
  "equation/linear": ["G-10"],   // 聯立方程式與行列式
  "equation/lp": ["G-12","G-03"],   // 線性規劃
  "function/fbasic": ["P-08","E-05"],   // 函數的基本概念
  "function/quadf": ["P-03"],   // 一次與二次函數
  "function/polyf": ["P-05"],   // 多項式函數的圖形
  "function/explog": ["E-03","E-05"],   // 指數與對數函數
  "function/transform": ["P-03","T-06"],   // 圖形的變換
  "function/maxmin": ["P-03","N-05"],   // 最大最小值策略表
  "trig/def": ["T-01","T-02"],   // 三角比的定義
  "trig/identity": ["T-04"],   // 三角恆等式
  "trig/solvetri": ["T-03"],   // 解三角形
  "trig/graph": ["T-06","T-05"],   // 三角函數的圖形與疊合
  "trig/trigeq": ["T-07"],   // 三角方程式與不等式
  "geometry/line": ["G-01"],   // 點與直線
  "geometry/circle": ["G-02"],   // 圓
  "geometry/conic": ["G-11"],   // 圓錐曲線
  "geometry/locus": ["G-01","G-02"],   // 軌跡與對稱
  "geometry/space": ["G-06"],   // 空間中的位置關係
  "vector/vbasic": ["G-05"],   // 向量的基本運算
  "vector/dot": ["G-05"],   // 內積與其應用
  "vector/cross": ["G-07"],   // 空間向量與外積
  "vector/plane": ["G-08"],   // 空間中的平面與直線
  "vector/matrix": ["G-09"],   // 矩陣與線性變換
  "vector/persp": ["G-04","G-01"],   // 單點透視法
  "sequence/seq": ["D-01","D-03"],   // 數列與遞迴
  "sequence/series": ["D-01","D-02"],   // 級數求和
  "sequence/induction": ["D-08"],   // 數學歸納法
  "sequence/limit": ["D-04","C-01"],   // 極限與無窮級數
  "prob/count": ["D-05"],   // 計數原理
  "prob/perm": ["D-06"],   // 排列
  "prob/comb": ["D-07","D-15"],   // 組合與二項式定理
  "prob/probability": ["D-09","D-10","D-11"],   // 機率
  "prob/rv": ["D-09","D-14"],   // 期望值與隨機變數
  "prob/stat": ["D-12","D-13"],   // 數據分析
  "calculus/deriv": ["C-02"],   // 導數的意義
  "calculus/rules": ["C-02"],   // 微分公式與技巧
  "calculus/analysis": ["C-03"],   // 函數性質的判定
  "calculus/integ": ["C-04"],   // 積分
  "calculus/integapp": ["C-05"]   // 積分的應用
};
