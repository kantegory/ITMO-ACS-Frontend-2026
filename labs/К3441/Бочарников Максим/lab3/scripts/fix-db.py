import json
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "db.json"
db = json.loads(path.read_text(encoding="utf-8"))

for key, rows in list(db.items()):
    if not isinstance(rows, list):
        continue
    cleaned = []
    for row in rows:
        if row is None:
            continue
        if isinstance(row, dict):
            row = {
                k: v
                for k, v in row.items()
                if not (k.endswith("Id") and v is None)
            }
        cleaned.append(row)
    db[key] = cleaned

db["likes"] = [
    {"id": 1, "recipeId": 2, "userId": 1},
    {"id": 2, "recipeId": 6, "userId": 1},
]

path.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("db.json fixed")
