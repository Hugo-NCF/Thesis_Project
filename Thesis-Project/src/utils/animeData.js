// ============================================================
// ANIME DATA FUNCTIONS
//
// These functions contain the main data/search logic for
// the application.
//
// Try to implement these yourself.
// ============================================================


export async function loadAnimeData() {
    /*
      WEEK 1 TODO
  
      Load the anime JSON file from:
  
      /data/animes-sample.json
  
  
      Things to research / think about:
  
      1. How does JavaScript fetch() work?
      2. fetch() gives you a Response object.
      3. How do you convert a Response into JSON?
      4. What should happen if the request fails?
  
  
      When this function is complete, it should:
  
          const anime = await loadAnimeData()
  
      and "anime" should contain an array of anime objects.
    */

    // Fetches the anime data from the JSON file  
    const response = await fetch('/data/animes-sample.json');

    // Checks if the response is ok, if not throw an error
    if (!response.ok) {
      throw new Error('Failed to load anime data');
    }

    // Converts the response to JSON and return the data
    const data = await response.json();

    // returns the data
    return data;
    
  }
  
  
  export function searchAnime(animeList, searchText) {
    /*
      WEEK 3 TODO
  
      Search the anime dataset.
  
      Requirements:
  
      - Ignore uppercase/lowercase differences.
      - Search anime titles.
      - Search genres.
      - If the search box is empty, return everything.
  
  
      Example:
  
      searchAnime(animeList, "naruto")
  
      should return Naruto-related anime.
  
  
      Helpful JavaScript concepts:
  
      .filter()
      .includes()
      .toLowerCase()
      .trim()
      .join()
    */

    // Convert the search text to lowercase and trim whitespace
  const search = searchText.toLowerCase().trim();

  // Return everything if search box is empty
  if (search === '') {
    return animeList;
  }

  // Filter the anime list based on title and genre matches
  return animeList.filter(anime => {

    // Check if the title matches the search text
    const titleMatch = anime.title.toLowerCase().includes(search);

    // Check if any genre matches the search text
    const genreMatch = Array.isArray(anime.genre)

    // Check if the genre array exists and contains the search text
      ? anime.genre.some(genre =>
          genre.toLowerCase().includes(search)
        )
      : false;
    
    // Return true if either title or genre matches  
    return titleMatch || genreMatch;
  });
  
  }
  
  
  export function filterByGenre(animeList, genre) {
    /*
      WEEK 3 TODO
  
      Return only anime containing the selected genre.
  
      Examples:
  
      Action
      Comedy
      Romance
      Fantasy
  
  
      Think about:
  
      - What should happen when genre is "All"?
      - genre is stored as an array.
      - Array.includes() may be useful.
    */

    // Return all anime if genre is "All"
    if (genre === 'All') {
      return animeList; 
    }

    return animeList.filter(anime => {
      // Check if the genre array exists and includes the selected genre
      return Array.isArray(anime.genre) && anime.genre.includes(genre);
    });

  }
  
  
  export function filterByMinimumScore(animeList, minimumScore) {
    /*
      WEEK 3 TODO
  
      Return anime whose score is >= minimumScore.
  
      Example:
  
      minimumScore = 8
  
      should only return anime rated 8.0 or higher.
  
  
      Things to think about:
  
      - Dataset scores may need to be converted to Numbers.
      - Some anime might not have scores.
    */

    // Return all anime if minimumScore is not provided  
    if (minimumScore === undefined || minimumScore === null) {
      return animeList; 
    }

    // Filter the anime list based on the minimum score
    return animeList.filter(anime => {
      // Convert score to float and check if it's valid
      const score = parseFloat(anime.score);
      return !isNaN(score) && score >= minimumScore;
    });
  
    
  }
  
  
  export function calculateAverageScore(animeList) {
    /*
      WEEK 2 TODO
  
      Calculate the average score of the anime currently loaded.
  
      Steps you might need:
  
      1. Get the score from each anime.
      2. Ignore missing scores.
      3. Add the scores together.
      4. Divide by the number of valid scores.
  
  
      Useful concepts:
  
      .map()
      .filter()
      .reduce()
    */

      const validScores = animeList
        // Convert score to float
        .map(anime => parseFloat(anime.score)) 
        // Filter out invalid scores
        .filter(score => !isNaN(score)); 

      // Return 0 if there are no valid scores
      if (validScores.length === 0) {
        return 0; 
      }

      // Sum the valid scores
      const totalScore = validScores.reduce((sum, score) => sum + score, 0); 
      
      // Calculate the average
      const averageScore = totalScore / validScores.length; 
      
      // Return the average score
      return averageScore; 
  
  }