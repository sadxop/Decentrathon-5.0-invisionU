"""
inVision U — Тест скоринга кандидатов
======================================
Загружает data/test_candidates.json, отправляет на POST /analyze,
выводит сравнение Baseline vs AI Score и финальный рейтинг.

Запуск: python -m scripts.run_test_candidates
"""

import json
from pathlib import Path

import httpx


API_URL = "http://127.0.0.1:8000/analyze"
TIMEOUT = 90.0

LABEL_EMOJI = {
    "Алмаз":      "💎",
    "Лидер":      "🌟",
    "Потенциал":  "🌱",
    "Обычный":    "📋",
    "Риск GenAI": "⚠️",
}

COL = {
    "name":      28,
    "city":      22,
    "baseline":   9,
    "ai":         9,
    "delta":      7,
    "label":     16,
}


def _row(*cells) -> str:
    keys = list(COL.keys())
    parts = []
    for i, cell in enumerate(cells):
        w = COL[keys[i]]
        parts.append(str(cell)[:w].ljust(w))
    return "│ " + " │ ".join(parts) + " │"


def _divider(char="─") -> str:
    return "├" + "┼".join(char * (w + 2) for w in COL.values()) + "┤"


def _header() -> str:
    top    = "┌" + "┬".join("─" * (w + 2) for w in COL.values()) + "┐"
    middle = _row("Кандидат", "Город", "Baseline", "AI Score", "Δ", "Метка AI")
    sep    = _divider("═").replace("├", "╞").replace("┤", "╡").replace("┼", "╪")
    return "\n".join([top, middle, sep])


def _footer(results: list) -> str:
    bottom = "└" + "┴".join("─" * (w + 2) for w in COL.values()) + "┘"
    return bottom


def main() -> None:
    candidates_path = Path(__file__).resolve().parents[1] / "data" / "test_candidates.json"
    raw = json.loads(candidates_path.read_text(encoding="utf-8"))
    candidates = [{k: v for k, v in c.items() if not k.startswith("_")} for c in raw]
    archetypes  = [c.get("_archetype", "") for c in raw]

    print("\n" + "═" * 80)
    print("  inVision U · AI Scoring Demo — Decentrathon 5.0")
    print("  Baseline vs Groq llama-3.3-70b  |  7 архетипов кандидатов")
    print("═" * 80)
    print(f"  Endpoint : {API_URL}")
    print(f"  Кандидатов: {len(candidates)}")
    print()

    results = []

    with httpx.Client(timeout=TIMEOUT) as client:
        for i, (c, arch) in enumerate(zip(candidates, archetypes), 1):
            name = c["full_name"]
            print(f"  [{i}/{len(candidates)}] Анализ: {name} ...", end=" ", flush=True)
            r = client.post(API_URL, json=c)
            if r.status_code != 200:
                print(f"ОШИБКА HTTP {r.status_code}")
                print(r.text[:400])
                raise SystemExit(1)

            data   = r.json()
            ai     = data.get("ai", {})
            b_sc   = data.get("baseline_score", 0)
            ai_sc  = ai.get("total_score", 0)
            label  = ai.get("leadership_label", "—")
            emoji  = LABEL_EMOJI.get(label, "")

            results.append({
                "name":       name,
                "city":       c["city"],
                "baseline":   b_sc,
                "ai_score":   ai_sc,
                "label":      label,
                "emoji":      emoji,
                "archetype":  arch,
                "rationale":  ai.get("rationale", ""),
                "candidate_id": data.get("candidate_id", ""),
            })
            print(f"✓  AI={ai_sc}/100  {emoji}{label}")

    print()
    print(_header())
    for r in results:
        delta = r["ai_score"] - r["baseline"]
        sign  = "+" if delta >= 0 else ""
        print(_row(
            r["name"],
            r["city"],
            r["baseline"],
            r["ai_score"],
            f"{sign}{delta}",
            f"{r['emoji']} {r['label']}",
        ))
    print(_footer(results))

    print()
    print("─" * 80)
    print("  📊 РЕЙТИНГ — AI Score (сверху вниз)")
    print("─" * 80)
    ranked = sorted(results, key=lambda x: x["ai_score"], reverse=True)
    for pos, r in enumerate(ranked, 1):
        bar_filled = round(r["ai_score"] / 10)
        bar = "█" * bar_filled + "░" * (10 - bar_filled)
        print(f"  #{pos}  {bar}  {r['ai_score']:>3}/100  {r['emoji']} {r['label']:<14}  {r['name']}")

    print()
    print("─" * 80)
    print("  🔍 ОБЪЯСНИМОСТЬ (Explainable AI) — краткий разбор по каждому")
    print("─" * 80)
    for r in ranked:
        rationale = r["rationale"]
        short = rationale[:300] + ("..." if len(rationale) > 300 else "")
        print(f"\n  {r['emoji']} {r['name']} ({r['city']})  —  AI: {r['ai_score']}/100")
        print(f"  {short}")

    print()
    print("─" * 80)
    print("  ⚖️  BASELINE vs AI — кто выигрывает от умного скоринга?")
    print("─" * 80)
    biggest_win  = max(results, key=lambda x: x["ai_score"] - x["baseline"])
    biggest_loss = min(results, key=lambda x: x["ai_score"] - x["baseline"])
    print(f"\n  Скрытый талант (AI >> Baseline): {biggest_win['name']}")
    print(f"    Baseline: {biggest_win['baseline']}  →  AI: {biggest_win['ai_score']}  "
          f"(+{biggest_win['ai_score'] - biggest_win['baseline']})")
    print(f"\n  Переоценён формально (AI << Baseline): {biggest_loss['name']}")
    print(f"    Baseline: {biggest_loss['baseline']}  →  AI: {biggest_loss['ai_score']}  "
          f"({biggest_loss['ai_score'] - biggest_loss['baseline']})")

    shortlisted = [r for r in ranked if r["ai_score"] >= 60]
    print(f"\n  ✅ Шортлист (AI ≥ 60): {len(shortlisted)}/{len(results)} кандидатов")
    for r in shortlisted:
        print(f"     • {r['name']} — {r['ai_score']}/100  {r['emoji']}{r['label']}")

    print()
    print("═" * 80)
    print("  Данные сохранены в SQLite. Открой дашборд: http://localhost:3001")
    print("  API кандидатов:  http://localhost:8000/candidates")
    print("  Swagger UI:      http://localhost:8000/docs")
    print("═" * 80 + "\n")


if __name__ == "__main__":
    main()

