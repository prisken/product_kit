#!/usr/bin/env python3
"""Compile a slim catalog.json for the meeting wizard (one file, no 57 fetches)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

FAMILY_RULES = [
    ("ilas", ("investment-linked", "ilas")),
    ("annuity", ("annuity",)),
    ("savings", ("savings",)),
    ("term_life", ("term life",)),
    ("universal_life", ("universal life",)),
    ("whole_life", ("life insurance",)),
    ("accident", ("accident", "personal accident")),
    ("ci", ("critical illness", "severity-based", "cancer-specific", "cancer reimbursement")),
    ("medical", ("medical", "vhis", "outpatient", "hospital")),
]


def family_of(product_type: str, product_name: str = "") -> str:
    blob = f"{product_type or ''} {product_name or ''}".lower()
    # Name wins for term: EasyGuard is typed "life insurance" but is a term plan.
    if "term life" in blob or "term-life" in blob or "定期人寿" in blob or "定期人壽" in blob:
        return "term_life"
    t = (product_type or "").lower()
    for fam, keys in FAMILY_RULES:
        if any(k in t for k in keys):
            return fam
    return "other"


def lane_of(family: str, category: str) -> str:
    if family in ("ci",):
        return "ci"
    if family in ("medical",):
        return "medical"
    if family in ("accident",):
        return "accident"
    if family in ("term_life",):
        return "term_life"
    if family in ("whole_life", "universal_life"):
        return "whole_life"
    if family in ("savings", "annuity"):
        return "savings"
    if family in ("ilas",):
        return "ilas"
    return {"health": "medical", "life": "whole_life", "save": "savings", "invest": "ilas"}.get(category, "other")


def slim_trend(t: dict) -> dict:
    quotes = [q for q in (t.get("sourceEvidence") or []) if q][:2]
    figs = []
    for f in t.get("keyFigures") or []:
        if not isinstance(f, dict):
            continue
        figs.append({
            "label": f.get("label") or "",
            "value": f.get("value") or "",
            "condition": f.get("condition") or "",
        })
    return {
        "trendId": t.get("trendId") or "",
        "trendCategory": t.get("trendCategory") or "",
        "trendName": t.get("trendName") or "",
        "whatProductOffers": t.get("whatProductOffers") or "",
        "keyFigures": figs[:6],
        "exclusionsOrConditions": (t.get("exclusionsOrConditions") or [])[:6],
        "clientSignalPhrases": t.get("clientSignalPhrases") or [],
        "negativeSignalPhrases": t.get("negativeSignalPhrases") or [],
        "clientProfileFit": t.get("clientProfileFit") or [],
        "priorityAlignment": t.get("priorityAlignment") or [],
        "talkingPointTemplate": t.get("talkingPointTemplate") or "",
        "verificationPrompts": (t.get("verificationPrompts") or [])[:4],
        "comparisonRows": t.get("comparisonRows") or [],
        "trendStrength": t.get("trendStrength") or "minor",
        "evidenceStrength": t.get("evidenceStrength") or "weak",
        "sourceEvidence": quotes,
        "notesForReviewer": t.get("notesForReviewer") or "",
    }


SKIP_FILES = {"index.json", "catalog.json"}


def category_guess(family: str, product_type: str) -> str:
    if family in ("ci", "medical", "accident"):
        return "health"
    if family in ("term_life", "whole_life", "universal_life"):
        return "life"
    if family in ("savings", "annuity"):
        return "save"
    if family == "ilas":
        return "invest"
    t = (product_type or "").lower()
    if "medical" in t or "vhis" in t or "accident" in t or "illness" in t:
        return "health"
    if "life" in t:
        return "life"
    if "saving" in t or "annuity" in t:
        return "save"
    return "health"


def main() -> None:
    # Prefer on-disk product files so a broken index cannot alias Prime→Flexi.
    index = {}
    idx_path = DATA / "index.json"
    if idx_path.exists():
        for meta in json.loads(idx_path.read_text()):
            if isinstance(meta, dict) and meta.get("file"):
                index[meta["file"]] = meta
    products = []
    seen = set()
    files = sorted(
        f for f in DATA.glob("*.json") if f.name not in SKIP_FILES
    )
    for path in files:
        raw = json.loads(path.read_text())
        if not isinstance(raw, dict) or not raw.get("productName"):
            continue
        meta = index.get(path.name) or {}
        pid = raw.get("productId") or meta.get("productId") or path.stem
        if pid in seen:
            continue
        seen.add(pid)
        family = family_of(
            raw.get("productType") or meta.get("productType") or "",
            raw.get("productName") or meta.get("productName") or "",
        )
        lane = lane_of(family, meta.get("category") or "")
        pls = raw.get("productLevelSummary") or {}
        products.append({
            "productId": pid,
            "productName": raw.get("productName") or meta.get("productName") or path.stem,
            "productType": raw.get("productType") or meta.get("productType") or "",
            "market": raw.get("market") or "Hong Kong",
            "category": meta.get("category") or category_guess(family, raw.get("productType") or ""),
            "family": family,
            "lane": lane,
            "file": path.name,
            "trendCount": len(raw.get("trends") or []),
            "productLevelSummary": {
                "primaryTrend": pls.get("primaryTrend") or "",
                "bestForOneLiner": pls.get("bestForOneLiner") or "",
                "notSuitedWhen": pls.get("notSuitedWhen") or [],
                "gapsInSourceMaterial": pls.get("gapsInSourceMaterial") or [],
            },
            "trends": [slim_trend(t) for t in (raw.get("trends") or []) if isinstance(t, dict)],
        })
    out = {
        "generatedFrom": "data/*.json",
        "productCount": len(products),
        "trendCount": sum(len(p["trends"]) for p in products),
        "products": products,
    }
    dest = DATA / "catalog.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    idx_out = [
        {
            "productId": p["productId"],
            "productName": p["productName"],
            "category": p["category"],
            "productType": p["productType"],
            "market": p["market"],
            "file": p["file"],
            "trendCount": p["trendCount"],
            "primaryTrend": (p.get("productLevelSummary") or {}).get("primaryTrend") or "",
        }
        for p in products
    ]
    (DATA / "index.json").write_text(json.dumps(idx_out, ensure_ascii=False, indent=1))
    print(f"wrote {dest} products={out['productCount']} trends={out['trendCount']} bytes={dest.stat().st_size}")
    print(f"rewrote index.json unique={len(idx_out)}")


if __name__ == "__main__":
    main()
