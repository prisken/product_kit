import json, os

OUT = "/Users/priskenlo/.openclaw/workspace/main/sales-kits/trends-review/data"
os.makedirs(OUT, exist_ok=True)

docs = []

# ---------------------------------------------------------------- 1. Prime Care Pro 2
pid = "prime-care-pro-critical-illness-insurance-plan-2"
docs.append({
  "productId": pid,
  "productName": "Prime Care Pro Critical Illness Insurance Plan 2",
  "productType": "critical illness insurance",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_critical_illness_readiness",
      "trendCategory": "critical_illness_readiness",
      "isNewCategory": False,
      "trendName": "100 illnesses covered to age 100",
      "whatProductOffers": "A participating critical illness plan covering 54 critical illnesses, 7 severe child diseases and 39 early stage critical illnesses, with cover to age 100 and a lump-sum payout on diagnosis.",
      "keyFigures": [
        {"label": "Total illnesses covered", "value": "100", "condition": "54 critical + 7 severe child diseases + 39 early stage"},
        {"label": "Benefit term", "value": "Up to age 100", "condition": "policy must remain in force"},
        {"label": "Issue age", "value": "15 days to age 65", "condition": "at policy issue"}
      ],
      "exclusionsOrConditions": [
        "Cover is limited to the 100 named illnesses in the policy; conditions outside the list are not payable.",
        "Benefit term runs to age 100 only while premiums are paid and the policy is in force.",
        "Brochure excerpt does not state a waiting period or the full exclusions list."
      ],
      "clientSignalPhrases": [
        "wants all-round CI cover",
        "worried about cancer in the family",
        "asked how many illnesses are covered",
        "wants cover that lasts to 100",
        "early stage also covered?",
        "one lump sum on diagnosis",
        "doesn't want a hospital plan",
        "mid-30s, no cover yet",
        "wants cover for child diseases too",
        "compared with other CI plans"
      ],
      "negativeSignalPhrases": [
        "only wants hospital bill reimbursement",
        "needs cover starting today for an existing condition",
        "budget under HK$1,000 a month"
      ],
      "clientProfileFit": [
        "Working adults aged 25-50 with no existing critical illness cover",
        "Parents who want cover for severe child diseases as well as adult conditions",
        "Clients who prefer a lump sum over medical bill reimbursement"
      ],
      "priorityAlignment": ["coverage", "cost"],
      "talkingPointTemplate": "It covers 100 illnesses in one plan, so if {client_detail} is diagnosed with a covered critical or early stage illness, the payout is a lump sum they can use however they need.",
      "verificationPrompts": [
        "Confirm the full 100-illness list and any waiting period in the policy contract.",
        "Confirm whether the sum assured is level or can be adjusted."
      ],
      "comparisonRows": ["ci_coverage", "lifetime_limit", "waiting_period"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "It covers 54 critical illnesses, 7 severe child diseases and 39 early stage critical illnesses, giving you support even for conditions like Carcinoma-in-situ.",
        "Prime Care Pro Critical Illness Insurance Plan 2 provides critical illness protection up to the age of 100."
      ],
      "notesForReviewer": "Brochure text supplied is truncated at 6,000 characters; the benefits schedule and premium table were not included."
    },
    {
      "trendId": pid + "_critical_illness_readiness_early_stage",
      "trendCategory": "critical_illness_readiness",
      "isNewCategory": False,
      "trendName": "Early stage CI advance payments",
      "whatProductOffers": "Pays an advance payment for 39 early stage critical illnesses including carcinoma-in-situ, with up to 2 advance payments where carcinoma-in-situ is diagnosed in 2 different organ groups.",
      "keyFigures": [
        {"label": "Early stage illnesses covered", "value": "39", "condition": "named early stage conditions"},
        {"label": "Advance payments for carcinoma-in-situ", "value": "Up to 2", "condition": "diagnosed in 2 different organ groups"}
      ],
      "exclusionsOrConditions": [
        "Advance payments reduce the sum assured available for later claims.",
        "Multiple payments for carcinoma-in-situ require diagnosis in 2 different organ groups.",
        "Brochure excerpt does not state the advance payment percentage."
      ],
      "clientSignalPhrases": [
        "what if it's found early",
        "cancer screening came back abnormal",
        "wants cover before it's serious",
        "asked about carcinoma-in-situ",
        "family history of breast cancer",
        "doesn't want to wait until stage 3",
        "early stage payout?",
        "wants a second payout if it comes back elsewhere"
      ],
      "negativeSignalPhrases": [
        "only cares about late-stage cover",
        "wants full sum assured for early stage",
        "already diagnosed with carcinoma-in-situ"
      ],
      "clientProfileFit": [
        "Clients with family history who prioritise early diagnosis",
        "Women who want carcinoma-in-situ and breast-related cover",
        "Clients who value staged payouts over a single claim"
      ],
      "priorityAlignment": ["coverage", "access"],
      "talkingPointTemplate": "Because {client_detail} is worried about early diagnosis, the plan pays an advance benefit at early stage, including up to two payments for carcinoma-in-situ in different organ groups.",
      "verificationPrompts": [
        "Confirm the advance payment percentage and its effect on the remaining sum assured.",
        "Confirm the exact organ group definitions for the 2-payment carcinoma-in-situ benefit."
      ],
      "comparisonRows": ["ci_coverage", "waiting_period"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "It also provides cover for Carcinoma-in-situ by up to 2 advance payments if it is diagnosed in 2 different organ groups.",
        "This plan also provides cover for diabetic complications such as Diabetic Retinopathy and Endovascular Treatment of Peripheral Arterial Disease."
      ],
      "notesForReviewer": "Advance payment percentages and the organ-group table are not in the supplied excerpt."
    },
    {
      "trendId": pid + "_savings_and_wealth_growth",
      "trendCategory": "savings_and_wealth_growth",
      "isNewCategory": False,
      "trendName": "Participating plan with dividends",
      "whatProductOffers": "A participating plan that pays non-guaranteed annual dividends which accumulate with interest, alongside critical illness cover.",
      "keyFigures": [
        {"label": "Dividend type", "value": "Annual Dividends", "condition": "non-guaranteed, declared yearly"},
        {"label": "Accumulation", "value": "Dividends accumulate with interest", "condition": "while policy in force"}
      ],
      "exclusionsOrConditions": [
        "Annual dividends and the one-off non-guaranteed amount are not guaranteed and may be zero.",
        "Illustrated values in the brochure are not a forecast of future performance.",
        "Surrendering early may return less than total premiums paid."
      ],
      "clientSignalPhrases": [
        "wants protection plus something back",
        "doesn't like pure term cover",
        "asked about dividends",
        "wants long-term value",
        "planning for retirement too",
        "whole life CI with savings",
        "prefers a participating plan",
        "wants to leave something for the kids"
      ],
      "negativeSignalPhrases": [
        "wants maximum cover for lowest premium",
        "only wants pure protection",
        "needs guaranteed returns"
      ],
      "clientProfileFit": [
        "Clients who want cover plus a savings component",
        "Long-horizon buyers aged 30-45",
        "Clients already maxing pure term cover"
      ],
      "priorityAlignment": ["growth", "coverage"],
      "talkingPointTemplate": "For {client_detail}, this is a participating plan, so on top of the illness payout there are annual dividends that accumulate with interest if not withdrawn.",
      "verificationPrompts": [
        "Pull the current dividend illustration and show guaranteed versus non-guaranteed columns.",
        "Confirm surrender value at years 5, 10 and 20."
      ],
      "comparisonRows": ["premium", "ci_coverage"],
      "trendStrength": "secondary",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "non-guaranteed cash amounts distributed on a yearly basis, called Annual Dividends, which have accumulated with interest under this policy",
        "a participating insurance plan that provides you with life insurance, critical illness protection in lump sum payment and potential wealth accumulation"
      ],
      "notesForReviewer": "No dividend scale or illustrated values appear in the supplied 6,000-character excerpt."
    },
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Death benefit with dividends",
      "whatProductOffers": "Pays a death benefit equal to the current sum assured plus accumulated annual dividends and a one-off non-guaranteed amount to a nominated beneficiary.",
      "keyFigures": [
        {"label": "Death benefit components", "value": "Current Sum Assured + accumulated Annual Dividends + one-off non-guaranteed amount", "condition": "insured passes away while policy in force"}
      ],
      "exclusionsOrConditions": [
        "The one-off amount is non-guaranteed.",
        "Death benefit is reduced by any critical illness benefits already paid.",
        "Suicide, non-disclosure and other standard policy exclusions are not detailed in the excerpt."
      ],
      "clientSignalPhrases": [
        "main breadwinner",
        "two young kids",
        "wants something for the family",
        "mortgage still running",
        "asked what happens if he dies",
        "wants cover that pays the wife",
        "planning estate",
        "no dependants cover yet"
      ],
      "negativeSignalPhrases": [
        "single with no dependants",
        "only wants illness cover",
        "already has a separate term life plan"
      ],
      "clientProfileFit": [
        "Parents with dependent children",
        "Sole or main income earner in the household",
        "Clients with an outstanding mortgage"
      ],
      "priorityAlignment": ["coverage", "growth"],
      "talkingPointTemplate": "Since {client_detail} is the main earner, the same plan also pays a death benefit of the current sum assured plus accumulated dividends to the nominated beneficiary.",
      "verificationPrompts": [
        "Confirm how previous critical illness claims reduce the death benefit.",
        "Confirm beneficiary nomination process."
      ],
      "comparisonRows": ["ci_coverage", "lifetime_limit"],
      "trendStrength": "secondary",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "The death benefit will include: i. Current Sum Assured; ii. non-guaranteed cash amounts distributed on a yearly basis, called Annual Dividends, which have accumulated with interest under this policy"
      ],
      "notesForReviewer": "Excerpt cuts off mid-sentence at the third death benefit component."
    },
    {
      "trendId": pid + "_premium_stability",
      "trendCategory": "premium_stability",
      "isNewCategory": False,
      "trendName": "Premium waived after major claim",
      "whatProductOffers": "Waives the subsequent premiums of the basic policy once a major illness claim is paid, and offers 3 premium payment terms from 10 to 25 years.",
      "keyFigures": [
        {"label": "Premium payment terms", "value": "3 options", "condition": "from 10 to 25 years"},
        {"label": "Premium waiver", "value": "Subsequent basic policy premiums waived", "condition": "after any major illness claim is made"}
      ],
      "exclusionsOrConditions": [
        "Waiver applies to the basic policy only, not necessarily to riders.",
        "The exact payment terms available depend on the plan version and issue age.",
        "Premium amounts are not stated in the supplied excerpt."
      ],
      "clientSignalPhrases": [
        "worried about paying after diagnosis",
        "wants premiums to stop if sick",
        "asked about premium waiver",
        "fixed budget every month",
        "wants to finish paying before retirement",
        "can choose 10 or 25 years?",
        "doesn't want to lapse after a claim"
      ],
      "negativeSignalPhrases": [
        "wants the shortest possible payment term only",
        "needs a guaranteed premium for life",
        "only interested in single premium"
      ],
      "clientProfileFit": [
        "Clients on a fixed monthly budget",
        "Buyers in their 40s who want premiums finished before retirement",
        "Clients worried about lapsing after a health event"
      ],
      "priorityAlignment": ["cost", "flexibility"],
      "talkingPointTemplate": "If {client_detail} makes a major illness claim, the remaining premiums on the basic policy are waived, so cover does not lapse when income is stretched.",
      "verificationPrompts": [
        "Confirm the waiver wording and whether riders are included.",
        "Confirm which of the 3 payment terms apply at the client's issue age."
      ],
      "comparisonRows": ["premium", "ci_coverage"],
      "trendStrength": "secondary",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "If any major illness claims are made, the subsequent premium of the basic policy will be waived",
        "You can choose among 3 premium payment terms from 10 to 25 years"
      ],
      "notesForReviewer": "Premium waiver and payment-term wording comes from the AIA product webpage, not the truncated brochure text."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_critical_illness_readiness",
    "bestForOneLiner": "A participating critical illness plan covering 100 illnesses to age 100, with early stage advance payments and accumulated dividends.",
    "notSuitedWhen": [
      "The client wants reimbursement of hospital bills rather than a lump sum",
      "The client needs cover for an existing or pre-diagnosed condition",
      "The client wants the lowest-cost pure protection with no savings element"
    ],
    "gapsInSourceMaterial": [
      "Premium rate table and sum assured limits",
      "Full exclusions and waiting period",
      "Advance payment percentages for early stage conditions",
      "Dividend illustration values"
    ]
  }
})

# ---------------------------------------------------------------- 2. Runner Guard
pid = "runner-guard"
docs.append({
  "productId": pid,
  "productName": "Runner Guard",
  "productType": "personal accident insurance",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_fast_access_and_convenience",
      "trendCategory": "fast_access_and_convenience",
      "isNewCategory": False,
      "trendName": "Event-day cover, single premium",
      "whatProductOffers": "Short-term accident cover bought for a single running event, with benefit periods of 1 day, 3 days, 30 days or 90 days and a single premium payment.",
      "keyFigures": [
        {"label": "Benefit periods", "value": "1 day / 3 days / 30 days / 90 days", "condition": "selected at application"},
        {"label": "Premium payment mode", "value": "Single premium", "condition": "one-off payment"},
        {"label": "Covered duration", "value": "Assigned start time to finish line or withdrawal", "condition": "includes immediate emergency medical assistance"}
      ],
      "exclusionsOrConditions": [
        "Cover starts at the assigned start time, not at registration or warm-up.",
        "Award ceremonies and post-event activities are excluded.",
        "Cover ends when the insured withdraws or crosses the finish line."
      ],
      "clientSignalPhrases": [
        "running a marathon next month",
        "just needs cover for race day",
        "one-off race, not annual",
        "trail race in November",
        "charity run with colleagues",
        "doesn't want a yearly policy",
        "asked if race entry includes insurance",
        "weekend race, quick cover"
      ],
      "negativeSignalPhrases": [
        "wants year-round accident cover",
        "wants cover for gym sessions",
        "needs cover for a multi-sport event"
      ],
      "clientProfileFit": [
        "Amateur runners entering one or two races a year",
        "Charity run participants",
        "Travellers doing an overseas marathon within the covered period"
      ],
      "priorityAlignment": ["access", "cost"],
      "talkingPointTemplate": "Since {client_detail} only needs cover around race day, Runner Guard is bought per event with a single premium and runs from the start gun to the finish line.",
      "verificationPrompts": [
        "Confirm the event meets all eight covered-run criteria before submission.",
        "Confirm which benefit period matches the race date and travel plans."
      ],
      "comparisonRows": ["premium", "network_access"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Period of Insurance (Benefit Term) 1 Day / 3 Days / 30 Days / 90 Days",
        "Premium Payment Mode Single premium",
        "Within the duration of a covered running event, starting from the assigned start time and ending when the insured withdraws from such event or crosses the finish line"
      ],
      "notesForReviewer": "Premium amounts are not in the supplied excerpt."
    },
    {
      "trendId": pid + "_income_or_lifestyle_support",
      "trendCategory": "income_or_lifestyle_support",
      "isNewCategory": False,
      "trendName": "Lump sum for running injuries",
      "whatProductOffers": "Pays a lump sum for covered running injuries to help with treatment, recovery or time off work, including 100% of the sum assured for cardiac arrest, coma of at least 48 hours, permanent loss of limb or sight, or death.",
      "keyFigures": [
        {"label": "Cardiac arrest / coma / permanent loss / death", "value": "100% of sum assured", "condition": "within the covered duration of participation"},
        {"label": "Coma duration", "value": "At least 48 hours", "condition": "unconsciousness due to accident"},
        {"label": "Exertional heat stroke", "value": "HK$10,000 per accident", "condition": "hospitalised at least 24 hours"},
        {"label": "Tendon rupture / ligament tear", "value": "10% of sum assured with surgery; HK$5,000 without surgery", "condition": "covered injury during the event"}
      ],
      "exclusionsOrConditions": [
        "Only the single highest-benefit injury is paid when multiple covered injuries occur in one accident.",
        "The policy ends automatically once 100% of the sum assured is paid.",
        "Injuries outside the covered duration, including warm-up before the assigned start time, are not covered."
      ],
      "clientSignalPhrases": [
        "worried about losing income if injured",
        "self-employed, can't afford time off",
        "asked what happens if he tears a ligament",
        "wants a lump sum, not bills",
        "had a friend who tore an Achilles",
        "needs cover for recovery time",
        "training for a first marathon",
        "wants cash if he can't run or work"
      ],
      "negativeSignalPhrases": [
        "wants medical expense reimbursement only",
        "wants cover for ordinary gym injuries",
        "expects multiple payouts per accident"
      ],
      "clientProfileFit": [
        "Self-employed runners with no sick leave",
        "Competitive amateur runners doing multiple races",
        "Clients whose income stops if they cannot walk or train"
      ],
      "priorityAlignment": ["coverage", "access"],
      "talkingPointTemplate": "For {client_detail}, a covered race injury pays a lump sum that can replace income during recovery, not just reimburse receipts.",
      "verificationPrompts": [
        "Confirm the benefit schedule percentages for each covered injury type.",
        "Confirm whether the sum assured reduces after a partial payment."
      ],
      "comparisonRows": ["premium", "ci_coverage"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "we will pay you a lump sum to help cover the cost of treatment, recovery or time off work",
        "Runner Guard will pay 100% of the sum assured in the unfortunate event that happened within the Covered Duration of Participation"
      ],
      "notesForReviewer": "The Wild Nature Benefit details are cut off in the supplied excerpt."
    },
    {
      "trendId": pid + "_high_annual_or_lifetime_limit",
      "trendCategory": "high_annual_or_lifetime_limit",
      "isNewCategory": False,
      "trendName": "Up to HK$1,000,000 sum assured",
      "whatProductOffers": "Two plan sizes, with Plan 1 at HK$500,000 sum assured and Plan 2 at HK$1,000,000 sum assured.",
      "keyFigures": [
        {"label": "Plan 1 sum assured", "value": "HK$500,000", "condition": "age 18-70 at application"},
        {"label": "Plan 2 sum assured", "value": "HK$1,000,000", "condition": "age 18-55 at application"},
        {"label": "Currency", "value": "HK$", "condition": "Hong Kong dollar policies"}
      ],
      "exclusionsOrConditions": [
        "This is a sum assured, not an annual or lifetime medical limit.",
        "Plan 2 is only available to applicants aged 18-55.",
        "The policy terminates once 100% of the sum assured is paid."
      ],
      "clientSignalPhrases": [
        "wants a big lump sum",
        "asked about the maximum cover",
        "high earner, needs bigger cover",
        "compared Plan 1 and Plan 2",
        "wants HK$1m cover for race day",
        "worried one injury could cost a lot",
        "only 45, can still get Plan 2"
      ],
      "negativeSignalPhrases": [
        "wants the cheapest option only",
        "over 55 and wants the HK$1m plan",
        "needs medical expense limits instead"
      ],
      "clientProfileFit": [
        "Higher-income runners wanting a larger lump sum",
        "Applicants aged 18-55 who qualify for Plan 2",
        "Clients doing ultra or trail races"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "If {client_detail} wants a meaningful payout rather than a token benefit, Plan 2 provides a HK$1,000,000 sum assured for a single race period.",
      "verificationPrompts": [
        "Confirm the applicant's age meets the Plan 2 eligibility range.",
        "Confirm whether any sum assured limits apply per life across policies."
      ],
      "comparisonRows": ["premium", "ci_coverage", "lifetime_limit"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Sum Assured HK$500,000 HK$1,000,000",
        "Insured's Age of Application Age 18 - 70 Age 18 - 55"
      ],
      "notesForReviewer": "Sum assured is event-based, not an annual limit; mapped to this category for comparison only."
    },
    {
      "trendId": pid + "_flexibility_and_customisation",
      "trendCategory": "flexibility_and_customisation",
      "isNewCategory": False,
      "trendName": "Two plans, four durations",
      "whatProductOffers": "Lets the client choose between two sum assured levels and four benefit periods to match a single race or a short race season.",
      "keyFigures": [
        {"label": "Plan options", "value": "2", "condition": "Plan 1 or Plan 2"},
        {"label": "Benefit period options", "value": "4", "condition": "1, 3, 30 or 90 days"}
      ],
      "exclusionsOrConditions": [
        "Plan 2 is restricted to applicants aged 18-55; Plan 1 to 18-70.",
        "Each policy covers one event window only.",
        "The event must satisfy all eight covered-run conditions."
      ],
      "clientSignalPhrases": [
        "two races in one month",
        "wants cover for the whole season",
        "asked about 90-day option",
        "only needs one day",
        "running a 3-day stage race",
        "wants to pick the cover level",
        "compare the two plans",
        "not sure how long cover lasts"
      ],
      "negativeSignalPhrases": [
        "wants a multi-year policy",
        "wants cover for non-running sports",
        "needs cover for an event under 3,000m only"
      ],
      "clientProfileFit": [
        "Runners doing a race series within 90 days",
        "Travellers combining a race with a short trip",
        "Clients choosing cover based on race distance and cost"
      ],
      "priorityAlignment": ["flexibility", "cost"],
      "talkingPointTemplate": "For {client_detail}, we can match the 90-day option to a race season instead of paying for a full year.",
      "verificationPrompts": [
        "Confirm the exact dates each benefit period covers.",
        "Confirm the event distance and altitude against the covered-run criteria."
      ],
      "comparisonRows": ["premium", "ci_coverage"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Period of Insurance (Benefit Term) 1 Day / 3 Days / 30 Days / 90 Days",
        "Sum Assured HK$500,000 HK$1,000,000"
      ],
      "notesForReviewer": "No premium differential between durations is given in the excerpt."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_fast_access_and_convenience",
    "bestForOneLiner": "Short-term accident cover for a single running event, with HK$500,000 or HK$1,000,000 sum assured and 1 to 90 day benefit periods.",
    "notSuitedWhen": [
      "The client wants year-round accident cover",
      "The event is a multi-discipline sport with running as only one element",
      "The event is under 3,000m, above 2,000m altitude, or has fewer than 50 participants"
    ],
    "gapsInSourceMaterial": [
      "Premium table for each plan and duration",
      "Full Wild Nature Benefit schedule",
      "Full exclusions and claims procedure"
    ]
  }
})

# ---------------------------------------------------------------- 3. Secure First
pid = "secure-first"
docs.append({
  "productId": pid,
  "productName": "Secure First",
  "productType": "accident protection insurance plan",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_premium_stability",
      "trendCategory": "premium_stability",
      "isNewCategory": False,
      "trendName": "12-year premiums, lifetime cover",
      "whatProductOffers": "A 12-year premium payment term with premiums guaranteed to remain level, while accidental death cover continues for life.",
      "keyFigures": [
        {"label": "Premium payment term", "value": "12 years", "condition": "fixed"},
        {"label": "Accidental death benefit term", "value": "Whole life", "condition": "policy in force"},
        {"label": "Premium level", "value": "Guaranteed level", "condition": "throughout the 12-year payment term"}
      ],
      "exclusionsOrConditions": [
        "Premium guarantee applies only to the 12-year payment term, not beyond it.",
        "Dismemberment and permanent total disability benefits end at age 76.",
        "Premium rates vary by age, gender and smoking status in the rate table (not in excerpt)."
      ],
      "clientSignalPhrases": [
        "doesn't want to pay forever",
        "wants premiums fixed",
        "asked how many years to pay",
        "wants lifetime accident cover",
        "budget fixed for 12 years",
        "hates premium increases",
        "planning to retire soon",
        "wants cover that outlasts the mortgage"
      ],
      "negativeSignalPhrases": [
        "wants single premium only",
        "needs investment returns",
        "wants to stop cover after 10 years"
      ],
      "clientProfileFit": [
        "Clients aged 35-55 wanting cover into retirement",
        "Budget-conscious buyers who dislike repricing",
        "Parents paying for a child's long-term accident cover"
      ],
      "priorityAlignment": ["cost", "coverage"],
      "talkingPointTemplate": "For {client_detail}, the premiums are fixed for 12 years and the accidental death cover then continues for life, so there is no repricing later.",
      "verificationPrompts": [
        "Confirm the annual premium from the rate table for the client's age and smoking status.",
        "Confirm what happens to cover after the 12-year payment term ends."
      ],
      "comparisonRows": ["premium", "renewability", "lifetime_limit"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Secure First. 12-year premium payment plan with lifetime protection",
        "Premium amounts are guaranteed to remain level throughout the premium payment term."
      ],
      "notesForReviewer": "The annual premium rate table is cut off in the supplied excerpt."
    },
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Accidental death plus double indemnity",
      "whatProductOffers": "Pays the current sum assured as an accidental death benefit if death occurs within 180 days of an accident, and doubles the payout for specified public transport, elevator and fire scenarios.",
      "keyFigures": [
        {"label": "Claim window", "value": "180 days after the accident", "condition": "death due to accident"},
        {"label": "Double indemnity scenarios", "value": "Public land transport, passenger elevator, fire in theatre/auditorium/hotel/school/hospital", "condition": "at the time of the accident"},
        {"label": "Issue age", "value": "15 days to age 63", "condition": "at policy issue"}
      ],
      "exclusionsOrConditions": [
        "A taxi or any transport chartered for private travel is excluded from double indemnity.",
        "Mine or construction site elevators are excluded.",
        "Death must occur within 180 days of the accident."
      ],
      "clientSignalPhrases": [
        "commutes by bus and MTR",
        "worried about accidents on the road",
        "main breadwinner",
        "wants double payout for public transport",
        "travels a lot for work",
        "has young children",
        "asked what counts as double",
        "wants a simple accident plan"
      ],
      "negativeSignalPhrases": [
        "only wants illness cover",
        "wants investment growth",
        "needs cover for a pre-existing disability"
      ],
      "clientProfileFit": [
        "Daily public transport commuters",
        "Parents with dependent children",
        "Clients wanting a simple, low-complexity accident plan"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "Because {client_detail} commutes by bus and MTR every day, the double indemnity benefit doubles the payout for a fatal accident on public land transport.",
      "verificationPrompts": [
        "Confirm the maximum sum assured allowed for the client's age and income group.",
        "Confirm the exact double indemnity definitions in the policy."
      ],
      "comparisonRows": ["premium", "lifetime_limit"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "If the insured, who is the person protected under the policy, passes away due to an accident within 180 days after the date of the accident, Secure First will pay a lump sum amount as the Accidental Death Benefit",
        "we will double the compensation paid for Accidental Death Benefit, Accidental Dismemberment Benefit or Permanent Total Disability Benefit"
      ],
      "notesForReviewer": "Sum assured limits and the accidental dismemberment benefit schedule are not in the excerpt."
    },
    {
      "trendId": pid + "_budget_friendly_entry",
      "trendCategory": "budget_friendly_entry",
      "isNewCategory": False,
      "trendName": "Up to 60% premium refund",
      "whatProductOffers": "Refunds up to 60% of total applicable premiums paid if the policy is surrendered, lapses, or ends due to non-accidental death.",
      "keyFigures": [
        {"label": "Cash benefit", "value": "Up to 60% of total applicable premiums paid", "condition": "surrender, lapse or non-accidental death"}
      ],
      "exclusionsOrConditions": [
        "Refund follows a schedule by completed policy years; early surrender returns less.",
        "Total applicable premiums exclude extra premium loading.",
        "Refund is reduced if accident benefits have already been paid."
      ],
      "clientSignalPhrases": [
        "doesn't want to lose everything",
        "asked about surrender value",
        "wants some money back",
        "on a tight budget",
        "worried about wasting premiums",
        "first insurance plan",
        "wants a low-commitment start",
        "compared with pure term accident cover"
      ],
      "negativeSignalPhrases": [
        "wants full premium back",
        "wants investment returns",
        "plans to claim early and surrender"
      ],
      "clientProfileFit": [
        "First-time insurance buyers",
        "Budget-sensitive clients comparing with term cover",
        "Young adults wanting a refund feature"
      ],
      "priorityAlignment": ["cost"],
      "talkingPointTemplate": "For {client_detail}, if the plan is surrendered or lapses, up to 60% of total applicable premiums paid comes back instead of nothing.",
      "verificationPrompts": [
        "Show the refund percentage schedule by policy year.",
        "Confirm how prior accident claims reduce the refund."
      ],
      "comparisonRows": ["premium", "renewability"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Cash Benefit up to 60% of total applicable premiums paid",
        "you will receive a refund of premiums paid for the policy according to the schedule below"
      ],
      "notesForReviewer": "Refund schedule percentages by year are cut off in the excerpt."
    },
    {
      "trendId": pid + "_fast_access_and_convenience",
      "trendCategory": "fast_access_and_convenience",
      "isNewCategory": False,
      "trendName": "Annual check-ups and worldwide help",
      "whatProductOffers": "Provides an annual medical check-up for 12 consecutive years starting after the first policy year, plus 24-hour worldwide emergency assistance with evacuation and repatriation up to HK$/MOP500,000 per life.",
      "keyFigures": [
        {"label": "Medical check-up", "value": "Annually for 12 consecutive years", "condition": "from the end of the first policy year"},
        {"label": "Emergency assistance limit", "value": "HK$/MOP500,000 per life", "condition": "aggregate across AIA policies covering the same insured"},
        {"label": "Assistance availability", "value": "24-hour worldwide", "condition": "accident or unexpected illness while travelling outside HK, Macau or PRC"}
      ],
      "exclusionsOrConditions": [
        "Check-up items may be revised without prior notice.",
        "Assistance applies while travelling outside Hong Kong, Macau or the PRC for a permanent resident.",
        "The HK$500,000 limit is shared across all AIA policies on the same life."
      ],
      "clientSignalPhrases": [
        "travels overseas often",
        "wants a free health check",
        "asked about evacuation cover",
        "works in China frequently",
        "wants more than just payout",
        "values preventive check-ups",
        "family travels together",
        "wants 24-hour hotline"
      ],
      "negativeSignalPhrases": [
        "needs full medical cover abroad",
        "wants hospital bills paid overseas",
        "only cares about death benefit"
      ],
      "clientProfileFit": [
        "Frequent travellers and cross-border workers",
        "Clients who value preventive health checks",
        "Families wanting emergency support while abroad"
      ],
      "priorityAlignment": ["access"],
      "talkingPointTemplate": "For {client_detail}, the plan adds an annual check-up for 12 years and a 24-hour worldwide assistance line, not just a death payout.",
      "verificationPrompts": [
        "Confirm the check-up provider list and what is included.",
        "Confirm whether the assistance limit is shared with other AIA policies."
      ],
      "comparisonRows": ["premium", "network_access", "outpatient"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Starting from the end of first policy year, we will offer medical check-up to the insured annually for 12 consecutive years.",
        "emergency medical evacuation and repatriation of remains up to a HK$ / MOP500,000 per life limit under all policies held with us"
      ],
      "notesForReviewer": "Check-up benefit is preventive, not diagnostic or outpatient treatment cover."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_premium_stability",
    "bestForOneLiner": "A 12-year premium accident plan with lifetime accidental death cover, double indemnity for public transport and up to 60% premium refund.",
    "notSuitedWhen": [
      "The client wants illness or hospital cover",
      "The client wants guaranteed investment growth",
      "The client needs a sum assured above the per-life maximum for their age group"
    ],
    "gapsInSourceMaterial": [
      "Annual premium rate table",
      "Sum assured limits by age and income group",
      "Accidental dismemberment benefit schedule",
      "Full exclusions"
    ]
  }
})

# ---------------------------------------------------------------- 4. Secure First Plus
pid = "secure-first-plus"
docs.append({
  "productId": pid,
  "productName": "Secure First Plus",
  "productType": "accident protection insurance plan",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_premium_stability",
      "trendCategory": "premium_stability",
      "isNewCategory": False,
      "trendName": "Full premium refund, level premiums",
      "whatProductOffers": "A US dollar accident plan with a 12-year premium term, guaranteed level premiums, and a cash benefit refunding up to 100% of total premiums paid.",
      "keyFigures": [
        {"label": "Premium payment term", "value": "12 years", "condition": "fixed"},
        {"label": "Cash benefit", "value": "Up to 100% of total premiums paid", "condition": "surrender, lapse or non-accidental death"},
        {"label": "Currency", "value": "US$", "condition": "policy denominated in US dollars"}
      ],
      "exclusionsOrConditions": [
        "Refund follows a schedule by completed policy years.",
        "Refund is of premiums paid to the basic plan with no extra premium loading and no interest.",
        "Refund is reduced where accident benefits have already been paid."
      ],
      "clientSignalPhrases": [
        "wants US dollar policy",
        "asked about full refund",
        "doesn't want to lose premiums",
        "wants premiums fixed for 12 years",
        "planning for kids' education abroad",
        "holds USD savings",
        "wants accident cover plus money back",
        "compared with Secure First"
      ],
      "negativeSignalPhrases": [
        "wants investment returns on the premium",
        "needs RMB denominated cover",
        "wants a shorter payment term"
      ],
      "clientProfileFit": [
        "Clients with US dollar savings or liabilities",
        "Families planning overseas education",
        "Buyers who want a refund feature alongside accident cover"
      ],
      "priorityAlignment": ["cost", "coverage"],
      "talkingPointTemplate": "For {client_detail}, the plan is in US dollars, premiums are fixed for 12 years, and up to 100% of premiums paid can come back on surrender.",
      "verificationPrompts": [
        "Show the refund percentage schedule by policy year.",
        "Confirm the USD premium and whether currency risk applies to the client."
      ],
      "comparisonRows": ["premium", "renewability", "lifetime_limit"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Secure First Plus offers up to 100% refund of premium with broad cover against accident throughout your life.",
        "Premium amounts are guaranteed to remain level throughout the premium payment term."
      ],
      "notesForReviewer": "Refund schedule and premium table are cut off in the excerpt."
    },
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Broad double indemnity triggers",
      "whatProductOffers": "Pays accidental death cover for life and doubles the benefit for public transport (marine, land or air), passenger elevators, fire in public buildings, pedestrian traffic accidents and flooding or landslides in Hong Kong or Macau.",
      "keyFigures": [
        {"label": "Claim window", "value": "180 days after the accident", "condition": "death due to accident"},
        {"label": "Double indemnity", "value": "2x the applicable benefit", "condition": "one of the listed scenarios at time of accident"},
        {"label": "Issue age", "value": "15 days to age 63", "condition": "at policy issue"}
      ],
      "exclusionsOrConditions": [
        "Mine or construction site elevators are excluded.",
        "Flooding or landslide trigger applies only in Hong Kong or Macau.",
        "Double indemnity payment does not reduce the current sum assured or premium."
      ],
      "clientSignalPhrases": [
        "drives and walks a lot",
        "worried about typhoon season",
        "takes ferries to work",
        "wants double payout for transport accidents",
        "family depends on his income",
        "travels by plane often",
        "asked about landslide cover",
        "wants a simple life accident plan"
      ],
      "negativeSignalPhrases": [
        "only wants medical reimbursement",
        "needs critical illness cover",
        "wants investment-linked returns"
      ],
      "clientProfileFit": [
        "Commuters using ferries, buses, MTR or taxis",
        "Clients in landslide or flooding-prone districts",
        "Families wanting a larger death benefit for accidental causes"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "For {client_detail}, the double indemnity list includes ferries, buses, MTR, taxis, planes, pedestrian accidents and flooding or landslides in Hong Kong, so the payout can be doubled.",
      "verificationPrompts": [
        "Confirm the sum assured and the per-life maximum.",
        "Confirm the double indemnity wording for pedestrian and flooding claims."
      ],
      "comparisonRows": ["premium", "lifetime_limit"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "a fare paying passenger traveling on marine, land or air public transportation, e.g. ferry, bus, coach, train / MTR, taxi or airplane and etc.",
        "a pedestrian injured in a traffic accident and / or struck by any motor-driven / powered vehicle",
        "injured in natural flooding or landslide in Hong Kong or Macau"
      ],
      "notesForReviewer": "Accidental dismemberment schedule and sum assured limits are not in the excerpt."
    },
    {
      "trendId": pid + "_income_or_lifestyle_support",
      "trendCategory": "income_or_lifestyle_support",
      "isNewCategory": False,
      "trendName": "Monthly disability income",
      "whatProductOffers": "Pays 2% of the sum assured monthly for up to 50 months after 6 consecutive months of permanent total disability, with premiums waived during the payment period.",
      "keyFigures": [
        {"label": "Monthly payment", "value": "2% of the sum assured", "condition": "from the 7th month"},
        {"label": "Payment duration", "value": "Up to 50 months", "condition": "while disability continues"},
        {"label": "Qualifying period", "value": "6 consecutive months", "condition": "total and permanent disability within 180 days of accident"},
        {"label": "Eligible age", "value": "Age 18-76", "condition": "for the disability benefit"}
      ],
      "exclusionsOrConditions": [
        "Disability must begin within 180 days of the accident and last 6 consecutive months.",
        "Payments stop if disability ends.",
        "Benefit reduces the current sum assured and future premiums."
      ],
      "clientSignalPhrases": [
        "worried about being unable to work",
        "sole income earner",
        "self-employed",
        "asked about monthly payout",
        "wants income replacement, not a lump sum",
        "manual job, higher accident risk",
        "family has no other income",
        "wants premiums waived if disabled"
      ],
      "negativeSignalPhrases": [
        "wants a single lump sum only",
        "needs critical illness cover",
        "expects payment from month one"
      ],
      "clientProfileFit": [
        "Manual workers and drivers",
        "Sole earners with dependent families",
        "Self-employed clients without employer sick pay"
      ],
      "priorityAlignment": ["coverage", "cost"],
      "talkingPointTemplate": "If {client_detail} cannot work after an accident, the plan pays 2% of the sum assured each month for up to 50 months and waives premiums meanwhile.",
      "verificationPrompts": [
        "Confirm the definition of permanent total disability in the policy.",
        "Confirm how the monthly benefit interacts with the death benefit."
      ],
      "comparisonRows": ["premium", "ci_coverage", "renewability"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "the insured will receive a monthly payment equal to 2% of the sum assured beginning from the 7th month and continuing up to 50 months (while disability continues), and the premium will be waived during this period"
      ],
      "notesForReviewer": "Occupational definitions and any income test are not in the excerpt."
    },
    {
      "trendId": pid + "_international_coverage",
      "trendCategory": "international_coverage",
      "isNewCategory": False,
      "trendName": "US$625,000 overseas assistance",
      "whatProductOffers": "Provides worldwide emergency assistance including medical evacuation and repatriation of remains up to US$625,000 per life, plus a 24-hour worldwide telephone enquiry service.",
      "keyFigures": [
        {"label": "Emergency assistance limit", "value": "US$625,000 per life", "condition": "aggregate across AIA policies on the same insured"},
        {"label": "Availability", "value": "24-hour worldwide", "condition": "for permanent residents of HK, Macau or PRC"},
        {"label": "Currency", "value": "US$", "condition": "limits stated in US dollars"}
      ],
      "exclusionsOrConditions": [
        "Limit is shared across all policies held with AIA covering the same insured.",
        "Service covers evacuation and repatriation, not routine overseas medical bills.",
        "Available to permanent residents of Hong Kong, Macau or the PRC."
      ],
      "clientSignalPhrases": [
        "travels overseas for work",
        "kids studying abroad",
        "wants evacuation cover",
        "asked about repatriation",
        "frequent flyer",
        "worried about accidents abroad",
        "holds US dollar policy",
        "wants a 24-hour hotline"
      ],
      "negativeSignalPhrases": [
        "needs routine overseas medical cover",
        "wants local hospital bills reimbursed",
        "never travels"
      ],
      "clientProfileFit": [
        "Frequent business travellers",
        "Families with children studying overseas",
        "Clients holding US dollar assets"
      ],
      "priorityAlignment": ["access", "coverage"],
      "talkingPointTemplate": "For {client_detail} who travels often, the plan includes up to US$625,000 for emergency evacuation and repatriation anywhere in the world.",
      "verificationPrompts": [
        "Confirm the assistance provider and how to activate the service.",
        "Confirm whether the limit is shared with the client's other AIA policies."
      ],
      "comparisonRows": ["premium", "network_access"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "emergency medical evacuation and repatriation of remains, with per life limit up to US$625,000 under all policies held with us and AIA Company Limited covering the same insured",
        "24-hour worldwide telephone enquiry services"
      ],
      "notesForReviewer": "Assistance is a service benefit, not overseas medical expense reimbursement."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_premium_stability",
    "bestForOneLiner": "A US dollar accident plan with 12-year level premiums, up to 100% premium refund, broad double indemnity and monthly disability income.",
    "notSuitedWhen": [
      "The client wants critical illness or hospital cover",
      "The client needs RMB-denominated protection",
      "The client expects guaranteed investment returns on premiums"
    ],
    "gapsInSourceMaterial": [
      "Annual premium rate table",
      "Sum assured limits by age",
      "Refund percentage schedule",
      "Full exclusions and disability definitions"
    ]
  }
})

# ---------------------------------------------------------------- 5. Silvery Protect
pid = "silvery-protect"
docs.append({
  "productId": pid,
  "productName": "Silvery Protect",
  "productType": "accident protection insurance plan",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_hospital_cost_protection",
      "trendCategory": "hospital_cost_protection",
      "isNewCategory": False,
      "trendName": "HK$20,000 accident medical per accident",
      "whatProductOffers": "Reimburses reasonable and customary accident-related medical expenses up to HK$/MOP20,000 per accident, for treatment incurred within 52 weeks of the accident.",
      "keyFigures": [
        {"label": "Accident medical reimbursement", "value": "Up to HK$/MOP20,000 per accident", "condition": "per insured, per accident"},
        {"label": "Claim period", "value": "Within 52 weeks of the accident", "condition": "treatment must be medically necessary"},
        {"label": "Personal accident protection", "value": "Up to HK$/MOP1,000,000", "condition": "plan dependent"}
      ],
      "exclusionsOrConditions": [
        "Reimbursement is capped per accident, not per year.",
        "Expenses must be reasonable and customary.",
        "Only accident-related treatment is covered; illness is not."
      ],
      "clientSignalPhrases": [
        "mum fell at home",
        "worried about hospital bills after a fall",
        "elderly parent living alone",
        "asked what accidents cover",
        "wants bills reimbursed",
        "father had a hip fracture",
        "needs cover after retirement",
        "wants cash for physio"
      ],
      "negativeSignalPhrases": [
        "needs illness or hospitalisation cover",
        "wants a lump sum only",
        "parent already in a care home"
      ],
      "clientProfileFit": [
        "Seniors aged 66-75 living independently",
        "Adult children buying cover for parents",
        "Retirees who want accident bill reimbursement"
      ],
      "priorityAlignment": ["coverage", "access"],
      "talkingPointTemplate": "For {client_detail}, accident medical bills are reimbursed up to HK$20,000 per accident for treatment within 52 weeks, which covers the physio and follow-up visits after a fall.",
      "verificationPrompts": [
        "Confirm which treatments and providers qualify for reimbursement.",
        "Confirm whether the limit is per accident or per policy year."
      ],
      "comparisonRows": ["annual_limit", "outpatient", "premium"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "A wide range of medical expenses are reimbursable for accident care, up to HK$/MOP20,000 per accident",
        "we will reimburse the reasonable and customary medical expenses incurred within 52 weeks from the date of an accident, up to the maximum limit per accident"
      ],
      "notesForReviewer": "The benefits schedule with per-item sub-limits is not in the excerpt."
    },
    {
      "trendId": pid + "_income_or_lifestyle_support",
      "trendCategory": "income_or_lifestyle_support",
      "isNewCategory": False,
      "trendName": "Hospital income and ADL support",
      "whatProductOffers": "Plan 2 adds accident hospital income and ICU benefits for up to 60 days per accident, plus a Loss of Daily Living Activities benefit payable up to 60 months or age 80.",
      "keyFigures": [
        {"label": "Hospital income duration", "value": "Up to 60 days", "condition": "same accident, Plan 2 only"},
        {"label": "ICU benefit duration", "value": "Up to 60 days", "condition": "same accident, Plan 2 only"},
        {"label": "ADL benefit duration", "value": "Up to 60 months or age 80, whichever earlier", "condition": "loss of 3 of 6 ADLs for at least 6 months"},
        {"label": "ADL claim window", "value": "Within 180 days after the accident", "condition": "confirmed by a registered medical practitioner"}
      ],
      "exclusionsOrConditions": [
        "Hospital income and ICU benefits are Plan 2 only.",
        "ICU benefit is payable only if hospital income is also payable for the same confinement.",
        "Paying the ADL benefit terminates the policy.",
        "ADL benefit requires loss of at least 3 of 6 listed daily living activities for 6 continuous months."
      ],
      "clientSignalPhrases": [
        "needs daily help after a fall",
        "worried about long recovery",
        "wants income while hospitalised",
        "parent needs a helper",
        "asked about ICU cover",
        "stroke risk in the family",
        "wants monthly support, not a lump sum",
        "concerned about care costs"
      ],
      "negativeSignalPhrases": [
        "wants only medical bill reimbursement",
        "needs critical illness cover",
        "parent already needs ADL assistance"
      ],
      "clientProfileFit": [
        "Seniors wanting income support during hospital stays",
        "Families planning for long-term care costs",
        "Clients choosing Plan 2 for broader benefits"
      ],
      "priorityAlignment": ["coverage", "cost"],
      "talkingPointTemplate": "If {client_detail} ends up in hospital or loses daily living independence, Plan 2 pays hospital income and ICU benefits daily and an ADL benefit for up to 60 months.",
      "verificationPrompts": [
        "Confirm the daily hospital income and ICU amounts in the benefits schedule.",
        "Confirm how the ADL benefit amount is calculated."
      ],
      "comparisonRows": ["annual_limit", "outpatient", "premium"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "we will pay an accidental hospital income benefit, up to 60 days for the same accident",
        "This benefit will be paid for up to 60 months while the disability continues, or the insured reached age 80, whichever is earlier"
      ],
      "notesForReviewer": "Daily benefit amounts are not given in the supplied excerpt."
    },
    {
      "trendId": pid + "_outpatient_and_followup",
      "trendCategory": "outpatient_and_followup",
      "isNewCategory": False,
      "trendName": "Physio, acupuncture and chiropractic covered",
      "whatProductOffers": "Reimburses accident-related bone-setting, acupuncture, physiotherapy and chiropractic treatment within the HK$20,000 per accident limit, and pays a lump sum for fractures, dislocations, internal injury or burns within 90 days.",
      "keyFigures": [
        {"label": "Covered follow-up therapies", "value": "Bone-setting, acupuncture, physiotherapy, chiropractic", "condition": "medically necessary, within 52 weeks"},
        {"label": "Broken bones and major injuries", "value": "Lump sum per benefits schedule", "condition": "injury within 90 days of the accident"}
      ],
      "exclusionsOrConditions": [
        "Follow-up therapies share the HK$20,000 per accident limit.",
        "Broken bone benefit requires the injury within 90 days.",
        "Benefit amount depends on the injury schedule, which is not in the excerpt."
      ],
      "clientSignalPhrases": [
        "needs physio after a fall",
        "sees a chiropractor regularly",
        "wants acupuncture covered",
        "had a wrist fracture",
        "recovering from a dislocation",
        "prefers Chinese medicine treatment",
        "wants follow-up visits covered",
        "worried about rehab costs"
      ],
      "negativeSignalPhrases": [
        "wants illness-related physio",
        "needs unlimited sessions",
        "wants a lump sum only"
      ],
      "clientProfileFit": [
        "Active seniors who use physio or chiropractic care",
        "Clients recovering from fractures or dislocations",
        "Seniors who prefer Chinese medicine and bone-setting"
      ],
      "priorityAlignment": ["access", "coverage"],
      "talkingPointTemplate": "For {client_detail} who already sees a physio, the plan reimburses bone-setting, acupuncture, physiotherapy and chiropractic within the accident limit.",
      "verificationPrompts": [
        "Confirm whether provider referrals are required.",
        "Confirm the broken bone benefit amounts by injury type."
      ],
      "comparisonRows": ["outpatient", "annual_limit"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "A range of medically necessary treatments and services are covered, including but not limited to hospitalisation, surgery, bone-setting, acupuncture, physiotherapy and chiropractic treatment."
      ],
      "notesForReviewer": "No separate outpatient sub-limit is stated; therapies share the per-accident maximum."
    },
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Accident cover to age 80",
      "whatProductOffers": "Offers personal accident protection up to HK$/MOP1,000,000 for applicants aged 66-75, with cover continuing to age 80 and a compassionate death benefit.",
      "keyFigures": [
        {"label": "Issue age", "value": "Age 66-75", "condition": "at application"},
        {"label": "Benefit term", "value": "Up to age 80", "condition": "policy in force"},
        {"label": "Personal accident protection", "value": "Up to HK$/MOP1,000,000", "condition": "plan and sum assured selected"}
      ],
      "exclusionsOrConditions": [
        "Applicants must be aged 66-75 at application; cover ends at age 80.",
        "Sum assured depends on the plan selected and underwriting.",
        "Compassionate death benefit terms are not detailed in the excerpt."
      ],
      "clientSignalPhrases": [
        "dad is 68 and uninsured",
        "parents have no accident cover",
        "wants cover for mum in her 70s",
        "retired, no company cover",
        "wants something until 80",
        "worried about elderly accidents",
        "buying for elderly parents",
        "asked if 70-year-old can apply"
      ],
      "negativeSignalPhrases": [
        "parent is 81",
        "wants cover from birth",
        "needs illness cover instead"
      ],
      "clientProfileFit": [
        "Seniors aged 66-75 with no employer cover",
        "Adult children arranging parents' protection",
        "Retirees wanting cover through their 70s"
      ],
      "priorityAlignment": ["coverage", "access"],
      "talkingPointTemplate": "For {client_detail} who is 68 and retired, this is one of the few plans that accepts applicants up to 75 and covers them to age 80.",
      "verificationPrompts": [
        "Confirm the maximum sum assured available at the applicant's age.",
        "Confirm whether medical underwriting applies at 66-75."
      ],
      "comparisonRows": ["premium", "lifetime_limit", "renewability"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Insured's Age at Application Age 66 – 75",
        "Benefit Term Up to age 80",
        "Personal accident protection up to HK$/MOP1,000,000"
      ],
      "notesForReviewer": "Underwriting requirements for this age band are not stated."
    },
    {
      "trendId": pid + "_international_coverage",
      "trendCategory": "international_coverage",
      "isNewCategory": False,
      "trendName": "HK$5m worldwide emergency assistance",
      "whatProductOffers": "Provides worldwide emergency medical evacuation and repatriation of remains up to HK$/MOP5,000,000 per life, plus a 24-hour worldwide telephone enquiry service.",
      "keyFigures": [
        {"label": "Emergency assistance limit", "value": "HK$/MOP5,000,000 per life", "condition": "aggregate across AIA policies on the same insured"},
        {"label": "Availability", "value": "24-hour worldwide", "condition": "for permanent residents of Hong Kong or Macau"}
      ],
      "exclusionsOrConditions": [
        "Limit is shared across all AIA policies covering the same insured.",
        "Covers evacuation and repatriation, not routine overseas medical treatment.",
        "Only for permanent residents of Hong Kong or Macau."
      ],
      "clientSignalPhrases": [
        "parents travel to see grandkids",
        "worried about overseas accidents",
        "snowbirds in winter",
        "wants evacuation cover for mum",
        "travels to China often",
        "asked about repatriation",
        "wants a 24-hour hotline",
        "family lives abroad"
      ],
      "negativeSignalPhrases": [
        "needs overseas hospital bills paid",
        "never leaves Hong Kong",
        "wants local clinic cover only"
      ],
      "clientProfileFit": [
        "Seniors who travel to visit family abroad",
        "Retirees spending part of the year overseas",
        "Families wanting evacuation support for elderly parents"
      ],
      "priorityAlignment": ["access"],
      "talkingPointTemplate": "Because {client_detail} travels to visit grandchildren, the plan includes up to HK$5,000,000 for emergency evacuation and repatriation worldwide.",
      "verificationPrompts": [
        "Confirm how the assistance service is activated overseas.",
        "Confirm whether the limit is shared with other AIA policies."
      ],
      "comparisonRows": ["network_access", "annual_limit"],
      "trendStrength": "minor",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "emergency medical evacuation and repatriation of remains, with a per life limit of up to HK$/MOP5,000,000 (under all policies held with us and AIA Company Limited covering the same insured)"
      ],
      "notesForReviewer": "This is an assistance service, not overseas medical expense cover."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_hospital_cost_protection",
    "bestForOneLiner": "An accident plan for ages 66-75 with HK$20,000 per-accident medical reimbursement, hospital and ICU income, and cover to age 80.",
    "notSuitedWhen": [
      "The applicant is under 66 or over 75",
      "The client needs illness or critical illness cover",
      "The client wants cover beyond age 80"
    ],
    "gapsInSourceMaterial": [
      "Premium table and sum assured options",
      "Per-item benefit schedule and sub-limits",
      "Full exclusions and underwriting rules",
      "Compassionate death benefit amount"
    ]
  }
})

# ---------------------------------------------------------------- 6. Simple Care Essence
pid = "simple-care-essence"
docs.append({
  "productId": pid,
  "productName": "Simple Care Essence",
  "productType": "critical illness insurance",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_budget_friendly_entry",
      "trendCategory": "budget_friendly_entry",
      "isNewCategory": False,
      "trendName": "5-year renewable, 20% discount",
      "whatProductOffers": "A 5-year renewable critical illness plan positioned as budget-friendly, with a permanent 20% premium discount above a specified sum assured and an instant 10% first-year discount for AIA Vitality members.",
      "keyFigures": [
        {"label": "Renewal term", "value": "5 years", "condition": "renewable plan"},
        {"label": "Permanent premium discount", "value": "20%", "condition": "above a specified sum assured, standard premiums only"},
        {"label": "First-year discount", "value": "10%", "condition": "AIA Vitality members, first year only"}
      ],
      "exclusionsOrConditions": [
        "Discounts apply to standard premiums only, not extra premiums from loading.",
        "The 20% discount requires a sum assured above a specified threshold.",
        "AIA Vitality charges an annual membership fee and must be renewed on time.",
        "Premium is not guaranteed beyond each 5-year renewal period."
      ],
      "clientSignalPhrases": [
        "tight budget",
        "just started working",
        "wants cheap CI cover",
        "can't afford whole life",
        "asked about renewal",
        "wants to try CI cover first",
        "young couple, low income",
        "wants a discount",
        "already on AIA Vitality"
      ],
      "negativeSignalPhrases": [
        "wants premiums fixed for life",
        "needs guaranteed renewability to 100",
        "wants a savings plan"
      ],
      "clientProfileFit": [
        "Young adults entering the workforce",
        "Budget-constrained families needing basic CI cover",
        "Existing AIA Vitality members"
      ],
      "priorityAlignment": ["cost", "coverage"],
      "talkingPointTemplate": "For {client_detail} on a tight budget, this is a 5-year renewable CI plan with a 20% permanent discount above the specified sum assured and 10% off the first year with AIA Vitality.",
      "verificationPrompts": [
        "Confirm the specified sum assured threshold for the 20% discount.",
        "Show the renewal premium at the 5-year mark and the maximum renewal age."
      ],
      "comparisonRows": ["premium", "renewability", "ci_coverage"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Giving you budget-friendly protection against a broad range of health challenges, Simple Care Essence is a 5-year renewable plan",
        "You can enjoy a permanent 20% premium discount^ above a specified sum assured, and an instant 10% premium discount for the first year if you join AIA Vitality."
      ],
      "notesForReviewer": "The specified sum assured threshold and actual premium tables are not in the excerpt."
    },
    {
      "trendId": pid + "_critical_illness_readiness",
      "trendCategory": "critical_illness_readiness",
      "isNewCategory": False,
      "trendName": "115 illnesses, early to late stage",
      "whatProductOffers": "Covers 115 major and minor illnesses, including early and late-stage critical illnesses and severe child diseases, with a lump-sum payout and life protection.",
      "keyFigures": [
        {"label": "Illnesses covered", "value": "115", "condition": "major and minor illnesses"},
        {"label": "Coverage scope", "value": "Early and late-stage critical illnesses plus severe child diseases", "condition": "named conditions"},
        {"label": "Benefit term", "value": "Up to age 80", "condition": "policy in force"},
        {"label": "Issue age", "value": "15 days to age 65", "condition": "at application"}
      ],
      "exclusionsOrConditions": [
        "Cover is limited to the 115 named illnesses.",
        "Benefit term ends at age 80, not whole life.",
        "Waiting period and exclusions are not stated in the excerpt."
      ],
      "clientSignalPhrases": [
        "wants wide illness cover",
        "family history of cancer",
        "asked how many illnesses",
        "wants early stage covered",
        "has a young child",
        "needs cover until 80",
        "wants a lump sum",
        "compared with whole life CI"
      ],
      "negativeSignalPhrases": [
        "wants lifetime cover to 100",
        "needs savings growth",
        "only wants hospital reimbursement"
      ],
      "clientProfileFit": [
        "Parents wanting child disease cover",
        "Adults 30-50 needing broad CI cover on a budget",
        "Clients who want early stage cover without whole life premiums"
      ],
      "priorityAlignment": ["coverage", "cost"],
      "talkingPointTemplate": "For {client_detail}, one plan covers 115 illnesses including early stage conditions and severe child diseases, up to age 80.",
      "verificationPrompts": [
        "Confirm the breakdown of major versus minor illnesses.",
        "Confirm the waiting period for early stage conditions."
      ],
      "comparisonRows": ["ci_coverage", "waiting_period", "lifetime_limit"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "This plan also offers life protection ... Simple Care Essence is a 5-year renewable plan that covers as many as 115 major and minor illnesses, including early and late-stage critical illnesses and severe child diseases."
      ],
      "notesForReviewer": "The illness list and payout percentages are not in the excerpt."
    },
    {
      "trendId": pid + "_flexibility_and_customisation",
      "trendCategory": "flexibility_and_customisation",
      "isNewCategory": False,
      "trendName": "Convert to whole life by 70",
      "whatProductOffers": "Can be taken as a stand-alone basic plan or as an add-on to specified basic plans, and includes a conversion privilege to a whole life or whole life with critical illness plan on or before the anniversary following the insured's 70th birthday.",
      "keyFigures": [
        {"label": "Plan form", "value": "Basic plan or add-on plan", "condition": "add-on attaches to specified basic plans"},
        {"label": "Conversion deadline", "value": "On or before the anniversary following age 70", "condition": "subject to additional premium and available products"}
      ],
      "exclusionsOrConditions": [
        "Conversion is subject to additional premium.",
        "Only products then made available for the conversion privilege can be chosen.",
        "Conversion is not guaranteed to be at the original premium rate."
      ],
      "clientSignalPhrases": [
        "wants to start small",
        "already has a basic plan",
        "wants to upgrade later",
        "asked about converting to whole life",
        "not ready for whole life premiums",
        "wants cover that grows with him",
        "planning to convert at 60",
        "wants an add-on rider"
      ],
      "negativeSignalPhrases": [
        "wants whole life from day one",
        "needs a guaranteed conversion product",
        "wants no future underwriting"
      ],
      "clientProfileFit": [
        "Clients who want to start with term and upgrade later",
        "Existing policyholders adding a CI rider",
        "Younger buyers with rising income"
      ],
      "priorityAlignment": ["flexibility"],
      "talkingPointTemplate": "For {client_detail} who is not ready for whole life premiums, this starts as a renewable plan and can be converted to whole life or whole life with CI up to the anniversary after age 70.",
      "verificationPrompts": [
        "Confirm which basic plans accept Simple Care Essence as an add-on.",
        "Confirm the conversion terms and any new underwriting at conversion."
      ],
      "comparisonRows": ["renewability", "add_ons", "premium"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "the option to convert your term plan to a whole life or whole life with critical illness protection plan",
        "The conversion privilege is available on or before the anniversary of cover immediately following the insured's 70th birthday"
      ],
      "notesForReviewer": "Conversion wording partly from the product webpage notes."
    },
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Severe child diseases and life cover",
      "whatProductOffers": "Includes severe child diseases within the 115 covered illnesses and provides life protection alongside the critical illness lump sum.",
      "keyFigures": [
        {"label": "Child disease cover", "value": "Included in 115 illnesses", "condition": "severe child diseases named in the policy"},
        {"label": "Life protection", "value": "Included", "condition": "death benefit terms per policy"}
      ],
      "exclusionsOrConditions": [
        "Child disease cover applies only to the named severe child conditions.",
        "The death benefit amount and its interaction with CI payouts are not stated in the excerpt.",
        "Cover ends at age 80."
      ],
      "clientSignalPhrases": [
        "just had a baby",
        "worried about child illnesses",
        "wants cover for the kids",
        "young family",
        "single parent",
        "needs life cover too",
        "asked about child diseases",
        "planning a second child"
      ],
      "negativeSignalPhrases": [
        "no dependants",
        "wants adult CI only",
        "needs education savings"
      ],
      "clientProfileFit": [
        "New parents",
        "Single parents",
        "Families wanting CI and life cover in one plan"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "For {client_detail} with a young child, the 115 illnesses include severe child diseases and the plan also carries life protection.",
      "verificationPrompts": [
        "Confirm the list of severe child diseases covered.",
        "Confirm the death benefit amount relative to the sum assured."
      ],
      "comparisonRows": ["ci_coverage", "lifetime_limit"],
      "trendStrength": "secondary",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "This plan also offers life protection as well as the option to convert your term plan",
        "covers as many as 115 major and minor illnesses, including early and late-stage critical illnesses and severe child diseases"
      ],
      "notesForReviewer": "Life protection details are thin in the excerpt; no death benefit amount given."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_budget_friendly_entry",
    "bestForOneLiner": "A budget-friendly 5-year renewable critical illness plan covering 115 illnesses up to age 80, with conversion to whole life by age 70.",
    "notSuitedWhen": [
      "The client wants premiums fixed for life",
      "The client needs cover beyond age 80",
      "The client wants a savings or investment element"
    ],
    "gapsInSourceMaterial": [
      "Premium table and discount threshold",
      "Waiting period and full exclusions",
      "Illness list and payout percentages",
      "Renewal premium schedule"
    ]
  }
})

# ---------------------------------------------------------------- 7. Smart Elite Ultra
pid = "smart-elite-ultra-critical-illness-insurance-plan"
docs.append({
  "productId": pid,
  "productName": "Smart Elite Ultra Critical Illness Insurance Plan",
  "productType": "critical illness insurance",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_critical_illness_readiness",
      "trendCategory": "critical_illness_readiness",
      "isNewCategory": False,
      "trendName": "115 illnesses, up to 900% cover",
      "whatProductOffers": "Covers 115 illnesses with multiple claims across 5 critical illness groups, providing up to 900% of the amount purchased in total, plus an extra 50% coverage booster.",
      "keyFigures": [
        {"label": "Illnesses covered", "value": "115", "condition": "named conditions"},
        {"label": "Total multiple cover", "value": "Up to 900% of amount purchased", "condition": "across all eligible claims"},
        {"label": "Coverage booster", "value": "Extra 50% protection", "condition": "as stated in benefits highlight"},
        {"label": "Critical illness groups", "value": "5 groups", "condition": "including cancer and heart"}
      ],
      "exclusionsOrConditions": [
        "900% is an aggregate ceiling across multiple claims, not a single payout.",
        "Each group and claim type has its own percentage cap.",
        "Waiting periods between claims and the full claim conditions are not in the excerpt."
      ],
      "clientSignalPhrases": [
        "wants multiple claims",
        "worried about cancer coming back",
        "asked about 900%",
        "wants cover that pays more than once",
        "family history of cancer and heart",
        "wants a big total pool",
        "compared with single-claim CI",
        "young, wants long-term cover"
      ],
      "negativeSignalPhrases": [
        "wants the cheapest single-claim plan",
        "only needs one payout",
        "needs hospital bill reimbursement"
      ],
      "clientProfileFit": [
        "Clients wanting multi-claim CI protection",
        "Buyers with strong family history of cancer or heart disease",
        "Higher-budget clients aged 30-50"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "For {client_detail}, the plan does not stop at one claim; it covers 115 illnesses with multiple claims up to 900% of the amount purchased.",
      "verificationPrompts": [
        "Confirm the claim percentages and waiting periods for each of the 5 groups.",
        "Confirm how the 50% coverage booster is triggered."
      ],
      "comparisonRows": ["ci_coverage", "lifetime_limit", "waiting_period"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "we also provide you multiple cover as high as 900% of the amount you purchased",
        "115 illnesses protection with multiple cover up to 900% protection in total + Coverage booster extra 50% protection"
      ],
      "notesForReviewer": "The full multiple-claim table is cut off in the excerpt."
    },
    {
      "trendId": pid + "_critical_illness_readiness_recurrence",
      "trendCategory": "critical_illness_readiness",
      "isNewCategory": False,
      "trendName": "Cancer 3x, heart 2x",
      "whatProductOffers": "Pays multiple benefits for recurrence, with up to 3 times cover for cancer and up to 2 times cover for heart attack, alongside up to 300% for cancer and up to 200% for heart-related illnesses.",
      "keyFigures": [
        {"label": "Cancer claims", "value": "Up to 3 times", "condition": "recurrence cover"},
        {"label": "Heart attack claims", "value": "Up to 2 times", "condition": "recurrence cover"},
        {"label": "Cancer protection", "value": "Up to 300%", "condition": "aggregate"},
        {"label": "Heart protection", "value": "Up to 200%", "condition": "aggregate"},
        {"label": "Other critical illness groups", "value": "Up to 100% each", "condition": "each of the other 4 groups"}
      ],
      "exclusionsOrConditions": [
        "Recurrence claims require the stated waiting period, which is not in the excerpt.",
        "Cancer and heart caps are aggregate, not per diagnosis.",
        "Other groups are capped at 100% each."
      ],
      "clientSignalPhrases": [
        "cancer came back before",
        "worried about recurrence",
        "mother had breast cancer twice",
        "wants a second payout",
        "asked about heart attack again",
        "wants cover for the same illness twice",
        "family history of early heart attack",
        "wants cancer cover above 100%"
      ],
      "negativeSignalPhrases": [
        "wants a single-claim plan",
        "already had a heart attack",
        "only wants early stage cover"
      ],
      "clientProfileFit": [
        "Cancer survivors who can still underwrite",
        "Clients with strong family history of cancer or heart disease",
        "Buyers wanting long-horizon multi-claim protection"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "Because {client_detail} is worried about recurrence, cancer is covered up to 3 times and heart attack up to 2 times, with up to 300% and 200% respectively.",
      "verificationPrompts": [
        "Confirm the waiting period between recurrence claims.",
        "Confirm whether the 3 cancer claims must be different stages or can be the same."
      ],
      "comparisonRows": ["ci_coverage", "waiting_period"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "Multiple cover for the recurrence of critical illness: up to 3 times cover for cancer and up to 2 times cover for heart attack",
        "Cancer up to 300% protection for cancer ... Heart up to 200% protection for illnesses related to the heart"
      ],
      "notesForReviewer": "Waiting periods and recurrence definitions are not in the excerpt."
    },
    {
      "trendId": pid + "_pre_existing_or_chronic_support",
      "trendCategory": "pre_existing_or_chronic_support",
      "isNewCategory": False,
      "trendName": "Benign, congenital and diabetes cover",
      "whatProductOffers": "Extends cover to benign conditions that may raise cancer risk, undetected congenital conditions in children, and diabetes complications, which the brochure presents as first-in-market features.",
      "keyFigures": [
        {"label": "Benign condition cover", "value": "Included", "condition": "e.g. Benign Hyperplasia of the mammary glands"},
        {"label": "Congenital conditions", "value": "Undetected congenital conditions in children", "condition": "child cover"},
        {"label": "Diabetes complications", "value": "Covered", "condition": "Insulin Dependent Diabetes Mellitus cover ceases at age 18"}
      ],
      "exclusionsOrConditions": [
        "Benign condition cover is limited to the named conditions in the policy.",
        "Insulin Dependent Diabetes Mellitus cover ceases at age 18.",
        "This is not cover for all pre-existing conditions; underwriting still applies."
      ],
      "clientSignalPhrases": [
        "has benign breast lumps",
        "fibroids found last year",
        "family has diabetes",
        "child born with a heart issue",
        "worried about pre-existing conditions",
        "wants cover despite benign findings",
        "asked about diabetes complications",
        "mother had benign breast disease"
      ],
      "negativeSignalPhrases": [
        "already diagnosed with cancer",
        "wants cover for any pre-existing illness",
        "needs immediate cover with no underwriting"
      ],
      "clientProfileFit": [
        "Women with benign breast conditions",
        "Families with diabetic history",
        "Parents of children with undetected congenital conditions"
      ],
      "priorityAlignment": ["coverage", "access"],
      "talkingPointTemplate": "For {client_detail} with benign breast lumps, the plan is one of the first to cover benign conditions that can raise cancer risk, plus diabetes complications.",
      "verificationPrompts": [
        "Confirm the exact benign conditions covered and any extra loading.",
        "Confirm the underwriting position for declared benign conditions."
      ],
      "comparisonRows": ["ci_coverage", "waiting_period"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "we are the first in the market to expand our protection to individuals with benign conditions that could potentially increase the risk of cancer",
        "Cover for undetected congenital conditions in children",
        "cover for diabetes complications"
      ],
      "notesForReviewer": "Pre-existing condition underwriting rules are not stated; this is not guaranteed acceptance."
    },
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Child premium waiver built in",
      "whatProductOffers": "Includes an embedded premium waiver for the insured child if the policy owner passes away before age 75, with no extra health information required.",
      "keyFigures": [
        {"label": "Premium waiver trigger", "value": "Policy owner passes away before age 75", "condition": "insured is a child"},
        {"label": "Extra underwriting", "value": "None required", "condition": "embedded benefit"}
      ],
      "exclusionsOrConditions": [
        "Applies only where the insured child is covered under the policy.",
        "Owner must pass away before age 75.",
        "Waiver covers premiums, not a separate cash payout."
      ],
      "clientSignalPhrases": [
        "buying for my child",
        "worried what happens if I die",
        "wants the child's cover to continue",
        "single parent",
        "wants no extra medical checks",
        "asked about premium waiver for kids",
        "planning a child's long-term cover",
        "wants family protection built in"
      ],
      "negativeSignalPhrases": [
        "no children",
        "wants a cash payout on death",
        "needs adult CI only"
      ],
      "clientProfileFit": [
        "Parents insuring a child",
        "Single parents",
        "Families wanting the child's cover protected if the payer dies"
      ],
      "priorityAlignment": ["coverage", "flexibility"],
      "talkingPointTemplate": "For {client_detail} insuring a child, the plan automatically waives the child's premiums if the policy owner dies before 75, with no extra health information.",
      "verificationPrompts": [
        "Confirm the waiver applies to all future premiums until the policy matures.",
        "Confirm the owner and insured definitions for the waiver."
      ],
      "comparisonRows": ["premium", "ci_coverage"],
      "trendStrength": "secondary",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "embedded premium waiver for insured child with no extra health information required (if the policy owner passes away before the age of 75)"
      ],
      "notesForReviewer": "No payout amount is attached; it is a waiver benefit."
    },
    {
      "trendId": pid + "_savings_and_wealth_growth",
      "trendCategory": "savings_and_wealth_growth",
      "isNewCategory": False,
      "trendName": "CI with long-term savings",
      "whatProductOffers": "An integrated plan combining multiple-illness protection, life insurance and potential long-term savings in one policy.",
      "keyFigures": [
        {"label": "Components", "value": "Multiple illness protection + life insurance + potential long-term savings", "condition": "single integrated plan"}
      ],
      "exclusionsOrConditions": [
        "Savings element is described as potential, not guaranteed.",
        "No illustrated values, dividend scale or surrender values are in the excerpt.",
        "Early surrender may return less than premiums paid."
      ],
      "clientSignalPhrases": [
        "wants protection and savings",
        "doesn't want pure term",
        "asked about cash value",
        "long-term plan",
        "wants one policy for everything",
        "planning 20 years ahead",
        "wants life cover too",
        "prefers integrated plan"
      ],
      "negativeSignalPhrases": [
        "wants pure protection at lowest cost",
        "needs liquidity",
        "wants guaranteed returns"
      ],
      "clientProfileFit": [
        "Long-horizon buyers wanting one integrated policy",
        "Clients who dislike pure term cover",
        "Higher-budget families combining CI and savings"
      ],
      "priorityAlignment": ["growth", "coverage"],
      "talkingPointTemplate": "For {client_detail}, this is one integrated plan that combines multiple-illness protection, life cover and potential long-term savings.",
      "verificationPrompts": [
        "Request the illustrated policy values and guaranteed versus non-guaranteed split.",
        "Confirm surrender values at years 10, 20 and 30."
      ],
      "comparisonRows": ["premium", "ci_coverage"],
      "trendStrength": "secondary",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "an integrated plan created to offer you multiple illnesses protection, life insurance protection and potential long term savings"
      ],
      "notesForReviewer": "Very thin evidence: no savings figures, dividend scale or cash value illustration in the excerpt."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_critical_illness_readiness",
    "bestForOneLiner": "A multi-claim critical illness plan covering 115 illnesses with up to 900% total protection, 3 cancer claims and benign condition cover.",
    "notSuitedWhen": [
      "The client wants the lowest-premium single-claim CI plan",
      "The client needs hospital bill reimbursement",
      "The client needs guaranteed savings returns"
    ],
    "gapsInSourceMaterial": [
      "Premium table and sum assured options",
      "Multiple-claim waiting periods and definitions",
      "Full benign and congenital condition lists",
      "Savings illustration and surrender values"
    ]
  }
})

# ---------------------------------------------------------------- 8. Super Adults Shield
pid = "super-adults-shield"
docs.append({
  "productId": pid,
  "productName": "Super Adults Shield",
  "productType": "accident protection insurance plan",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": pid + "_family_protection",
      "trendCategory": "family_protection",
      "isNewCategory": False,
      "trendName": "Accident death and dismemberment to 76",
      "whatProductOffers": "Pays a lump sum under the Accidental Death & Dismemberment Benefit for listed injuries occurring within 180 days of an accident, with cover to age 76 for applicants aged 18-65.",
      "keyFigures": [
        {"label": "Issue age", "value": "Age 18-65", "condition": "at application"},
        {"label": "Benefit term", "value": "Up to age 76", "condition": "policy in force"},
        {"label": "Claim window", "value": "180 days after the accident", "condition": "injury listed in the benefit schedule"},
        {"label": "Currency", "value": "HK$/MOP", "condition": "policy currency"}
      ],
      "exclusionsOrConditions": [
        "Benefit is payable only for injuries listed in the Accidental Death & Dismemberment Benefit Schedule.",
        "The injury must occur within 180 days of the accident.",
        "Once 100% of the sum assured is paid, the policy ends."
      ],
      "clientSignalPhrases": [
        "main earner in the family",
        "wants accident cover until retirement",
        "asked about dismemberment cover",
        "works in construction",
        "drives for a living",
        "worried about a serious accident",
        "wants a lump sum for the family",
        "no company accident cover"
      ],
      "negativeSignalPhrases": [
        "needs illness cover",
        "wants investment returns",
        "is over 65"
      ],
      "clientProfileFit": [
        "Working adults aged 18-65 with dependants",
        "Manual and transport workers",
        "Clients without employer accident cover"
      ],
      "priorityAlignment": ["coverage"],
      "talkingPointTemplate": "For {client_detail} who supports the family, the plan pays a lump sum for accidental death or dismemberment and stays in force to age 76.",
      "verificationPrompts": [
        "Confirm the sum assured options and per-life maximum.",
        "Confirm the benefit schedule percentages for each listed injury."
      ],
      "comparisonRows": ["premium", "lifetime_limit", "renewability"],
      "trendStrength": "core",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "Insured's Age of Application Age 18 – 65",
        "Benefit Term Up to the age of 76",
        "we will pay a lump sum benefit according to the Benefit Schedule for the Accidental Death & Dismemberment Benefit"
      ],
      "notesForReviewer": "Brochure text is for the combined Super Shield series and is truncated; benefit schedule and sum assured options are missing."
    },
    {
      "trendId": pid + "_income_or_lifestyle_support",
      "trendCategory": "income_or_lifestyle_support",
      "isNewCategory": False,
      "trendName": "Monthly disability payment 100 months",
      "whatProductOffers": "Pays 1% of the sum assured monthly from the 7th month for up to 100 months while permanent total disability continues after 6 consecutive months.",
      "keyFigures": [
        {"label": "Monthly payment", "value": "1% of the sum assured", "condition": "from the 7th month"},
        {"label": "Payment duration", "value": "Up to 100 months", "condition": "while disability continues"},
        {"label": "Qualifying period", "value": "6 consecutive months", "condition": "totally and permanently disabled within 180 days of accident"}
      ],
      "exclusionsOrConditions": [
        "Disability must arise within 180 days of the accident and persist 6 consecutive months.",
        "Payments cease if disability ends.",
        "Permanent Total Disability Benefit is not paid after the Accidental Death & Dismemberment Benefit has been paid, and vice versa."
      ],
      "clientSignalPhrases": [
        "worried about long-term disability",
        "sole earner",
        "manual worker",
        "asked about monthly income",
        "wants support if he can't work",
        "family has no savings",
        "needs income replacement",
        "self-employed driver"
      ],
      "negativeSignalPhrases": [
        "wants a one-off lump sum only",
        "needs critical illness cover",
        "expects payment immediately"
      ],
      "clientProfileFit": [
        "Manual workers and drivers",
        "Sole earners with dependent families",
        "Clients without employer disability benefits"
      ],
      "priorityAlignment": ["coverage", "cost"],
      "talkingPointTemplate": "If {client_detail} is permanently disabled after an accident, the plan pays 1% of the sum assured every month for up to 100 months.",
      "verificationPrompts": [
        "Confirm the definition of total and permanent disability.",
        "Confirm how the disability benefit reduces the remaining sum assured."
      ],
      "comparisonRows": ["premium", "ci_coverage", "renewability"],
      "trendStrength": "core",
      "evidenceStrength": "strong",
      "sourceEvidence": [
        "the insured will receive a monthly payment equal to 1% of the sum assured beginning from the 7th month and continuing up to 100 months (while disability continues)"
      ],
      "notesForReviewer": "No income test or occupational class detail in the excerpt."
    },
    {
      "trendId": pid + "_hospital_cost_protection",
      "trendCategory": "hospital_cost_protection",
      "isNewCategory": False,
      "trendName": "52 weeks of accident medical bills",
      "whatProductOffers": "Reimburses reasonable and customary medical expenses incurred within 52 weeks of an accident, up to the maximum limit per accident.",
      "keyFigures": [
        {"label": "Claim period", "value": "52 weeks after the accident", "condition": "treatment must be medically necessary"},
        {"label": "Limit", "value": "Maximum limit per accident per insured", "condition": "amount per benefits schedule, not stated"}
      ],
      "exclusionsOrConditions": [
        "Reimbursement is capped per accident; the actual amount is not in the source.",
        "Expenses must be reasonable and customary.",
        "Only accident-related treatment is covered."
      ],
      "clientSignalPhrases": [
        "wants hospital bills covered",
        "asked about accident medical expenses",
        "worried about surgery costs",
        "wants receipts reimbursed",
        "no hospital plan",
        "needs cover for follow-up treatment",
        "had a bad fall last year",
        "wants both lump sum and bills"
      ],
      "negativeSignalPhrases": [
        "wants illness hospital cover",
        "needs a guaranteed annual limit",
        "wants cashless hospital admission"
      ],
      "clientProfileFit": [
        "Clients without a medical plan",
        "Manual workers with accident exposure",
        "Families wanting accident bill reimbursement"
      ],
      "priorityAlignment": ["coverage", "access"],
      "talkingPointTemplate": "For {client_detail} with no hospital plan, accident medical bills are reimbursed for treatment within 52 weeks, on top of the lump-sum benefits.",
      "verificationPrompts": [
        "Confirm the per-accident maximum in the benefits schedule.",
        "Confirm whether the medical reimbursement reduces the sum assured."
      ],
      "comparisonRows": ["annual_limit", "outpatient", "premium"],
      "trendStrength": "secondary",
      "evidenceStrength": "medium",
      "sourceEvidence": [
        "we will reimburse the reasonable and customary medical expenses incurred within 52 weeks after the accident, up to the maximum limit per accident for the insured"
      ],
      "notesForReviewer": "The per-accident maximum is not stated in the supplied text."
    },
    {
      "trendId": pid + "_fast_access_and_convenience",
      "trendCategory": "fast_access_and_convenience",
      "isNewCategory": False,
      "trendName": "Counselling and worldwide assistance",
      "whatProductOffers": "Adds psychological counselling services after a covered accident, a Well Being Program and 24-hour worldwide emergency assistance up to HK$/MOP5,000,000 per life.",
      "keyFigures": [
        {"label": "Emergency assistance", "value": "HK$/MOP5,000,000 per life", "condition": "aggregate across AIA policies on the same insured"},
        {"label": "Counselling", "value": "Necessary psychological counselling expenses", "condition": "per benefits schedule"},
        {"label": "Well Being Program", "value": "Included", "condition": "program terms apply"}
      ],
      "exclusionsOrConditions": [
        "The assistance limit is shared across all AIA policies covering the same insured.",
        "Counselling amount is per the benefits schedule, not stated in the source.",
        "Available to permanent residents of Hong Kong or Macau for the assistance service."
      ],
      "clientSignalPhrases": [
        "wants emotional support after accident",
        "travels for work",
        "asked about counselling",
        "wants more than cash",
        "worried about trauma",
        "wants a 24-hour hotline",
        "works across the border",
        "values wellbeing perks"
      ],
      "negativeSignalPhrases": [
        "only wants cash benefits",
        "needs psychiatric treatment cover",
        "never travels"
      ],
      "clientProfileFit": [
        "Clients wanting accident support services, not just payout",
        "Frequent travellers",
        "Workers in high-stress or high-risk jobs"
      ],
      "priorityAlignment": ["access"],
      "talkingPointTemplate": "For {client_detail}, the plan adds psychological counselling after an accident and a 24-hour worldwide assistance line, not just a cash payout.",
      "verificationPrompts": [
        "Confirm the counselling session limit and provider network.",
        "Confirm what the Well Being Program includes for this plan."
      ],
      "comparisonRows": ["premium", "network_access"],
      "trendStrength": "secondary",
      "evidenceStrength": "weak",
      "sourceEvidence": [
        "We will pay the necessary psychological counselling expenses according to the Benefits Schedule of Super Adults Shield.",
        "The per life limit is up to HK$/MOP5,000,000 (under all policies held with us and AIA Company Limited covering the same insured)."
      ],
      "notesForReviewer": "Evidence comes from the product webpage footnotes and the combined Super Shield brochure; counselling limits and Well Being Program details are not stated."
    }
  ],
  "productLevelSummary": {
    "primaryTrend": pid + "_family_protection",
    "bestForOneLiner": "An accident plan for ages 18-65 with death and dismemberment cover to age 76, monthly disability income and accident medical reimbursement.",
    "notSuitedWhen": [
      "The client is outside the 18-65 application age",
      "The client needs illness or critical illness cover",
      "The client wants cashless hospital admission"
    ],
    "gapsInSourceMaterial": [
      "Sum assured options and premium table",
      "Per-accident medical limit",
      "Benefits schedule percentages",
      "Full exclusions and waiting periods"
    ]
  }
})

written = []
for d in docs:
    p = os.path.join(OUT, d["productId"] + ".json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    written.append(d["productId"])

print(json.dumps(written))
