/* Bilingual layer: EN ⇄ 繁中 (HK).
   UI strings use English source text as the key, so a missing entry falls back to English.
   Product/trend content comes from data/zh.json (translated, validated, resumable). */
(function () {
  const KEY = "wiz_lang";
  const root = typeof globalThis !== "undefined" ? globalThis : this;

  const ZH = {
    /* nav + chrome */
    "Meeting wizard": "會議精靈",
    "Follow-up": "跟進",
    "Catalogue": "產品目錄",
    "Catalogue library": "產品目錄",
    "Agent tool · local": "代理工具 · 本機",
    "Agent tool · local · never sends": "代理工具 · 本機 · 不會自動發送",
    "Local only": "只限本機",
    "Language": "語言",
    "English": "English",
    "中文": "中文",

    /* steps */
    "Intake": "輸入資料",
    "Lane": "產品類別",
    "Confirm needs": "確認需要",
    "Future state": "未來狀態",
    "Narrow": "收窄問題",
    "Compare": "比較",

    /* buttons */
    "Continue": "繼續",
    "Back": "上一步",
    "Finish": "完成",
    "New meeting": "新會議",
    "Copy again": "再複製",
    "Download .txt": "下載文字檔",
    "Copy meeting card": "複製會議卡",
    "Copy plan": "複製計劃",
    "Copy draft": "複製草稿",
    "Save client": "儲存客戶",
    "Save new revision": "儲存新版本",
    "Sign in": "登入",
    "Register": "註冊",
    "Sign out": "登出",
    "Delete": "刪除",
    "Delete client": "刪除客戶",
    "Use this instead": "改用此項",
    "Use this wording": "採用此寫法",
    "Keep template": "保留範本",
    "Close": "關閉",
    "Polish wording": "潤飾文字",
    "I sent this": "我已發送",
    "Done": "已完成",
    "Blocked": "受阻",
    "Open plan": "開啟計劃",
    "Re-plan": "重新規劃",
    "Open follow-up": "開啟跟進",
    "Analyse with AI": "用 AI 分析",
    "Reading the note…": "正在閱讀紀錄…",
    "Show all": "顯示全部",
    "Select for meeting": "加入會議",
    "Selected": "已選擇",
    "Open in library": "在目錄中開啟",
    "Start over": "重新開始",

    /* status */
    "not started": "未開始",
    "draft ready": "草稿已備",
    "sent": "已發送",
    "done": "已完成",
    "blocked": "受阻",
    "system pick": "系統建議",
    "your pick": "你的選擇",
    "verify first": "先核實",
    "changed": "已更改",
    "same": "相同",
    "strong": "強",
    "medium": "中",
    "weak": "弱",
    "core": "核心",

    /* wizard */
    "1. Intake": "1. 輸入資料",
    "2. Lane": "2. 產品類別",
    "3. Confirm needs": "3. 確認需要",
    "4. Future state": "4. 未來狀態",
    "5. Narrow": "5. 收窄問題",
    "6. Compare": "6. 比較",
    "Meeting notes": "會議紀錄",
    "Confirmed": "已確認",
    "Not known yet": "尚未知道",
    "Two tracks": "兩條路徑",
    "If nothing changes": "甚麼都不做的話",
    "If we act in this meeting": "今次會議就處理",
    "The moves": "行動次序",
    "System recommendation vs your pick": "系統建議與你的選擇",
    "Why this one:": "為何選這項：",
    "Trade-off:": "取捨：",
    "Check:": "注意：",
    "Why we chose it:": "我們選擇的原因：",
    "Flag what to verify": "標記需要核實的地方",
    "Why this pick — prints on the card": "選擇原因 — 會印在會議卡上",
    "Save for follow-up": "儲存作跟進",
    "Saved and locked.": "已儲存並鎖定。",
    "Current plan": "現有計劃",
    "Deferred": "暫緩",
    "Next actions": "下一步行動",
    "Verify before claiming": "聲稱前先核實",
    "Future state:": "未來狀態：",
    "THE PLAN": "計劃",
    "TO VERIFY": "需要核實",
    "NEXT ACTIONS": "下一步行動",

    /* follow-up */
    "Clients": "客戶",
    "Frozen picks": "已凍結的選擇",
    "Follow-up checklist": "跟進清單",
    "Comfort boundary": "保費舒適範圍",
    "Too tight": "偏緊",
    "Ok": "可以",
    "Flexible": "有彈性",
    "Choose…": "請選擇…",
    "Note (optional, not a quote)": "備註（可選，並非報價）",
    "Required to mark budget Done. Not a quote.": "標記預算完成前必須填寫。並非報價。",
    "All clients": "所有客戶",
    "Plan as delivered": "已交付的計劃",
    "Retention": "保留期",
    "Suggest wording": "建議寫法",

    /* misc */
    "Dimension": "比較項目",
    "Move": "項目",
    "Your pick —": "你的選擇 —",
    "Alt": "替代",
    "System suggested": "系統建議",
    "You picked": "你的選擇",
    "Why the system suggested it": "系統建議原因",
    "Why we chose it": "我們選擇的原因",
    "not in extract": "資料未載",
    "None listed": "未列出",
    "Loading…": "載入中…",
    "Loading catalogue…": "載入產品目錄…",
    "No moves yet — go back to Future state.": "尚未有行動 — 請返回未來狀態。",
    "System pick and your pick agree.": "系統建議與你的選擇一致。",
    "No product matched. Go back and check the needs.": "沒有相符產品。請返回檢查需要。",
    "No comparable dimensions in the extract for these picks.": "這些選擇在資料中沒有可比較項目。",
    "Saved.": "已儲存。",
    "Deleted.": "已刪除。",
    "Draft copied. Send it yourself, then mark Sent.": "草稿已複製。請自行發送，然後標記為已發送。",
    "Recorded as sent. A reengage is scheduled in 3 days if the gate is still open.": "已記錄為發送。若該項仍未完成，3 日後會安排一次跟進。",
    "Updated.": "已更新。",
    "Plan copied.": "計劃已複製。",
    "Wording updated. Still unsent.": "文字已更新，仍未發送。",
    "AI unavailable right now — the template above is unchanged.": "AI 暫時未能使用 — 上方範本保持不變。",
    "Nothing left to ask — the notes covered every gate.": "沒有其他問題 — 紀錄已涵蓋所有項目。",
    "No summary": "沒有摘要",
    "open": "待辦",
    "reengage due": "跟進到期",
    "Step": "項目",
    "steps": "項",    "Paste a bit more of the note first.": "請先貼上多一點紀錄。",
    "Paste notes → confirm needs → future state → compare → finish. Save a frozen snapshot for follow-up. The system never locks “the one best plan,” and never sends a message.": "貼上紀錄 → 確認需要 → 未來狀態 → 比較 → 完成。可儲存凍結快照作跟進。系統不會鎖定「唯一最佳計劃」，也不會自動發送訊息。",
    "Local only · 57 AIA HK products · phrase matcher + optional AI intake · weak-evidence products cannot lead.": "只限本機 · 57 項 AIA 香港產品 · 詞組配對 + 可選 AI 解析 · 證據薄弱的產品不能領先。",

    "Meeting notes": "會議紀錄",
    "Age band": "年齡組別",
    "Smoker": "吸煙狀況",
    "Budget / premium comfort": "預算／保費舒適範圍",
    "e.g. under $2,000/mo": "例如：每月 $2,000 以下",
    "Existing cover": "現有保障",
    "Unknown": "不確定",
    "Yes": "有",
    "No": "沒有",
    "Existing type": "現有保障類型",
    "CI / VHIS / term / none": "危疾／自願醫保／定期壽險／沒有",
    "Policy owner": "保單持有人",
    "Personal": "個人",
    "Company (keyman)": "公司（關鍵人）",
    "Client has a current plan to compare": "客戶有現有計劃可比較",
    "Current product": "現有產品",
    "Name if known": "如知道請填名稱",
    "Sum assured": "保額",
    "Room / ward": "病房級別",
    "Deductible": "自付額",
    "Remaining term": "剩餘年期",
    "Premium": "保費",
    "AI read of the notes": "紀錄的 AI 解讀",
    "Optional. Extracts lanes, needs and brochure terms from messy notes.": "可選。從雜亂紀錄中抽取類別、需要及產品冊詞彙。",
    "Reading the note…": "正在閱讀紀錄…",
    "Analyse with AI": "用 AI 分析",
    "Analyze with AI": "用 AI 分析",
    "AI intake failed:": "AI 解析失敗：",
    "the rule matcher still runs.": "規則配對仍會運作。",
    "Brochure terms used for matching": "用於配對的產品冊詞彙",
    "Still to ask": "仍待詢問",
    "AI read": "AI 解讀",
    "from AI read": "來自 AI 解讀",
    "score": "分數",
    "From notes:": "來自紀錄：",
    "No category fired. Go back and use Analyse with AI, or continue and pick products by lane only.": "沒有類別觸發。請返回使用「用 AI 分析」，或繼續只按類別挑選產品。",
    "If nothing changes": "甚麼都不做",
    "If we act in this meeting": "今次會議就處理",
    "12 months": "12 個月",
    "5 years": "5 年",
    "10 years": "10 年",
    "Nothing is in force. The first serious illness is funded by savings, family, or a loan.": "目前沒有任何保障。第一次嚴重疾病，要靠儲蓄、家人或借貸。",
    "Care costs keep drawing down the deposit — the goal moves further out.": "照顧費用不斷侵蝕首期 — 目標越推越遠。",
    "Savings absorb whatever the first event costs.": "第一次事件的費用，全由儲蓄承擔。",
    "The deposit arrives later or smaller. The risk never went away.": "首期只會更遲或更少。風險從未消失。",
    "The same exposure, just older and more expensive to insure.": "同樣的風險，只是年紀更大、投保更貴。",
    "No protection move selected yet.": "尚未選擇保障項目。",
    "Parents' care comes from income, not the deposit.": "父母的照顧費用由收入支付，不動用首期。",
    "The first event no longer comes out of savings.": "第一次事件不再由儲蓄支付。",
    "Deposit still on schedule, but nothing is funding it yet.": "首期仍按計劃，但尚未有工具為它供款。",
    "Protection still running, at the age he locked in.": "保障持續，保費鎖定在投保年齡。",
    "Protection only. No savings projections — the savings move is described by what it does, not by a projected value.": "只談保障，不做儲蓄預測 — 儲蓄項目只描述功能，不展示預測價值。",
    "to confirm": "待確認",
    "none": "無",
    "No product matched. Go back and check the needs.": "沒有相符產品。請返回檢查需要。",
    "Client facts": "客戶資料",
    "Leave blank to skip": "留空即略過",
    "Nothing left to ask — the notes covered every gate.": "沒有其他問題 — 紀錄已涵蓋所有項目。",
    "How old is he?": "他幾歲？",
    "Smoker or non-smoker?": "有吸煙嗎？",
    "Which existing policies does he hold, and what do they cover?": "他現有哪些保單？保障甚麼？",
    "What monthly premium is comfortable?": "每月可負擔多少保費？",
    "not in extract": "資料未載",
    "current plan:": "現有計劃：",
    "Why this pick — prints on the card": "選擇原因 — 會印在會議卡上",
    "e.g. client wants the lowest premium that still covers cancer": "例如：客戶想要最能保障癌症而又最低的保費",
    "No moves yet — go back to Future state.": "尚未有行動 — 請返回未來狀態。",
    "Strong": "強",
    "Medium": "中",
    "Weak": "弱",
    "changed": "已更改",
    "same": "相同",
    "AIA Meeting Wizard": "AIA 會議精靈",

    "Paste the key here. It is written to .secrets.env on this Mac (chmod 600) and used by the local wizard server — it never enters chat. The key is also kept in this browser (localStorage) so the wizard can call the model directly and stop depending on the server process.": "在此貼上金鑰。金鑰會寫入本機 .secrets.env（權限 600），供本機精靈伺服器使用 — 不會進入對話。金鑰亦會保存在此瀏覽器（localStorage），讓精靈可直接呼叫模型，不再依賴伺服器程序。",
    "Save & test": "儲存並測試",
    "One live test call is made to confirm the key works.": "會即時發送一次測試呼叫，確認金鑰有效。",
    "The field is masked and never echoed back. Replace it any time by submitting again.": "欄位已遮蔽，不會回顯。可隨時再次提交以更換金鑰。",
    "Back to the wizard": "返回會議精靈",
    "API key": "API 金鑰",

    "Protect the income": "守住收入",
    "Stop hospital bills eating savings": "別讓住院費吃掉儲蓄",
    "Put a lump sum behind a diagnosis": "確診時有一筆現金",
    "Fund the goal on a date": "按日期為目標供款",
    "If he dies, it pays a lump sum to the people who depend on him — so the house plan and the family don't have to change.": "如果他不在了，會一筆過賠給依靠他的人 — 置業計劃與家庭就不用改變。",
    "It pays the hospital bill itself, up to a limit — treatment stops coming out of his savings.": "住院費用由保單直接支付（設上限）— 治療不再從儲蓄扣。",
    "If he is diagnosed with a covered serious illness, it pays a lump sum he can spend on treatment, recovery, or replacing income while he cannot work.": "若確診受保的嚴重疾病，會一筆過賠償，可用於治療、休養，或補充不能工作時的收入。",
    "It pays accident-related bills and income while he recovers.": "意外相關費用及休養期間的收入，都由保單支付。",
    "It builds a sum for a goal with a date — here, the deposit. The guaranteed and non-guaranteed parts are kept separate, and no projected return is shown.": "為有明確日期的目標累積一筆錢 — 這裡是首期。保證與非保證部分分開列明，不展示預測回報。",

    "Paste the agent’s notes. Add the five fields so mixed-language notes still rank. The matcher is phrase overlap — it does not invent facts.": "貼上代理的會議紀錄。填寫五個欄位，中英混合紀錄一樣可以排序。配對器只做客詞重疊，不會憑空創作。",
    "Lock the product family before ranking. Multi-need notes can keep more than one lane. Override the auto pick.": "排序前先鎖定產品類別。多個需要可以同時保留多過一個類別。可自行更改自動選擇。",
    "These are need categories, not products. Uncheck anything the notes do not support. Don’t-push chips are shown so you do not confirm a contradiction.": "這些是「需要類別」，不是產品。紀錄不支持的，請取消勾選。「不應推銷」標籤用來提醒你避免確認矛盾的需要。",
    "What he can be — protection only. Pick one product per move; the tracks and the card above update with your pick.": "他可以的將來 — 只談保障。每個行動選一項產品；上方兩條路徑與會議卡會跟隨你的選擇更新。",
    "Questions come from the picks you just made, not from a generic list. Answer what he already told you and leave the rest blank.": "問題來自你剛才的選擇，不是通用清單。客戶已講過的先填，其餘留空。",
    "Where they differ, the system's suggestion stays visible so you can explain the change to the client.": "若有不同，系統建議仍然顯示，方便你向客戶解釋為何更改。",
    "Chosen vs the alternatives you did not pick, per move. Empty cells mean the brochure extract does not state it — they stay on the checklist.": "每個行動：你的選擇與其他未選產品的比較。空白代表產品冊沒有寫明 — 會保留在核實清單。",
    "Finish already copied the plan. Saving stores a frozen snapshot (encrypted on this Mac). The system never sends a message.": "「完成」已複製計劃。儲存會把這一刻的內容凍結並加密存在這部 Mac。系統不會自動發送任何訊息。",
    "Guest can run the wizard. Saving needs an account on this Mac.": "訪客可以用完整個精靈。儲存需要本機帳戶。",
    "This plan is frozen. New meeting = new client. Re-plan from the follow-up page if the brief changes.": "此計劃已凍結。新會議＝新客戶。若情況有變，請在跟進頁重新規劃。",
    "Load sample:": "載入範例：",
    "Keyman": "關鍵人保障",
    "CI top-up": "危疾加保",
    "VHIS upgrade": "自願醫保升級",
    "Messy note": "雜亂紀錄",
    "Download JSON": "下載 JSON",
    "Copy JSON": "複製 JSON",
    "Filter products…": "篩選產品…",
    "Retention 365 days from save. Delete removes the record. Notes are encrypted at rest.": "由儲存起保留 365 日。刪除會移除紀錄。紀錄以加密方式儲存。",
    "Local loopback only. One agent, no sharing. Passwords never leave this Mac.": "只限本機連線。一位代理，不共用。密碼不會離開這部 Mac。",
    "Draft copied. Send it yourself, then mark Sent.": "草稿已複製。請自行發送，然後標記為已發送。",
    "Plan as delivered": "已交付的計劃",
    "New meeting = new client.": "新會議＝新客戶。",
    "Confirm age band": "確認年齡組別",
    "Confirm smoker status": "確認吸煙狀況",
    "Request existing policy schedule": "索取現有保單保障表",
    "Comfort boundary (not a quote)": "保費舒適範圍（並非報價）",
    "Apply": "投保",

    "Meeting wizard": "會議精靈",
    "API key": "API 金鑰",
    "Local only": "只限本機",
    "Save & test": "儲存並測試",
    "Back to the wizard": "返回會議精靈",

    "Existing agent": "現有代理",
    "New agent": "新代理",
    "Email": "電郵",
    "Password": "密碼",
    "Password (8+)": "密碼（8 位以上）",
    "Name": "姓名",
    "Comfort boundary": "保費舒適範圍",
    "Suggested wording": "建議寫法",
    "working…": "處理中…",

    "Confirm underwriting, premium and exclusions.": "請確認核保、保費及不保事項。",
    "Two tracks": "兩條路徑",
    "The moves": "行動次序",
    "Paste English / 中文 / mixed notes…": "貼上英文／中文／混合紀錄…",
    "Paste the agent’s notes. Add the five fields so mixed-language notes still rank. The matcher is phrase overlap — it does not invent facts.": "貼上代理的會議紀錄。填寫五個欄位，中英混合紀錄一樣可以排序。配對器只做客詞重疊，不會憑空創作。",
    "Load sample:": "載入範例：",
    "Client facts": "客戶資料",
    "Leave blank to skip": "留空即略過",
    "Show all": "顯示全部",
    "in this category": "項同類產品",
    "Saving…": "儲存中…",

    "Best for": "適合",
    "Primary trend": "主要趨勢",
    "Do not push when": "不應推銷的情況",
    "Gaps in source material": "資料不足之處",
    "Key figures": "關鍵數字",
    "Conditions / exclusions": "條件／不保事項",
    "Client would say": "客戶會這樣說",
    "Profile fit": "適合的客戶",
    "Priority alignment": "優先次序配合",
    "Comparison dimensions": "比較項目",
    "Verify before claiming": "聲稱前先核實",
    "Talking point": "溝通重點",
    "Source evidence": "資料來源",
    "Reviewer note": "審核備註",
    "Trends": "趨勢",
    "Raw JSON": "原始 JSON",
    "new category": "新類別",
    "evidence": "證據",
    "Loading product…": "載入產品中…",
    "Could not load": "無法載入",
    "products": "個產品",
    "trends": "項趨勢",
    "Copied": "已複製",
    "Copy JSON": "複製 JSON",
    "Copy failed": "複製失敗",
    "Plan": "計劃",
    "Fit:": "配合：",
    "Agent picks": "代理選擇",
    "suggested": "項建議",
    "in this category": "項同類產品",
    "Nothing confirmed yet": "尚未確認任何事項",
    "to confirm": "待確認",
    "None": "無",
    "Copy failed": "複製失敗",
    "System pick": "系統建議",
    "Your pick": "你的選擇",
    "Source": "來源",
    "Trends Review": "趨勢審閱",
    "Health": "健康",
    "Life": "人壽",
    "Save": "儲蓄",
    "Invest": "投資",
    "Filter products…": "篩選產品…",

  };

  let lang = "en";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "zh" || saved === "en") lang = saved;
  } catch { /* ignore */ }

  const isZh = () => lang === "zh";
  const t = (s) => (lang === "zh" ? (ZH[s] || s) : s);

  let zhData = null;
  let zhBrochure = null;
  let zhPromise = null;
  function loadZh() {
    if (zhPromise) return zhPromise;
    zhPromise = Promise.all([
      fetch("data/zh.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("data/zh_brochure.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([j, b]) => {
      zhData = j && j.products ? j : null;
      zhBrochure = b && b.products ? b : null;
      return zhData;
    });
    return zhPromise;
  }

  function zhProduct(productId) {
    if (!isZh() || !zhData) return null;
    return zhData.products[productId] || null;
  }

  function zhTrend(productId, trendId) {
    const p = zhProduct(productId);
    if (!p || !p.trends) return null;
    return p.trends.find((x) => x.trendId === trendId) || null;
  }

  /* Content helpers: return Chinese when available, else the English source. */
  function cProduct(p) {
    const z = zhProduct(p && p.productId);
    return {
      summary: (z && z.summary && z.summary.bestForOneLiner) || (p.productLevelSummary && p.productLevelSummary.bestForOneLiner) || "",
      notSuited: (z && z.summary && z.summary.notSuitedWhen) || (p.productLevelSummary && p.productLevelSummary.notSuitedWhen) || [],
      gaps: (z && z.summary && z.summary.gapsInSourceMaterial) || (p.productLevelSummary && p.productLevelSummary.gapsInSourceMaterial) || [],
    };
  }

  function zhBrochureTrend(productId, trendId) {
    if (!isZh() || !zhBrochure) return null;
    const p = zhBrochure.products[productId];
    if (!p || !p.trends) return null;
    return p.trends.find((x) => x.trendId === trendId) || null;
  }

  function cTrend(p, tr) {
    const z = zhTrend(p && p.productId, tr && tr.trendId);
    const b = zhBrochureTrend(p && p.productId, tr && tr.trendId);
    return {
      name: (b && b.label) || (z && z.trendName) || (tr && tr.trendName) || "",
      offers: (b && b.offer) || (z && z.whatProductOffers) || (tr && tr.whatProductOffers) || "",
      figures: (z && z.keyFigures) || (tr && tr.keyFigures) || [],
      exclusions: (b && b.exclusions && b.exclusions.length ? b.exclusions : (z && z.exclusionsOrConditions) || (tr && tr.exclusionsOrConditions) || []),
      fit: (z && z.clientProfileFit) || (tr && tr.clientProfileFit) || [],
      prompts: (z && z.verificationPrompts) || (tr && tr.verificationPrompts) || [],
    };
  }



  const LANE_ZH = {
    term_life: "定期壽險",
    whole_life: "終身壽險",
    medical: "醫療保障",
    ci: "危疾保障",
    savings: "儲蓄",
    retirement: "退休收入",
    ilas: "投資相連",
    accident: "意外保障",
    general: "一般保險",
  };
  const NEED_ZH = {
    family_protection: "家庭保障",
    income_or_lifestyle_support: "收入保障",
    hospital_cost_protection: "住院保障",
    room_ward_level: "病房級別",
    high_annual_or_lifetime_limit: "高保障限額",
    critical_illness_readiness: "危疾保障",
    outpatient_and_followup: "門診及覆診",
    savings_and_wealth_growth: "儲蓄與財富增長",
    legacy_and_estate: "遺產與傳承",
    pre_existing_or_chronic_support: "現有疾病支援",
    international_coverage: "海外保障",
    budget_friendly_entry: "預算友好入門",
    premium_stability: "保費穩定",
    flexibility_and_customisation: "彈性自選",
    fast_access_and_convenience: "快速理賠",
  };
  const laneLabel = (id) => (isZh() ? LANE_ZH[id] || id : String(id).replace(/_/g, " "));
  const needLabel = (id) => (isZh() ? NEED_ZH[id] || id : String(id).replace(/_/g, " "));

  const ROW_LABELS = {
    premium: "保費",
    lifetime_limit: "終身限額",
    annual_limit: "每年限額",
    room_level: "病房級別",
    ci_coverage: "危疾保障",
    waiting_period: "等候期",
    renewability: "續保",
    outpatient: "門診",
    network_access: "網絡醫院",
    add_ons: "附加保障",
    death_benefit: "身故賠償",
    cash_value: "現金價值",
    surrender_value: "退保價值",
    policy_term: "保單年期",
    entry_age: "投保年齡",
  };
  function rowLabel(key) {
    if (!isZh()) return key;
    return ROW_LABELS[key] || key.replace(/_/g, " ");
  }

  function zhProductName(productId) {
    const p = zhProduct(productId);
    return (p && p.productNameZh) || "";
  }

  function productName(productId, english) {
    return (isZh() && zhProductName(productId)) || english || "";
  }

  function zhSignals(productId, trendId) {
    if (!isZh() || !zhData) return null;
    const p = zhData.products[productId];
    if (!p || !p.signals || !p.signals.trends) return null;
    return p.signals.trends.find((x) => x.trendId === trendId) || null;
  }

  function applyStatic(rootEl) {
    const scope = rootEl || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      const val = t(k);
      if (el.hasAttribute("data-i18n-attr")) el.setAttribute(el.getAttribute("data-i18n-attr"), val);
      else el.textContent = val;
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
  }

  function mountToggle() {
    document.querySelectorAll("[data-lang-toggle]").forEach((box) => {
      box.innerHTML = `<div class="lang-switch" role="group" aria-label="Language">
        <button type="button" data-lang="en" class="${lang === "en" ? "on" : ""}">EN</button>
        <button type="button" data-lang="zh" class="${lang === "zh" ? "on" : ""}">繁中</button>
      </div>`;
      box.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => setLang(b.dataset.lang))
      );
    });
  }

  function setLang(l) {
    lang = l === "zh" ? "zh" : "en";
    try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-Hant-HK" : "en");
    loadZh().then(() => {
      const ev = new CustomEvent("langchange", { detail: { lang } });
      window.dispatchEvent(ev);
      mountToggle();
      applyStatic();
    });
  }

  const api = { t, isZh, lang: () => lang, setLang, loadZh, zhProduct, zhTrend, cProduct, cTrend, zhBrochureTrend, zhSignals, zhProductName, productName, laneLabel, needLabel, rowLabel, applyStatic, mountToggle, DICT: ZH, ROW_LABELS };
  root.I18N = api;
  root.t = t;

  loadZh().then(() => {
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-Hant-HK" : "en");
    mountToggle();
    applyStatic();
    try { window.dispatchEvent(new CustomEvent("langchange", { detail: { lang, initial: true } })); } catch { /* ignore */ }
  });
})();
