import csv
import json
import ast
from pathlib import Path


# ------------------------------------------------------------
# FILE LOCATIONS
# ------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent

INPUT_FILE = ROOT / "data" / "raw" / "animes.csv"
OUTPUT_FILE = ROOT / "public" / "data" / "animes-sample.json"

MAX_ROWS = 1000


# ------------------------------------------------------------
# WEEK 1-2 TODO FUNCTIONS
# ------------------------------------------------------------

def clean_number(value):
    """
    TODO:
    Convert a value from the CSV into a useful number.
    

    Things to think about:
    - CSV values are originally strings.
    - Some values may be blank.
    - Some values may say 'nan' or 'None'.
    - Some numbers may be whole numbers.
    - Some may contain decimals.

    Goal examples:

    "24" -> 24
    "8.75" -> 8.75
    "" -> None

    Write this function yourself.
    """
    # checks if there is no value
    if value is None:
        return None

    # cleans extra spaces from string
    value = str(value).strip()

    # checks for empty text
    if value == "":
        return None

    # conversion: tries converting the value without crashing
    try:
        number = float(value)

        # checks if the number is a whole number and converts to int
        if number == int(number):
            return int(number)
        else:
            return number

    except ValueError:
        # handle cases where conversion fails
        return None

def clean_genres(value):
    """
    TODO:
    Convert the genre column from the dataset into a Python list.

    Example:

    Input:
    "['Action', 'Adventure', 'Comedy']"

    Desired output:
    ['Action', 'Adventure', 'Comedy']

    Research/help topics:
    - Python strings
    - lists
    - ast.literal_eval()
    - split()

    Write this function yourself.
    """
    # if genre field is empty, return an empty list instead of crashing
    if not value:
        return []

    try:
        parsed = ast.literal_eval(value)

        # check if the parsed value is a list, if so return it
        if isinstance(parsed, list):
            return parsed

    except (ValueError, SyntaxError):
        # if parsing fails, return an empty list
        return []

    # if parsed successfully but was not a list
    return []


def create_anime_object(row):
    """
    TODO:
    Take ONE row from animes.csv and return a dictionary containing
    only the information that the React app needs.

    Suggested fields:

    uid
    title
    synopsis
    genre
    episodes
    score
    ranked
    popularity
    members
    img_url
    link

    Hint:

    row is a dictionary created by csv.DictReader.

    You can access a column with something like:

    row.get("title")

    Use your clean_number() and clean_genres() functions where needed.
    """
    # creates a dictionary with the required fields and cleaned values
    anime = {
    "uid": clean_number(row.get("uid")),
    "title": row.get("title", "").strip(),
    "synopsis": row.get("synopsis", "").strip(),
    "genre": clean_genres(row.get("genre")),
    "episodes": clean_number(row.get("episodes")),
    "score": clean_number(row.get("score")),
    "ranked": clean_number(row.get("ranked")),
    "popularity": clean_number(row.get("popularity")),
    "members": clean_number(row.get("members")),
    "img_url": row.get("img_url", "").strip(),
    "link": row.get("link", "").strip()
}

    return anime



def load_anime_data():
    """
    TODO:
    Open animes.csv and read anime from it.

    Goals:

    1. Check whether INPUT_FILE exists.
    2. Open the CSV file.
    3. Use csv.DictReader.
    4. Loop through rows.
    5. Convert each row using create_anime_object().
    6. Stop after MAX_ROWS.
    7. Return a list of anime.

    Expected result:

    [
        {...anime 1...},
        {...anime 2...},
        {...anime 3...}
    ]
    """
# check if the input file exists
    anime_list = []

    if not INPUT_FILE.exists():
        print(f"Error: Input file {INPUT_FILE} does not exist.")
        return anime_list

    # open the CSV file and read its contents
    with INPUT_FILE.open(mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        # loop through the rows and create anime objects
        for i, row in enumerate(reader):
            if i >= MAX_ROWS:
                break

            anime_object = create_anime_object(row)
            anime_list.append(anime_object)

    return anime_list



def save_anime_data(anime_list):
    """
    TODO:
    Save the cleaned anime list into OUTPUT_FILE as JSON.

    Things you'll need:

    - OUTPUT_FILE.parent.mkdir(...)
    - open()
    - json.dump()

    The finished JSON will be used by your React application.
    """
    # create the parent directory if it doesn't exist
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # opens the output file and writes the anime list as JSON
    with OUTPUT_FILE.open(mode='w', encoding='utf-8') as jsonfile:
        json.dump(anime_list, jsonfile, ensure_ascii=False, indent=4)

    


# ------------------------------------------------------------
# MAIN PROGRAM
# ------------------------------------------------------------

def main():
   
    """
    Once your functions above work, this function should:

    1. Load the anime.
    2. Save the anime.
    3. Print how many records were processed.
    """

    # TODO: Call load_anime_data()
    anime_list = load_anime_data()

    # TODO: Call save_anime_data()
    save_anime_data(anime_list)

    # TODO: Print a success message
    print(f"Processed {len(anime_list)} anime records and saved to {OUTPUT_FILE}.")



if __name__ == "__main__":
    main()