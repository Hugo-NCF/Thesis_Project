// ============================================================
// ANIME DATA FUNCTIONS
//
// These functions contain the main data/search logic for
// the application.
// ============================================================


export async function loadAnimeData() {
  /*
    WEEK 1

    Load the anime JSON file from:

    /data/animes-sample.json
  */

  // Fetches the anime data from the JSON file
  const response = await fetch('/data/animes-sample.json');

  // Checks if the response is ok, if not throw an error
  if (!response.ok) {
    throw new Error('Failed to load anime data');
  }

  // Converts the response to JSON
  const data = await response.json();

  // Returns the anime data
  return data;
}


export function searchAnime(animeList, searchText) {
  /*
    WEEK 3

    Search anime by title or genre.
  */

  // Convert the search text to lowercase and trim whitespace
  const search = searchText.toLowerCase().trim();

  // Return everything if search box is empty
  if (search === '') {
    return animeList;
  }

  // Filter the anime list based on title and genre matches
  return animeList.filter(anime => {

    // Check if the anime title matches the search text
    const titleMatch = anime.title
      .toLowerCase()
      .includes(search);

    // Check if any genre matches the search text
    const genreMatch = Array.isArray(anime.genre)
      ? anime.genre.some(genre =>
          genre.toLowerCase().includes(search)
        )
      : false;

    // Keep the anime if either title or genre matches
    return titleMatch || genreMatch;
  });
}


export function filterByGenre(animeList, genre) {
  /*
    WEEK 3

    Filter anime based on the selected genre.
  */

  // Return all anime if genre is "All"
  if (genre === 'All') {
    return animeList;
  }

  // Return only anime containing the selected genre
  return animeList.filter(anime => {

    // Check if the genre array exists and includes the selected genre
    return (
      Array.isArray(anime.genre) &&
      anime.genre.includes(genre)
    );
  });
}


export function filterByRating(animeList, ratingFilter) {
  /*
    WEEK 3

    Filter anime based on rating.

    Examples:

    below5 = scores below 5

    6plus = scores 6 or higher
  */

  // Return all anime if no rating filter is selected
  if (ratingFilter === 'Any') {
    return animeList;
  }

  // Filter the anime based on the selected rating option
  return animeList.filter(anime => {

    // Convert the anime score into a number
    const score = parseFloat(anime.score);

    // Ignore anime that do not have a valid score
    if (isNaN(score)) {
      return false;
    }


    // --------------------------------------------------------
    // LOWER RATING FILTERS
    // --------------------------------------------------------

    // Keep anime rated below 2
    if (ratingFilter === 'below2') {
      return score < 2;
    }

    // Keep anime rated below 3
    if (ratingFilter === 'below3') {
      return score < 3;
    }

    // Keep anime rated below 4
    if (ratingFilter === 'below4') {
      return score < 4;
    }

    // Keep anime rated below 5
    if (ratingFilter === 'below5') {
      return score < 5;
    }

    // Keep anime rated below 6
    if (ratingFilter === 'below6') {
      return score < 6;
    }


    // --------------------------------------------------------
    // HIGHER RATING FILTERS
    // --------------------------------------------------------

    // Keep anime rated 6 or higher
    if (ratingFilter === '6plus') {
      return score >= 6;
    }

    // Keep anime rated 7 or higher
    if (ratingFilter === '7plus') {
      return score >= 7;
    }

    // Keep anime rated 8 or higher
    if (ratingFilter === '8plus') {
      return score >= 8;
    }

    // Keep anime rated 9 or higher
    if (ratingFilter === '9plus') {
      return score >= 9;
    }


    // If something unexpected is selected,
    // return the anime instead of crashing
    return true;
  });
}


export function calculateAverageScore(animeList) {
  /*
    WEEK 2

    Calculate the average score of the anime currently loaded.
  */

  const validScores = animeList

    // Convert score to float
    .map(anime =>
      parseFloat(anime.score)
    )

    // Filter out invalid scores
    .filter(score =>
      !isNaN(score)
    );


  // Return 0 if there are no valid scores
  if (validScores.length === 0) {
    return 0;
  }


  // Add all valid scores together
  const totalScore = validScores.reduce(
    (sum, score) =>
      sum + score,
    0
  );


  // Calculate the average
  const averageScore =
    totalScore / validScores.length;


  // Return the average score
  return averageScore;
}