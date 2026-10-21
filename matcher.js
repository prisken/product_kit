/* AIA meeting matcher — phrase overlap + lane + evidence. No model. */
(function (root) {
  const STRENGTH_W = { core: 3, secondary: 2, minor: 1 };
  const EVIDENCE_W = { strong: 1.5, medium: 1, weak: 0.35 };

  const LANES = [
    {
      id: "ci",
      label: "Critical illness",
      zh: "危疾 / 重疾",
      keywords: [
        "critical illness", "ci cover", "ci plan", "cancer", "heart disease", "stroke",
        "early stage", "lump sum", "危疾", "重疾", "癌症", "心脏病", "心臟病", "中风", "中風",
        "早期危疾", "严重疾病", "嚴重疾病", "顶唔够", "頂唔夠",
      ],
    },
    {
      id: "medical",
      label: "Medical / VHIS",
      zh: "醫療 / 自願醫保",
      keywords: [
        "vhis", "hospital", "ward", "semi-private", "private room", "deductible",
        "reimbursement", "medical card", "outpatient", "hospitalisation",
        "医疗", "醫療", "住院", "病房", "半私", "私家", "自願醫保", "自愿医保",
        "垫底费", "墊底費", "报销", "報銷", "门诊", "門診",
      ],
    },
    {
      id: "accident",
      label: "Accident",
      zh: "意外",
      keywords: ["accident", "ad&d", "dismemberment", "意外", "意外保障", "伤残", "傷殘"],
    },
    {
      id: "term_life",
      label: "Term life / keyman",
      zh: "定期人壽 / Keyman",
      keywords: [
        "term life", "term plan", "keyman", "key man", "key person", "company owned",
        "company owner", "business protection", "定期", "定期人寿", "定期人壽",
        "关键人", "關鍵人", "keyman保险", "keyman保險", "公司买", "公司買", "股东", "股東",
        "business partner", "partner dies", "partner die", "protect company", "protect the company",
        "protect the business", "company protection", "co-founder", "cofounder", "shareholder protection",
        "sales partner", "partner", "生意夥伴", "生意伙伴", "合作夥伴", "合伙人", "公司保障",
      ],
    },
    {
      id: "whole_life",
      label: "Whole / universal life",
      zh: "終身壽險",
      keywords: [
        "whole life", "universal life", "cash value", "estate", "legacy", "succession",
        "终身", "終身", "终身寿", "終身壽", "现金价值", "現金價值", "遗产", "遺產",
        "传承", "傳承",
      ],
    },
    {
      id: "savings",
      label: "Savings / annuity",
      zh: "儲蓄 / 年金",
      keywords: [
        "savings", "annuity", "dividend", "coupon", "retirement income", "education fund",
        "储蓄", "儲蓄", "年金", "分红", "分紅", "退休", "教育金", "回本",
      ],
    },
    {
      id: "ilas",
      label: "ILAS / investment-linked",
      zh: "投資相連",
      keywords: ["ilas", "investment-linked", "unit linked", "投资相连", "投資相連"],
    },
  ];

  const CATEGORIES = {
    hospital_cost_protection: {
      label: "Hospital cost protection",
      aliases: ["住院费", "住院費", "医院账单", "醫院帳單", "医疗费好贵", "醫療費好貴"],
    },
    room_ward_level: {
      label: "Room / ward level",
      aliases: ["半私", "私家房", "病房", "ward", "semi-private", "private room"],
    },
    high_annual_or_lifetime_limit: {
      label: "High annual / lifetime limit",
      aliases: ["保额够唔够", "保額夠唔夠", "annual limit", "lifetime limit", "上限"],
    },
    critical_illness_readiness: {
      label: "Critical illness readiness",
      aliases: ["危疾", "重疾", "癌症", "心脏病", "心臟病", "ci cover", "critical illness"],
    },
    outpatient_and_followup: {
      label: "Outpatient & follow-up",
      aliases: ["门诊", "門診", "覆诊", "覆診", "outpatient", "follow-up"],
    },
    family_protection: {
      label: "Family protection",
      aliases: ["家人", "仔女", "子女", "配偶", "家庭保障", "family", "dependants", "kids", "wife not working", "husband not working", "not working", "two kids", "2 kids", "kids in school", "young children", "breadwinner", "留錢比家人", "留钱给家人", "養家", "养家"],
    },
    income_or_lifestyle_support: {
      label: "Income / lifestyle support",
      aliases: ["收入", "人工", "停工", "lifestyle", "income replacement", "养家", "養家"],
    },
    budget_friendly_entry: {
      label: "Budget-friendly entry",
      aliases: ["平", "预算", "預算", "affordable", "cheap", "entry", "起步"],
    },
    premium_stability: {
      label: "Premium stability",
      aliases: ["保费稳定", "保費穩定", "加保费", "加保費", "level premium", "renewable"],
    },
    flexibility_and_customisation: {
      label: "Flexibility & customisation",
      aliases: ["自选", "自選", "组装", "組裝", "灵活", "靈活", "choose covers", "build"],
    },
    fast_access_and_convenience: {
      label: "Fast access & convenience",
      aliases: ["网络", "網絡", "免找数", "cashless", "24/7", "方便", "network"],
    },
    savings_and_wealth_growth: {
      label: "Savings & wealth growth",
      aliases: ["储蓄", "儲蓄", "回报", "回報", "cash value", "分红", "分紅"],
    },
    legacy_and_estate: {
      label: "Legacy & estate",
      aliases: ["遗产", "遺產", "传承", "傳承", "estate", "beneficiary", "身故", "留錢", "留钱", "身故賠償", "身故赔偿"],
    },
    pre_existing_or_chronic_support: {
      label: "Pre-existing / chronic",
      aliases: ["旧患", "舊患", "慢性病", "pre-existing", "diabetes", "高血压", "高血壓"],
    },
    international_coverage: {
      label: "International coverage",
      aliases: ["海外", "worldwide", "国际", "國際", "内地", "大湾区", "大灣區", "gba"],
    },
  };

  const ROW_QUESTIONS = {
    premium: "What monthly / annual premium range is comfortable?",
    room_level: "Which ward level do they want (ward / semi-private / private)?",
    annual_limit: "Any annual limit they need (for example HK$5m+)?",
    lifetime_limit: "Do they care about a lifetime cap, or must cover be unlimited?",
    ci_coverage: "Which illnesses matter most (cancer only vs full CI list)?",
    waiting_period: "Any recent symptoms, or do they need cover to start soon?",
    outpatient: "Do they also want outpatient / follow-up cover?",
    renewability: "How long should cover last (to 85, to 100, whole life)?",
    add_ons: "Any riders they already know they want (CI, accident, waiver)?",
    network_access: "Do they need a hospital network / cashless arrangement?",
  };

  const STOP = new Set(
    "a an the and or of to for with without but if in on at is are was be this that they them their want wants wanted need needs already has have had just also very more some any only not no yes can could would should about from into over under".split(" ")
  );

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(s) {
    return normalize(s)
      .split(/[^a-z0-9\u4e00-\u9fff]+/)
      .filter((t) => t && t.length > 1 && !STOP.has(t));
  }

  const NEG_BEFORE = /(?:\bno\b|\bnot\b|\bn't\b|\bwithout\b|\bdont\b|\bdon't\b|\bdoesnt\b|\bdoesn't\b|\bno interest in\b|\bnot interested in\b|\brather than\b|唔要|不要|冇興趣|冇兴趣|沒有興趣|并无|並無)\s*$/i;

  function isNegated(notes, index) {
    const before = notes.slice(Math.max(0, index - 48), index);
    return NEG_BEFORE.test(before.replace(/[^a-z0-9\u4e00-\u9fff\s']/g, " "));
  }

  function phraseHit(notes, phrase) {
    const p = normalize(phrase);
    if (!p || p.length < 2) return 0;
    const idx = notes.indexOf(p);
    if (idx >= 0) return isNegated(notes, idx) ? 0 : 1;
    const zh = p.replace(/[^\u4e00-\u9fff]/g, "");
    if (zh.length >= 2) {
      const zi = notes.indexOf(zh);
      if (zi >= 0) return isNegated(notes, zi) ? 0 : 0.95;
    }
    const toks = tokens(p).filter((t) => t.length > 2 || /[\u4e00-\u9fff]/.test(t));
    if (toks.length >= 2) {
      const hits = toks.filter((t) => {
        const i = notes.indexOf(t);
        return i >= 0 && !isNegated(notes, i);
      }).length;
      const ratio = hits / toks.length;
      if (toks.length === 2 && ratio === 1) return 0.8;
      if (toks.length >= 3 && ratio >= 0.7) return 0.55 + 0.2 * ratio;
    }
    return 0;
  }

  function bestSnippet(notesRaw, phrases) {
    const raw = String(notesRaw || "");
    const low = normalize(raw);
    for (const ph of phrases || []) {
      const p = normalize(ph);
      if (!p) continue;
      const i = low.indexOf(p);
      if (i >= 0) {
        const start = Math.max(0, i - 24);
        const end = Math.min(raw.length, i + p.length + 36);
        return raw.slice(start, end).trim();
      }
    }
    return "";
  }

  function laneScores(notes, fields) {
    const blob = normalize(
      [notes, fields && fields.ownerType, fields && fields.existingCoverType, fields && fields.existingCover]
        .filter(Boolean)
        .join(" ")
    );
    const scores = LANES.map((lane) => {
      let s = 0;
      const hits = [];
      for (const k of lane.keywords) {
        const h = phraseHit(blob, k);
        if (h) {
          s += h;
          hits.push(k);
        }
      }
      if (fields && fields.ownerType === "company" && lane.id === "term_life") {
        s += 1.8;
        hits.push("company-owned policy");
      }
      if (fields && fields.ownerType === "company" && lane.id === "whole_life" && /cash value|estate|legacy|whole life|终身|終身|现金价值|現金價值/.test(blob) && !/no interest in cash value|no cash value|no savings/.test(blob)) {
        s += 1.2;
        hits.push("company-owned whole life");
      }
      if (/keyman|key person|key man|關鍵人|关键人/.test(blob) && lane.id === "term_life") {
        s += 2.2;
        hits.push("keyman");
      }
      if (/no interest in cash value|no cash value|no savings|唔要储蓄|不要儲蓄/.test(blob)) {
        if (lane.id === "whole_life" || lane.id === "savings") s -= 2.5;
        if (lane.id === "term_life") s += 1.2;
      }
      if (fields && /ci|危疾|重疾|cancer/i.test(String(fields.existingCoverType || "")) && lane.id === "ci") {
        s += 0.8;
      }
      return { id: lane.id, label: lane.label, zh: lane.zh, score: s, hits: hits.slice(0, 6) };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores;
  }

  function pickLanes(scores) {
    const top = scores[0] && scores[0].score;
    if (!top || top < 0.5) return [];
    const picked = scores.filter((x) => x.score >= Math.max(0.5, top * 0.4) && x.score > 0);
    return picked.slice(0, 3).map((x) => x.id);
  }

  function fillTalkingPoint(template, snippet) {
    const t = String(template || "");
    const detail = snippet ? snippet.replace(/\s+/g, " ").slice(0, 90) : "based on what they told you";
    return t.replace(/\{client_detail\}/g, detail);
  }

  function matchTrend(trend, notes) {
    const pos = trend.clientSignalPhrases || [];
    const neg = trend.negativeSignalPhrases || [];
    let posScore = 0;
    const posHits = [];
    for (const ph of pos) {
      const h = phraseHit(notes, ph);
      if (h) {
        posScore += h;
        posHits.push(ph);
      }
    }
    for (const ph of trend.clientProfileFit || []) {
      const h = phraseHit(notes, ph) * 0.6;
      if (h) posScore += h;
    }
    const cat = CATEGORIES[trend.trendCategory];
    if (cat) {
      for (const a of cat.aliases) {
        const h = phraseHit(notes, a) * 0.7;
        if (h) posScore += h;
      }
    }
    let negScore = 0;
    const negHits = [];
    for (const ph of neg) {
      const h = phraseHit(notes, ph);
      if (h) {
        negScore += h;
        negHits.push(ph);
      }
    }
    const sw = STRENGTH_W[trend.trendStrength] || 1;
    const ew = EVIDENCE_W[trend.evidenceStrength] || 0.35;
    const score = Math.max(0, posScore * sw * ew - negScore * 1.6);
    return {
      trendId: trend.trendId,
      trendName: trend.trendName,
      trendCategory: trend.trendCategory,
      trendStrength: trend.trendStrength,
      evidenceStrength: trend.evidenceStrength,
      whatProductOffers: trend.whatProductOffers,
      talkingPoint: fillTalkingPoint(trend.talkingPointTemplate, bestSnippet(notes, posHits)),
      snippet: bestSnippet(notes, posHits),
      posHits: posHits.slice(0, 5),
      negHits: negHits.slice(0, 4),
      posScore,
      negScore,
      score,
      comparisonRows: trend.comparisonRows || [],
      verificationPrompts: trend.verificationPrompts || [],
      exclusionsOrConditions: trend.exclusionsOrConditions || [],
      keyFigures: trend.keyFigures || [],
      notesForReviewer: trend.notesForReviewer || "",
    };
  }

  function matchCatalog(catalog, notesRaw, fields, selectedLanes) {
    const notes = normalize(notesRaw);
    const laneList = laneScores(notesRaw, fields);
    const autoLanes = pickLanes(laneList);
    const lanes = selectedLanes && selectedLanes.length ? selectedLanes : autoLanes;
    const products = (catalog.products || []).map((p) => {
      const matched = (p.trends || []).map((t) => matchTrend(t, notes)).filter((t) => t.score > 0.15 || t.negHits.length);
      const inLane = !lanes.length || lanes.includes(p.lane);
      const pos = matched.filter((t) => t.score > 0.15);
      let productScore = pos.reduce((s, t) => s + t.score, 0);
      if (!inLane) productScore *= 0.12;
      const hasWeakOnly = pos.length && pos.every((t) => t.evidenceStrength === "weak");
      const hasStrong = pos.some((t) => t.evidenceStrength === "strong");
      const coreHits = pos.filter((t) => t.trendStrength === "core");
      const pls = p.productLevelSummary || {};
      const bestFor = pls.bestForOneLiner || "";
      const offerBlob = [bestFor, p.productName, ...(p.trends || []).map((t) => t.whatProductOffers || "")].join(" ").toLowerCase();
      const keymanish = /keyman|key person|key man|關鍵人|关键人|company owner|company will own|company owned/.test(notes);
      const noCash = /no interest in cash value|no cash value|no savings|no interest in cash value or savings/.test(notes);
      if (keymanish && p.lane === "term_life") productScore += 4.5;
      if (keymanish && /death benefit|large death|working years|renewable term|term cover/.test(offerBlob)) productScore += 1.2;
      if ((keymanish || (fields && fields.ownerType === "company")) && p.lane === "term_life") productScore *= 1.35;
      if (fields && fields.ownerType === "company" && p.lane === "savings") productScore *= 0.4;
      if (noCash && (p.lane === "whole_life" || p.lane === "savings" || p.lane === "ilas")) productScore *= 0.25;
      if (noCash && p.lane === "term_life") productScore += 2.5;
      if (keymanish && /death benefit|working years|15.?20|20-year|20 year/.test(notes) && p.lane === "term_life") {
        if (/1, 5 or 20|5 or 20|20-year|20 year|20-year renewal/.test(offerBlob)) productScore += 2.2;
        if (/yearly renewable/.test(offerBlob)) productScore -= 0.8;
      }
      if (hasWeakOnly) productScore *= 0.4;
      return {
        productId: p.productId,
        productName: p.productName,
        productType: p.productType,
        family: p.family,
        lane: p.lane,
        category: p.category,
        file: p.file,
        bestFor: pls.bestForOneLiner || "",
        notSuitedWhen: pls.notSuitedWhen || [],
        gaps: pls.gapsInSourceMaterial || [],
        inLane,
        score: productScore,
        hasWeakOnly,
        hasStrong,
        coreHits: coreHits.length,
        matchedTrends: pos.sort((a, b) => b.score - a.score),
        negativeHits: matched.filter((t) => t.negHits.length).flatMap((t) => t.negHits.slice(0, 2)),
      };
    });

    products.sort((a, b) => b.score - a.score);

    const catMap = {};
    for (const p of products) {
      if (!p.inLane && lanes.length) continue;
      for (const t of p.matchedTrends) {
        const id = t.trendCategory || "other";
        if (!catMap[id]) {
          catMap[id] = {
            id,
            label: (CATEGORIES[id] && CATEGORIES[id].label) || id,
            score: 0,
            snippets: [],
            posHits: [],
            negHits: [],
            products: [],
          };
        }
        catMap[id].score += t.score;
        if (t.snippet && catMap[id].snippets.length < 3) catMap[id].snippets.push(t.snippet);
        for (const h of t.posHits) if (!catMap[id].posHits.includes(h) && catMap[id].posHits.length < 8) catMap[id].posHits.push(h);
        for (const h of t.negHits) if (!catMap[id].negHits.includes(h) && catMap[id].negHits.length < 6) catMap[id].negHits.push(h);
        if (!catMap[id].products.includes(p.productId)) catMap[id].products.push(p.productId);
      }
    }
    const needs = Object.values(catMap).sort((a, b) => b.score - a.score).slice(0, 6);

    const shortlist = products.filter((p) => p.inLane && p.score > 0.35).slice(0, 8);
    // Never dead-end: if the notes matched nothing, offer the lane's strongest products to browse.
    const browse = shortlist.length
      ? []
      : products
          .filter((p) => p.inLane)
          .sort((a, b) => (b.coreHits - a.coreHits) || (b.hasStrong - a.hasStrong) || (b.matchedTrends.length - a.matchedTrends.length))
          .slice(0, 6);

    return {
      lanes: laneList,
      autoLanes,
      selectedLanes: lanes,
      needs,
      products,
      shortlist,
      browse,
      noSignal: !needs.length && !shortlist.length,
    };
  }

  function narrowQuestions(shortlist) {
    const counts = {};
    for (const p of shortlist || []) {
      for (const t of p.matchedTrends || []) {
        for (const r of t.comparisonRows || []) counts[r] = (counts[r] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, n]) => ({ id, count: n, question: ROW_QUESTIONS[id] || `Clarify ${id.replace(/_/g, " ")}.` }));
  }

  function applyNarrow(result, answers) {
    const ans = answers || {};
    const scored = (result.shortlist || []).map((p) => {
      let s = p.score;
      const rows = new Set((p.matchedTrends || []).flatMap((t) => t.comparisonRows || []));
      for (const [k, v] of Object.entries(ans)) {
        if (!v) continue;
        if (rows.has(k)) s += 0.35;
      }
      return { ...p, score: s };
    });
    scored.sort((a, b) => b.score - a.score);
    return { ...result, shortlist: scored };
  }


  const NEED_LABELS = {
    family_protection: "Family protection",
    income_or_lifestyle_support: "Income if he cannot work",
    hospital_cost_protection: "Hospital bills",
    room_ward_level: "Ward / room level",
    high_annual_or_lifetime_limit: "High annual or lifetime limit",
    critical_illness_readiness: "Critical illness lump sum",
    outpatient_and_followup: "Outpatient and follow-up",
    savings_and_wealth_growth: "Savings toward a dated goal",
    legacy_and_estate: "Legacy and estate",
    pre_existing_or_chronic_support: "Pre-existing or chronic condition",
    international_coverage: "Overseas cover",
    budget_friendly_entry: "Budget-friendly entry",
    premium_stability: "Premium stability",
    flexibility_and_customisation: "Flexible, self-chosen cover",
    fast_access_and_convenience: "Fast access",
  };

  const NEED_RULES = [
    { id: "family_protection", re: /\b(family|kids?|children|child|wife|husband|married|spouse|dependants?|dependents?|girlfriend|boyfriend|partner|newborn|baby|breadwinner|mortgage)\b|家庭|小朋友|子女|老婆|老公|供樓|伴侶/i },
    { id: "income_or_lifestyle_support", re: /\b(income|salary|can'?t work|cannot work|unable to work|disab\w+|pay the bills|provide for)\b|收入|入息|不能工作|傷殘/i },
    { id: "hospital_cost_protection", re: /\b(hospital|hospitalis\w+|surgery|operation|inpatient|ward|medical bills?|vhis|health ?insurance|medical cover)\b|住院|醫院|手術|醫療|睇醫生/i },
    { id: "critical_illness_readiness", re: /\b(cancer|critical illness|\bci\b|stroke|heart attack|heart disease|kidney failure|serious illness|chemo\w*|tumour|tumor)\b|癌症|危疾|重疾|中風|心臟|腫瘤/i },
    { id: "savings_and_wealth_growth", re: /\b(house|flat|property|home|deposit|down ?payment|education|school fees?|university|retire\w*|savings?|save up|nest egg)\b|買樓|上車|首期|儲錢|退休|教育基金/i },
    { id: "legacy_and_estate", re: /\b(estate|legacy|inheritance|pass on|next generation)\b|遺產|傳承/i },
    { id: "pre_existing_or_chronic_support", re: /\b(pre-?existing|existing condition|chronic|diabetes|hypertension|high blood pressure)\b|現有疾病|慢性病|糖尿/i },
    { id: "outpatient_and_followup", re: /\b(outpatient|follow-?up|\bgp\b|clinic|consultation)\b|門診|覆診/i },
    { id: "room_ward_level", re: /\b(semi-?private|private room|ward level|room and board)\b|半私家|私家房|病房級別/i },
    { id: "high_annual_or_lifetime_limit", re: /\b(annual limit|lifetime limit|coverage limit|big bill)\b|每年限額|終身限額/i },
    { id: "budget_friendly_entry", re: /\b(budget|afford\w*|cheap|tight|low cost)\b|預算|平啲|保費/i },
    { id: "international_coverage", re: /\b(overseas|abroad|international|migration|emigrat\w+)\b|海外|外國|移民/i },
    { id: "flexibility_and_customisation", re: /\b(customi[sz]e|choose the cover|mix and match|flexib\w+)\b|自選|靈活/i },
  ];

  function sentenceWith(text, needle) {
    const parts = String(text).split(/(?<=[.!?。！？])\s*/);
    const hit = parts.find((x) => x.toLowerCase().includes(String(needle).toLowerCase()));
    return (hit || "").trim().slice(0, 160);
  }

  function detectNeeds(notesRaw, fields, aiNeeds) {
    const text = String(notesRaw || "");
    const out = [];
    const seen = new Set();
    const add = (id, needle, extra) => {
      if (seen.has(id)) return;
      seen.add(id);
      out.push({
        id,
        label: NEED_LABELS[id] || id,
        score: 1,
        snippets: needle ? [sentenceWith(text, needle)] : [],
        posHits: [needle || "in notes"],
        negHits: [],
        products: [],
        ...(extra || {}),
      });
    };
    for (const r of NEED_RULES) {
      const m = text.match(r.re);
      if (!m) continue;
      add(r.id, m[0]);
    }
    // "no cover today" is a coverage gap, not a product wish.
    if (/\b(no|not any|without)\s+(existing\s+)?(insurance|cover|policy)\b|\buninsured\b|冇保險|沒有保險|未買過/i.test(text)) {
      add("family_protection", "no cover today");
      add("hospital_cost_protection", "no cover today");
    }
    // Care burden from a parent's illness is income/family, never the client's own condition.
    if (/parents?\b/i.test(text) && /(illness|sick|care|older|ageing|aging)/i.test(text)) add("income_or_lifestyle_support", "parents need care");
    // Negation: do not push savings when the client refused it.
    const noSave = /no (?:interest in )?(?:savings|cash value)|don'?t want (?:savings|cash value)|not interested in (?:savings|cash value)|唔要儲蓄|唔想儲錢|唔需要儲蓄/i.test(text);
    if (noSave) {
      for (let i = out.length - 1; i >= 0; i--) if (out[i].id === "savings_and_wealth_growth") out.splice(i, 1);
      seen.delete("savings_and_wealth_growth");
    }
    for (const id of aiNeeds || []) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, label: NEED_LABELS[id] || id, score: 0, snippets: [], posHits: ["AI read"], negHits: [], products: [], fromAi: true });
    }
    // Vague worry still has to land somewhere useful.
    if (!out.length && /\b(worr\w*|afraid|scared|what if|something happens)\b|擔心|驚|唔知點算/i.test(text)) {
      add("family_protection", "worry");
      add("hospital_cost_protection", "worry");
    }
    return out;
  }

  const api = {
    LANES,
    CATEGORIES,
    ROW_QUESTIONS,
    normalize,
    laneScores,
    pickLanes,
    matchCatalog,
    detectNeeds,
    NEED_LABELS,
    narrowQuestions,
    applyNarrow,
    fillTalkingPoint,
  };
  root.AIAMatch = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
