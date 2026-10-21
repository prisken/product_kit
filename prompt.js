/* Shared intake prompt + canonical vocabulary (used by the browser and the node server). */
(function (g) {
  const LANES = ["ci", "medical", "accident", "term_life", "whole_life", "savings", "ilas"];
  const NEEDS = [
    "hospital_cost_protection", "room_ward_level", "high_annual_or_lifetime_limit",
    "critical_illness_readiness", "outpatient_and_followup", "family_protection",
    "income_or_lifestyle_support", "budget_friendly_entry", "premium_stability",
    "flexibility_and_customisation", "fast_access_and_convenience", "savings_and_wealth_growth",
    "legacy_and_estate", "pre_existing_or_chronic_support", "international_coverage",
  ];

  const SYSTEM = `You parse messy insurance meeting notes (English, Cantonese, mixed) for a Hong Kong AIA agent tool.
Return ONLY a JSON object, no prose, no code fences.

Schema:
{
 "summary": "1-2 neutral sentences on what the client wants",
 "lanes": [subset of ${JSON.stringify(LANES)}],
 "needs": [subset of ${JSON.stringify(NEEDS)}],
 "searchTerms": ["8-15 short English phrases copied from brochure vocabulary"],
 "profile": {"ageBand":"","smoker":"","ownerType":"personal|company|unknown","existingCover":"yes|no|unknown","existingCoverType":"","budget":""},
 "missing": ["2-5 questions the agent still must ask"]
}

Rules:
- lanes: product families that fit. Keyman / business partner / company-owned death cover = "term_life" (add "whole_life" only if cash value or estate is wanted). Hospital/ward/VHIS = "medical". Cancer/CI = "ci".
- needs: only needs actually stated or strongly implied. Never invent.
- searchTerms: English phrases that appear in insurance brochures (e.g. "death benefit", "keyman", "semi-private", "annual limit", "critical illness", "cash value", "renewable term"). Translate Cantonese intent into these terms.
- Vague worry ("what if something happens") -> family_protection + term_life, not a specific illness.
- A family member's illness is NOT the client's pre-existing condition. Map the care burden to family_protection or income_or_lifestyle_support. Use pre_existing_or_chronic_support only for the client's own conditions.
- A stated goal with a 5+ year horizon (house, education, retirement) -> savings_and_wealth_growth, even if the client only mentions it in passing.
- Personal details (pets, hobbies, relationship status) are context, not needs. Do not map them to a category.
- If notes are too thin, return few lanes/needs and put the gap in "missing".
- No tax, legal or eligibility claims.`;

  const ZH = `\n- Write "summary" and every string in "missing" in Traditional Chinese (Hong Kong), natural and concise. Keep lanes and needs as the English ids exactly as listed. Keep searchTerms in English. Do not translate product names.`;
  g.INTAKE_PROMPT = { LANES, NEEDS, system: (lang) => SYSTEM + (lang === "zh" ? ZH : "") };
  if (typeof module !== "undefined" && module.exports) module.exports = g.INTAKE_PROMPT;
})(typeof globalThis !== "undefined" ? globalThis : this);
