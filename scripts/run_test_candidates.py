import json
from pathlib import Path

import httpx


def main() -> None:
    candidates_path = Path(__file__).resolve().parents[1] / "data" / "test_candidates.json"
    candidates = json.loads(candidates_path.read_text(encoding="utf-8"))

    url = "http://127.0.0.1:8000/analyze"

    with httpx.Client(timeout=90.0) as client:
        for i, c in enumerate(candidates, 1):
            r = client.post(url, json=c)
            print(f"#{i} {c['full_name']} -> HTTP {r.status_code}")
            if r.status_code != 200:
                print(r.text)
                raise SystemExit(1)
            data = r.json()
            ai = data.get("ai", {})
            print("  candidate_id:", data.get("candidate_id"))
            print("  baseline_score:", data.get("baseline_score"))
            print("  total_score:", ai.get("total_score"))
            print("  leadership_label:", ai.get("leadership_label"))
            rationale = ai.get("rationale") or ""
            print("  rationale:", rationale[:220] + ("..." if len(rationale) > 220 else ""))
            print()


if __name__ == "__main__":
    main()

