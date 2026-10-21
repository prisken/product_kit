# AIA product trend extraction — batch brief

For each product assigned to your batch, produce ONE JSON file in `sales-kits/trends-review/data/<productId>.json`, using the exact schema below. No commentary in the file.

## Inputs
- Batch: read `sales-kits/trends-review/batches.json`, take the array at your assigned index.
- Each entry has: `name`, `category` (health/life/save/invest), `url`, `brochure_slug`, `has_text`, `text_len`.
- Source text: `funds/data/brochure-texts.json[brochure_slug].text` (about 6,000 chars; may be truncated).
- If `has_text` is false or the text is empty/irrelevant, fetch the product URL with `web_fetch` and use whatever product copy is available. If still thin, use fewer trends, `evidenceStrength: "weak"`, and list the gap in `notesForReviewer`.

## Trend rules
- A trend is a concrete selling point the product OFFERS, traceable to the source. Not a market trend.
- 3–6 trends per product. Prefer fewer, stronger trends.
- No marketing adjectives. Copy numbers, limits, ages and conditions exactly with units.
- Every trend needs at least one direct quote or close paraphrase in `sourceEvidence`.
- Include honest `exclusionsOrConditions` (waiting periods, caps, co-pay, age, exclusions). If not in the source, say so.
- `clientSignalPhrases`: 8–12 short, informal phrases an agent would type in meeting notes.
- `negativeSignalPhrases`: 2–5.
- Use the canonical categories; only set `isNewCategory: true` if nothing fits.
- `trendId`: `<productId>_<category>`; if a product has two trends in the same category, append a short suffix (e.g. `_multiple_cancer`).

Canonical categories: hospital_cost_protection, room_ward_level, high_annual_or_lifetime_limit, critical_illness_readiness, outpatient_and_followup, family_protection, income_or_lifestyle_support, budget_friendly_entry, premium_stability, flexibility_and_customisation, fast_access_and_convenience, savings_and_wealth_growth, legacy_and_estate, pre_existing_or_chronic_support, international_coverage.

## Output schema (exact)
```json
{
  "productId": "<slug>",
  "productName": "<exact product name>",
  "productType": "<e.g. critical illness insurance / medical insurance / life insurance / savings insurance / annuity / investment-linked assurance>",
  "market": "Hong Kong",
  "trends": [
    {
      "trendId": "<productId>_<category>",
      "trendCategory": "<canonical>",
      "isNewCategory": false,
      "trendName": "<max 6 words>",
      "whatProductOffers": "<1-2 sentences, factual>",
      "keyFigures": [{"label": "", "value": "", "condition": ""}],
      "exclusionsOrConditions": [""],
      "clientSignalPhrases": [""],
      "negativeSignalPhrases": [""],
      "clientProfileFit": [""],
      "priorityAlignment": ["cost|coverage|flexibility|access|growth"],
      "talkingPointTemplate": "<one sentence with {client_detail}>",
      "verificationPrompts": [""],
      "comparisonRows": ["premium|room_level|annual_limit|lifetime_limit|ci_coverage|waiting_period|outpatient|renewability|add_ons|network_access"],
      "trendStrength": "core|secondary|minor",
      "evidenceStrength": "strong|medium|weak",
      "sourceEvidence": ["<quote or close paraphrase>"],
      "notesForReviewer": "<ambiguities/gaps; empty string if none>"
    }
  ],
  "productLevelSummary": {
    "primaryTrend": "<trendId of strongest trend>",
    "bestForOneLiner": "<neutral, one sentence>",
    "notSuitedWhen": ["<2-4 situations>"],
    "gapsInSourceMaterial": ["<missing premium table/exclusions/etc.>"]
  }
}
```

## Product IDs
Use `brochure_slug` as `productId` when present; otherwise slugify the product name (lowercase, hyphens).

## Completion
Write every file, then respond with only the list of productIds written and any products you could not complete (with the reason). Do not paste the JSON into the response.
