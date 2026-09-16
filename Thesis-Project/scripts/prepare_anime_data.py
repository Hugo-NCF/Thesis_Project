import ast
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

INPUT_FILE = ROOT / "data" / "raw" / "animes.csv"
OUTPUT_FILE = ROOT / "public" / "data" / "animes-sample.json"

MAX_ROWS = 1000


def clean_number(value):
    if value is None:
        return None

    value = str(value).strip()

    if value == "" or value.lower() in {"nan", "none"}:
        return None

    try:
        number = float(value)

        if number.is_integer():
            return int(number)

        return number

    except ValueError:
        return value


def clean_genres(value):
    if not value:
        return []

    try:
        parsed = ast.literal_eval(value)

        if isinstance(parsed, list):
            return parsed

    except (ValueError, SyntaxError):
        pass

    return [
        genre.strip()
        for genre in value.split(",")
        if genre.strip()
    ]


def main():
    if not INPUT_FILE.exists():
        print("Could not find animes.csv")
        print(f"Expected location: {INPUT_FILE}")
        return

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    anime_list = []

    with INPUT_FILE.open(
        "r",
        encoding="utf-8",
        errors="replace"
    ) as csv_file:

        reader = csv.DictReader(csv_file)

        for index, row in enumerate(reader):

            if index >= MAX_ROWS:
                break

            anime = {
                "uid": clean_number(row.get("uid")),
                "title": row.get("title", "").strip(),
                "synopsis": row.get("synopsis", "").strip(),
                "genre": clean_genres(row.get("genre", "")),
                "episodes": clean_number(row.get("episodes")),
                "score": clean_number(row.get("score")),
                "ranked": clean_number(row.get("ranked")),
                "popularity": clean_number(row.get("popularity")),
                "members": clean_number(row.get("members")),
                "img_url": row.get("img_url", "").strip(),
                "link": row.get("link", "").strip(),
            }

            anime_list.append(anime)

    with OUTPUT_FILE.open(
        "w",
        encoding="utf-8"
    ) as json_file:

        json.dump(
            anime_list,
            json_file,
            ensure_ascii=False,
            indent=2
        )

    print(f"Successfully loaded {len(anime_list)} anime.")
    print(f"Created: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()