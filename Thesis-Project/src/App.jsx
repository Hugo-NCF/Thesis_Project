import { useEffect, useState } from 'react'
import './App.css'

import AccountModal from './components/AccountModal'
import {
  recommendSimilarAnime,
  recommendForUser,
  recommendFromSimilarUsers,
  recommendHybridAnime
} from "./utils/recommender";

import {
  loadAnimeData,
  searchAnime,
  filterByGenre,
  filterByRating,
  calculateAverageScore
} from './utils/animeData'


function App() {
  // stores all anime loaded from the dataset
  const [anime, setAnime] = useState([])

  // stores the user's search text
  const [search, setSearch] = useState('')

  // stores the selected genre filter
  const [selectedGenre, setSelectedGenre] = useState('All')

  // stores the selected rating filter
  const [ratingFilter, setRatingFilter] = useState('Any')

  // stores whether the dataset is currently loading
  const [loading, setLoading] = useState(false)

  // stores any error that happens while loading the dataset
  const [error, setError] = useState('')

  // stores the currently logged-in user
  const [currentUser, setCurrentUser] = useState(null)

  // controls whether the login/signup window is open
  const [accountOpen, setAccountOpen] = useState(false)

  // controls whether the modal shows login or signup
  const [accountMode, setAccountMode] = useState('login')

  // stores the anime selected for Week 6 recommendations
  const [selectedRecommendationAnime, setSelectedRecommendationAnime] =
    useState(null)

  // stores the Week 6 recommendation search text
  const [recommendationSearch, setRecommendationSearch] =
    useState('')

  // stores the logged-in user's favorite anime ids
  const [userFavorites, setUserFavorites] = useState([])

  // stores the logged-in user's watchlist anime ids
  const [userWatchlist, setUserWatchlist] = useState([])

  // stores the logged-in user's watched anime ids
  const [userWatched, setUserWatched] = useState([])

  // stores whether user preferences are loading
  const [preferencesLoading, setPreferencesLoading] =
    useState(false)

  // stores any preference loading error
  const [preferencesError, setPreferencesError] =
    useState('')

  // stores other AniMatch users for Week 8
  const [otherUsers, setOtherUsers] = useState([])


  // ----------------------------------------------------------
  // WEEK 1
  // Load the dataset when React first opens.
  // ----------------------------------------------------------

  

  useEffect(() => {
    async function getAnime() {

      // start the loading state
      setLoading(true)

      try {

        // load the anime data using animeData.js
        const data = await loadAnimeData()

        // save the loaded anime into state
        setAnime(data)

      } catch (err) {

        // save the error message if loading fails
        setError(err.message)

      } finally {

        // stop the loading state
        setLoading(false)
      }
    }

    // load the anime when the page opens
    getAnime()

  }, [])


  // ----------------------------------------------------------
  // WEEK 7
  // Load the logged-in user's favorites and watched anime.
  // ----------------------------------------------------------

  useEffect(() => {

    // clear user preference data after logout
    if (!currentUser) {
      setUserFavorites([])
      setUserWatchlist([])
      setUserWatched([])
      setOtherUsers([])
      setPreferencesError('')
      return
    }


    async function loadUserPreferences() {

      setPreferencesLoading(true)
      setPreferencesError('')

      try {

        const identifier =
          encodeURIComponent(
            currentUser.username
          )

        const response = await fetch(
          `http://127.0.0.1:5000/api/users/${identifier}/preferences`
        )

        if (!response.ok) {
          throw new Error(
            'Could not load user preferences'
          )
        }

        const data = await response.json()

        setUserFavorites(
          data.favorites || []
        )

        setUserWatchlist(
          data.watchlist || []
        )

        setUserWatched(
          data.watched || []
        )


        // WEEK 8
        // load other users for collaborative filtering
        const usersResponse = await fetch(
          'http://127.0.0.1:5000/api/users'
        )

        if (!usersResponse.ok) {
          throw new Error(
            'Could not load AniMatch users'
          )
        }

        const usersData =
          await usersResponse.json()

        const filteredUsers =
          (usersData.users || []).filter(
            user =>
              user.username !==
              currentUser.username
          )

        setOtherUsers(filteredUsers)

      } catch (err) {

        setPreferencesError(
          err.message
        )

      } finally {

        setPreferencesLoading(false)

      }
    }


    loadUserPreferences()

  }, [currentUser])


  // ----------------------------------------------------------
  // WEEK 3
  // Search and filter the anime data.
  // ----------------------------------------------------------

  // start with the full anime list
  let displayedAnime = anime


  // filter based on the search bar
  displayedAnime = searchAnime(
    displayedAnime,
    search
  )


  // filter based on genre
  displayedAnime = filterByGenre(
    displayedAnime,
    selectedGenre
  )


  // filter based on rating
  displayedAnime = filterByRating(
    displayedAnime,
    ratingFilter
  )


  // ----------------------------------------------------------
  // WEEK 6
  // Basic content-based anime recommendations.
  // ----------------------------------------------------------

  // stores the recommendations for the selected anime
  let similarAnime = []

  // only run the recommender after an anime has been selected
  if (selectedRecommendationAnime) {
    similarAnime = recommendSimilarAnime(
      anime,
      selectedRecommendationAnime
    )
  }


  // filters anime for the Week 6 recommendation search
  const recommendationSearchResults =
    recommendationSearch.trim() === ''
      ? []
      : anime
          .filter(item =>
            item.title
              ?.toLowerCase()
              .includes(
                recommendationSearch
                  .toLowerCase()
                  .trim()
              )
          )
          .slice(0, 8)


  // saves the anime clicked in the recommendation search
  function handleRecommendationSelection(item) {
    setSelectedRecommendationAnime(item)
    setRecommendationSearch(item.title)
  }


  // ----------------------------------------------------------
  // WEEK 7
  // User anime preference controls.
  // ----------------------------------------------------------

  function hasAnime(animeIds, animeId) {
    return animeIds.some(
      id =>
        String(id) === String(animeId)
    )
  }


  async function updateUserPreference(
    preferenceType,
    animeId
  ) {
    if (!currentUser) {
      setAccountMode('login')
      setAccountOpen(true)
      return
    }

    let currentList = []
    let setCurrentList = null

    if (preferenceType === 'favorites') {
      currentList = userFavorites
      setCurrentList = setUserFavorites
    } else if (preferenceType === 'watchlist') {
      currentList = userWatchlist
      setCurrentList = setUserWatchlist
    } else if (preferenceType === 'watched') {
      currentList = userWatched
      setCurrentList = setUserWatched
    }

    const alreadyAdded =
      hasAnime(currentList, animeId)

    const identifier =
      encodeURIComponent(
        currentUser.username
      )

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/users/${identifier}/${preferenceType}`,
        {
          method: alreadyAdded
            ? 'DELETE'
            : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            anime_id: animeId
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Could not update anime preference'
        )
      }

      if (alreadyAdded) {
        setCurrentList(
          currentList.filter(
            id =>
              String(id) !==
              String(animeId)
          )
        )
      } else {
        setCurrentList([
          ...currentList,
          animeId
        ])
      }


      // WEEK 8
      // refresh other users after a preference changes
      // so collaborative recommendations use current MongoDB data
      const usersResponse = await fetch(
        'http://127.0.0.1:5000/api/users'
      )

      if (!usersResponse.ok) {
        throw new Error(
          'Could not refresh AniMatch users'
        )
      }

      const usersData =
        await usersResponse.json()

      const filteredUsers =
        (usersData.users || []).filter(
          user =>
            user.username !==
            currentUser.username
        )

      setOtherUsers(filteredUsers)

      setPreferencesError('')

    } catch (err) {
      setPreferencesError(
        err.message
      )
    }
  }


  // ----------------------------------------------------------
  // WEEK 7
  // Personalized recommendations for the logged-in user.
  // ----------------------------------------------------------

  let personalizedAnime = []

  if (
    currentUser &&
    (userFavorites.length > 0 ||
      userWatched.length > 0)
  ) {
    personalizedAnime = recommendForUser(
      anime,
      userFavorites,
      userWatched
    )
  }


  // ----------------------------------------------------------
  // WEEK 8
  // Collaborative recommendations from similar users.
  // ----------------------------------------------------------

  const currentUserAnimeIds = [
    ...new Set([
      ...userFavorites,
      ...userWatchlist,
      ...userWatched
    ])
  ]

  const collaborativeIds =
    currentUserAnimeIds.length > 0
      ? recommendFromSimilarUsers(
          currentUserAnimeIds,
          otherUsers
        )
      : []

  const collaborativeAnime =
    collaborativeIds
      .map(animeId =>
        anime.find(
          item =>
            String(item.uid) ===
            String(animeId)
        )
      )
      .filter(Boolean)


  // ----------------------------------------------------------
  // WEEK 9
  // Weighted hybrid recommendations.
  // ----------------------------------------------------------

  let hybridAnime = []

  if (
    currentUser &&
    currentUserAnimeIds.length > 0
  ) {
    hybridAnime = recommendHybridAnime(
      anime,
      userFavorites,
      userWatchlist,
      userWatched,
      otherUsers
    )
  }


  // ----------------------------------------------------------
  // WEEK 2
  // Dataset statistics.
  // ----------------------------------------------------------

  // calculate the average score
  const averageScore =
    calculateAverageScore(anime)


  // ----------------------------------------------------------
  // DATASET VISUALIZATIONS
  // ----------------------------------------------------------

  // object used to store how many times each genre appears
  const genreCounts = {}


  // loop through every anime
  anime.forEach(item => {

    // make sure the anime has a genre array
    if (Array.isArray(item.genre)) {

      // loop through each genre
      item.genre.forEach(genre => {

        // increase the count for that genre
        genreCounts[genre] =
          (genreCounts[genre] || 0) + 1

      })
    }
  })


  // turn the object into an array,
  // sort it from largest to smallest,
  // and keep only the top 6 genres
  const topGenres =
    Object.entries(genreCounts)
      .sort((a, b) =>
        b[1] - a[1]
      )
      .slice(0, 6)


  // score categories used for the score graph
  const scoreRanges = [

    {
      label: '9+',
      min: 9,
      max: 11,
      count: 0
    },

    {
      label: '8–8.9',
      min: 8,
      max: 9,
      count: 0
    },

    {
      label: '7–7.9',
      min: 7,
      max: 8,
      count: 0
    },

    {
      label: '6–6.9',
      min: 6,
      max: 7,
      count: 0
    },

    {
      label: 'Below 6',
      min: 0,
      max: 6,
      count: 0
    }
  ]


  // loop through anime to count the score ranges
  anime.forEach(item => {

    // convert the score into a number
    const score =
      parseFloat(item.score)


    // only continue if the score is valid
    if (!isNaN(score)) {

      // find which score range this anime belongs in
      const range =
        scoreRanges.find(
          range =>
            score >= range.min &&
            score < range.max
        )


      // increase the count for the matching range
      if (range) {
        range.count += 1
      }
    }
  })


  // find the largest genre count
  // used to calculate the graph bar widths
  const maxGenreCount =
    Math.max(
      ...topGenres.map(
        ([, count]) => count
      ),
      1
    )


  // find the largest score range
  // used to calculate the graph bar widths
  const maxScoreCount =
    Math.max(
      ...scoreRanges.map(
        range => range.count
      ),
      1
    )


  return (
    <main className="app">


      {/* NAVBAR */}

      <nav className="top-nav">

        <a
          className="brand"
          href="#top"
        >
          Ani<span>Match</span>
        </a>


        <div className="nav-links">

          <a href="#browse">
            Browse
          </a>

          <a href="#analytics">
            Analytics
          </a>

          <a href="#recommendations">
            Recommender
          </a>

          <a href="#for-you">
            For You
          </a>

          <a href="#community">
            Community
          </a>

          <a href="#hybrid">
            Hybrid
          </a>

        </div>


        {/* ACCOUNT AREA */}

<div className="account-nav">

{!currentUser ? (
  <>
    <button
      className="nav-login"
      onClick={() => {
        setAccountMode('login')
        setAccountOpen(true)
      }}
    >
      Login
    </button>


    <button
      className="nav-signup"
      onClick={() => {
        setAccountMode('register')
        setAccountOpen(true)
      }}
    >
      Sign Up
    </button>
  </>
) : (
  <>
    <div className="profile-pill">

      <div className="avatar">
        {currentUser.username
          .charAt(0)
          .toUpperCase()}
      </div>

      <div className="profile-nav-info">

        <strong>
          {currentUser.username}
        </strong>

        <span>
          {currentUser.email}
        </span>

      </div>

    </div>


    <button
      className="logout-button"
      onClick={() =>
        setCurrentUser(null)
      }
    >
      Logout
    </button>
  </>
)}

</div>

      </nav>


      {/* HERO */}

      <section
        className="hero-section"
        id="top"
      >

        <div className="hero-content">

          <p className="eyebrow">
            Find your next favorite series
          </p>


          <h1>
            Anime that matches your taste.
          </h1>


          <p className="hero-description">
            Explore anime from the MyAnimeList dataset
            and discover what you might want to watch next.
          </p>


          <a
            className="primary-button"
            href="#browse"
          >
            Browse Anime
          </a>

        </div>

      </section>

      {/* BASIC PROFILE PREVIEW */}

{currentUser && (

<section className="profile-section">

  <div className="profile-card">

    <div className="large-avatar">
      {currentUser.username
        .charAt(0)
        .toUpperCase()}
    </div>


    <div className="profile-details">

      <p className="eyebrow">
        Your AniMatch Profile
      </p>

      <h2>
        {currentUser.username}
      </h2>

      <p>
        {currentUser.email}
      </p>

    </div>


    <div className="profile-lists">

      <div>
        <strong>Favorites</strong>
        <span>{userFavorites.length}</span>
      </div>

      <div>
        <strong>Watchlist</strong>
        <span>{userWatchlist.length}</span>
      </div>

      <div>
        <strong>Watched</strong>
        <span>{userWatched.length}</span>
      </div>

    </div>

  </div>

</section>

)}


      {/* DATASET STATUS */}

      <section className="development-section">

        <div className="section-title-row">

          <div>

            <p className="eyebrow">
              Development Snapshot
            </p>

            <h2>
              Dataset Status
            </h2>

          </div>


          {/* show success message when dataset loads */}
          {!loading &&
            !error &&
            anime.length > 0 && (

            <span className="status-badge">

              <span className="status-dot"></span>

              Dataset successfully loaded

            </span>

          )}

        </div>


        {/* show loading message */}
        {loading && (
          <p>
            Loading dataset...
          </p>
        )}


        {/* show error message */}
        {error && (
          <p className="error">
            {error}
          </p>
        )}


        {/* DATASET STATISTICS */}

        <div className="stats">

          <div className="stat">

            <span>
              Anime Loaded
            </span>

            <strong>
              {anime.length}
            </strong>

          </div>


          <div className="stat">

            <span>
              Average Score
            </span>

            <strong>
              {averageScore.toFixed(2)}
            </strong>

          </div>


          <div className="stat">

            <span>
              Search Results
            </span>

            <strong>
              {displayedAnime.length}
            </strong>

          </div>

        </div>

      </section>


      {/* DATASET GRAPHS */}

      <section
        className="analytics-section"
        id="analytics"
      >

        <div className="section-heading">

          <p className="eyebrow">
            Dataset Overview
          </p>

          <h2>
            Explore the data
          </h2>

          <p>
            A quick look at the genres and ratings
            contained in the current dataset sample.
          </p>

        </div>


        <div className="charts-grid">


          {/* GENRE GRAPH */}

          <article className="chart-card">

            <div className="chart-header">

              <div>

                <span className="chart-kicker">
                  Genres
                </span>

                <h3>
                  Most Common Genres
                </h3>

              </div>


              <span className="chart-note">
                Top 6
              </span>

            </div>


            <div className="bar-chart">

              {topGenres.map(
                ([genre, count]) => (

                <div
                  className="bar-row"
                  key={genre}
                >

                  <div className="bar-label">

                    <span>
                      {genre}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>


                  <div className="bar-track">

                    <div
                      className="bar-fill"
                      style={{
                        width:
                          `${(count / maxGenreCount) * 100}%`
                      }}
                    ></div>

                  </div>

                </div>

              ))}

            </div>

          </article>


          {/* SCORE GRAPH */}

          <article className="chart-card">

            <div className="chart-header">

              <div>

                <span className="chart-kicker">
                  Ratings
                </span>

                <h3>
                  Score Distribution
                </h3>

              </div>


              <span className="chart-note">
                MAL Score
              </span>

            </div>


            <div className="bar-chart">

              {scoreRanges.map(
                range => (

                <div
                  className="bar-row"
                  key={range.label}
                >

                  <div className="bar-label">

                    <span>
                      {range.label}
                    </span>

                    <strong>
                      {range.count}
                    </strong>

                  </div>


                  <div className="bar-track">

                    <div
                      className="bar-fill secondary-fill"
                      style={{
                        width:
                          `${(range.count / maxScoreCount) * 100}%`
                      }}
                    ></div>

                  </div>

                </div>

              ))}

            </div>

          </article>

        </div>

      </section>


      {/* WEEK 6 RECOMMENDER */}

      <section
        className="recommendation-section"
        id="recommendations"
      >

        <div className="section-heading">

          <p className="eyebrow">
            AniMatch Recommender
          </p>

          <h2>
            Find Similar Anime
          </h2>

          <p>
            Choose an anime you enjoy and AniMatch will
            recommend five similar titles using shared genres
            and score similarity.
          </p>

        </div>


        {/* ANIME SEARCH */}

        <div className="recommendation-search">

          <label htmlFor="recommendation-search">
            Search for an anime
          </label>

          <div className="recommendation-search-box">

            <input
              id="recommendation-search"
              type="search"
              placeholder="Search anime title..."
              value={recommendationSearch}
              onChange={(event) => {
                setRecommendationSearch(
                  event.target.value
                )

                setSelectedRecommendationAnime(null)
              }}
            />

            {/* SEARCH RESULTS */}

            {recommendationSearchResults.length > 0 &&
              !selectedRecommendationAnime && (

              <div className="recommendation-search-results">

                {recommendationSearchResults.map(
                  (item, index) => (

                  <button
                    type="button"
                    key={
                      item.uid ??
                      `${item.title}-${index}`
                    }
                    onClick={() =>
                      handleRecommendationSelection(item)
                    }
                  >

                    <div className="search-result-text">

                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {item.score || 'N/A'} score
                      </span>

                    </div>

                    <span className="search-result-genres">

                      {Array.isArray(item.genre)
                        ? item.genre
                            .slice(0, 2)
                            .join(', ')
                        : 'No genres'}

                    </span>

                  </button>

                ))}

              </div>

            )}


            {/* NO SEARCH RESULTS */}

            {recommendationSearch.trim() !== '' &&
              recommendationSearchResults.length === 0 &&
              !selectedRecommendationAnime && (

              <div className="recommendation-no-results">
                No anime found
              </div>

            )}

          </div>

        </div>


        {/* SELECTED ANIME */}

        {selectedRecommendationAnime && (

          <div className="selected-recommendation-anime">

            <div>

              <span className="recommendation-label">
                Because you selected
              </span>

              <h3>
                {selectedRecommendationAnime.title}
              </h3>

            </div>

            <span className="selected-score">
              ★ {selectedRecommendationAnime.score || 'N/A'}
            </span>

          </div>

        )}


        {/* RECOMMENDATION RESULTS */}

        {selectedRecommendationAnime && (

          <div className="recommendation-results">

            <div className="results-heading">

              <h3>
                You Might Also Like
              </h3>

              <span>
                {similarAnime.length} recommendations
              </span>

            </div>


            <div className="recommendation-grid">

              {similarAnime.map((item, index) => (

                <article
                  className="recommendation-card"
                  key={
                    item.uid ??
                    `${item.title}-${index}`
                  }
                >

                  <div className="recommendation-poster">

                    {item.img_url ? (

                      <img
                        src={item.img_url}
                        alt={`${item.title} poster`}
                      />

                    ) : (

                      <div className="no-image">
                        No Image
                      </div>

                    )}

                    <div className="score-badge">
                      ★ {item.score || 'N/A'}
                    </div>

                  </div>


                  <div className="recommendation-card-info">

                    <h3>
                      {item.title}
                    </h3>

                    <p className="anime-meta">
                      {item.episodes || 'N/A'} episodes
                    </p>


                    <div className="genres">

                      {item.genre
                        ?.slice(0, 3)
                        .map((genre) => (

                          <span key={genre}>
                            {genre}
                          </span>

                        ))}

                    </div>

                  </div>

                </article>

              ))}

            </div>

          </div>

        )}


        {/* STARTING MESSAGE */}

        {!selectedRecommendationAnime && (

          <div className="recommendation-empty">

            <div className="recommendation-empty-icon">
              ★
            </div>

            <h3>
              Search for an anime to get started
            </h3>

            <p>
              AniMatch will compare it with the dataset
              and show the five closest matches.
            </p>

          </div>

        )}

      </section>


      {/* WEEK 7 PERSONALIZED RECOMMENDATIONS */}

      <section
        className="personalized-section"
        id="for-you"
      >

        <div className="section-heading">

          <p className="eyebrow">
            Personalized For You
          </p>

          <h2>
            Recommended For You
          </h2>

          <p>
            AniMatch uses your favorites and watched anime
            to learn which genres you enjoy most.
          </p>

        </div>


        {/* USER MUST BE LOGGED IN */}

        {!currentUser && (

          <div className="personalized-message">

            <h3>
              Log in to get personalized recommendations
            </h3>

            <p>
              Your favorites and watched anime are used
              to build your recommendation profile.
            </p>

            <button
              type="button"
              onClick={() => {
                setAccountMode('login')
                setAccountOpen(true)
              }}
            >
              Login
            </button>

          </div>

        )}


        {/* LOADING USER PREFERENCES */}

        {currentUser &&
          preferencesLoading && (

          <div className="personalized-message">
            <p>
              Loading your anime preferences...
            </p>
          </div>

        )}


        {/* PREFERENCE ERROR */}

        {currentUser &&
          preferencesError && (

          <div className="personalized-message error-message">

            <h3>
              Could not load recommendations
            </h3>

            <p>
              {preferencesError}
            </p>

          </div>

        )}


        {/* USER HAS NO FAVORITES OR WATCHED ANIME */}

        {currentUser &&
          !preferencesLoading &&
          !preferencesError &&
          userFavorites.length === 0 &&
          userWatched.length === 0 && (

          <div className="personalized-message">

            <h3>
              Your recommendation profile is empty
            </h3>

            <p>
              Add anime to your favorites or watched list
              so AniMatch can learn your preferred genres.
            </p>

          </div>

        )}


        {/* PERSONALIZED RESULTS */}

        {currentUser &&
          !preferencesLoading &&
          !preferencesError &&
          personalizedAnime.length > 0 && (

          <div className="personalized-results">

            <div className="personalized-summary">

              <div>

                <span>
                  Profile based on
                </span>

                <strong>
                  {userFavorites.length +
                    userWatched.length}{' '}
                  anime
                </strong>

              </div>

              <div>

                <span>
                  Favorites
                </span>

                <strong>
                  {userFavorites.length}
                </strong>

              </div>

              <div>

                <span>
                  Watchlist
                </span>

                <strong>
                  {userWatchlist.length}
                </strong>

              </div>

              <div>

                <span>
                  Watched
                </span>

                <strong>
                  {userWatched.length}
                </strong>

              </div>

            </div>


            <div className="results-heading">

              <h3>
                Top Matches For You
              </h3>

              <span>
                {personalizedAnime.length} recommendations
              </span>

            </div>


            <div className="recommendation-grid">

              {personalizedAnime.map(
                (item, index) => (

                <article
                  className="recommendation-card"
                  key={
                    item.uid ??
                    `${item.title}-${index}`
                  }
                >

                  <div className="recommendation-poster">

                    {item.img_url ? (

                      <img
                        src={item.img_url}
                        alt={`${item.title} poster`}
                      />

                    ) : (

                      <div className="no-image">
                        No Image
                      </div>

                    )}

                    <div className="score-badge">
                      ★ {item.score || 'N/A'}
                    </div>

                  </div>


                  <div className="recommendation-card-info">

                    <h3>
                      {item.title}
                    </h3>

                    <p className="anime-meta">
                      {item.episodes || 'N/A'} episodes
                    </p>

                    <div className="genres">

                      {item.genre
                        ?.slice(0, 3)
                        .map((genre) => (

                          <span key={genre}>
                            {genre}
                          </span>

                        ))}

                    </div>


                  <div className="anime-actions">

                    <button
                      type="button"
                      className={
                        hasAnime(userFavorites, item.uid)
                          ? 'anime-action active-action'
                          : 'anime-action'
                      }
                      onClick={() =>
                        updateUserPreference(
                          'favorites',
                          item.uid
                        )
                      }
                    >
                      ♥ Favorite
                    </button>

                    <button
                      type="button"
                      className={
                        hasAnime(userWatchlist, item.uid)
                          ? 'anime-action active-action'
                          : 'anime-action'
                      }
                      onClick={() =>
                        updateUserPreference(
                          'watchlist',
                          item.uid
                        )
                      }
                    >
                      + Watchlist
                    </button>

                    <button
                      type="button"
                      className={
                        hasAnime(userWatched, item.uid)
                          ? 'anime-action active-action'
                          : 'anime-action'
                      }
                      onClick={() =>
                        updateUserPreference(
                          'watched',
                          item.uid
                        )
                      }
                    >
                      ✓ Watched
                    </button>

                  </div>

                  </div>

                </article>

              ))}

            </div>

          </div>

        )}

      </section>


      {/* WEEK 8 COLLABORATIVE RECOMMENDATIONS */}

      <section
        className="collaborative-section"
        id="community"
      >

        <div className="section-heading">

          <p className="eyebrow">
            Community Matches
          </p>

          <h2>
            Recommended From Similar Users
          </h2>

          <p>
            AniMatch compares your favorites and watched anime
            with other users and recommends titles enjoyed by
            people with similar taste.
          </p>

        </div>


        {!currentUser && (

          <div className="personalized-message">

            <h3>
              Log in to use community recommendations
            </h3>

            <p>
              AniMatch needs your account preferences before
              it can compare your taste with other users.
            </p>

          </div>

        )}


        {currentUser &&
          currentUserAnimeIds.length === 0 && (

          <div className="personalized-message">

            <h3>
              Add some anime first
            </h3>

            <p>
              Favorite, add to watchlist, or mark anime as watched
              so AniMatch has something to compare with other users.
            </p>

          </div>

        )}


        {currentUser &&
          currentUserAnimeIds.length > 0 &&
          otherUsers.length === 0 && (

          <div className="personalized-message">

            <h3>
              No other users to compare yet
            </h3>

            <p>
              Collaborative recommendations need at least
              one other AniMatch account with saved anime.
            </p>

          </div>

        )}


        {currentUser &&
          currentUserAnimeIds.length > 0 &&
          otherUsers.length > 0 &&
          collaborativeAnime.length === 0 && (

          <div className="personalized-message">

            <h3>
              No new community recommendations yet
            </h3>

            <p>
              AniMatch found no new anime to recommend from
              users with overlapping favorites, watchlist, or watched anime.
            </p>

          </div>

        )}


        {collaborativeAnime.length > 0 && (

          <div className="collaborative-results">

            <div className="results-heading">

              <h3>
                Community Recommendations
              </h3>

              <span>
                {collaborativeAnime.length} recommendations
              </span>

            </div>


            <div className="recommendation-grid">

              {collaborativeAnime.map(
                (item, index) => (

                <article
                  className="recommendation-card"
                  key={
                    item.uid ??
                    `${item.title}-${index}`
                  }
                >

                  <div className="recommendation-poster">

                    {item.img_url ? (

                      <img
                        src={item.img_url}
                        alt={`${item.title} poster`}
                      />

                    ) : (

                      <div className="no-image">
                        No Image
                      </div>

                    )}

                    <div className="score-badge">
                      ★ {item.score || 'N/A'}
                    </div>

                  </div>


                  <div className="recommendation-card-info">

                    <h3>
                      {item.title}
                    </h3>

                    <p className="anime-meta">
                      {item.episodes || 'N/A'} episodes
                    </p>

                    <div className="genres">

                      {item.genre
                        ?.slice(0, 3)
                        .map((genre) => (

                          <span key={genre}>
                            {genre}
                          </span>

                        ))}

                    </div>


                    <div className="anime-actions">

                      <button
                        type="button"
                        className={
                          hasAnime(
                            userFavorites,
                            item.uid
                          )
                            ? 'anime-action active-action'
                            : 'anime-action'
                        }
                        onClick={() =>
                          updateUserPreference(
                            'favorites',
                            item.uid
                          )
                        }
                      >
                        ♥ Favorite
                      </button>

                      <button
                        type="button"
                        className={
                          hasAnime(
                            userWatchlist,
                            item.uid
                          )
                            ? 'anime-action active-action'
                            : 'anime-action'
                        }
                        onClick={() =>
                          updateUserPreference(
                            'watchlist',
                            item.uid
                          )
                        }
                      >
                        + Watchlist
                      </button>

                      <button
                        type="button"
                        className={
                          hasAnime(
                            userWatched,
                            item.uid
                          )
                            ? 'anime-action active-action'
                            : 'anime-action'
                        }
                        onClick={() =>
                          updateUserPreference(
                            'watched',
                            item.uid
                          )
                        }
                      >
                        ✓ Watched
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          </div>

        )}

      </section>


      {/* WEEK 9 HYBRID RECOMMENDATIONS */}

      <section
        className="hybrid-section"
        id="hybrid"
      >

        <div className="section-heading">

          <p className="eyebrow">
            Hybrid Recommender
          </p>

          <h2>
            Best Overall Matches
          </h2>

          <p>
            AniMatch combines content similarity,
            your personal genre profile,
            and community behavior into one
            weighted recommendation score.
          </p>

        </div>


        {!currentUser && (

          <div className="personalized-message">

            <h3>
              Log in to use hybrid recommendations
            </h3>

            <p>
              Hybrid recommendations need your saved anime
              and account preferences.
            </p>

          </div>

        )}


        {currentUser &&
          currentUserAnimeIds.length === 0 && (

          <div className="personalized-message">

            <h3>
              Add some anime first
            </h3>

            <p>
              Favorite, add to watchlist, or mark anime as watched
              so AniMatch can build your hybrid profile.
            </p>

          </div>

        )}


        {currentUser &&
          currentUserAnimeIds.length > 0 &&
          hybridAnime.length === 0 && (

          <div className="personalized-message">

            <h3>
              No hybrid recommendations yet
            </h3>

            <p>
              AniMatch could not rank any new anime yet.
            </p>

          </div>

        )}


        {hybridAnime.length > 0 && (

          <div className="hybrid-results">

            <div className="results-heading">

              <h3>
                Top Hybrid Recommendations
              </h3>

              <span>
                {hybridAnime.length} recommendations
              </span>

            </div>


            <div className="recommendation-grid">

              {hybridAnime.map(
                (item, index) => (

                <article
                  className="recommendation-card"
                  key={
                    item.uid ??
                    `${item.title}-${index}`
                  }
                >

                  <div className="recommendation-poster">

                    {item.img_url ? (

                      <img
                        src={item.img_url}
                        alt={`${item.title} poster`}
                      />

                    ) : (

                      <div className="no-image">
                        No Image
                      </div>

                    )}

                    <div className="score-badge">
                      ★ {item.score || 'N/A'}
                    </div>

                  </div>


                  <div className="recommendation-card-info">

                    <h3>
                      {item.title}
                    </h3>

                    <p className="anime-meta">
                      {item.episodes || 'N/A'} episodes
                    </p>

                    <div className="genres">

                      {item.genre
                        ?.slice(0, 3)
                        .map((genre) => (

                          <span key={genre}>
                            {genre}
                          </span>

                        ))}

                    </div>


                    <div className="anime-actions">

                      <button
                        type="button"
                        className={
                          hasAnime(
                            userFavorites,
                            item.uid
                          )
                            ? 'anime-action active-action'
                            : 'anime-action'
                        }
                        onClick={() =>
                          updateUserPreference(
                            'favorites',
                            item.uid
                          )
                        }
                      >
                        ♥ Favorite
                      </button>

                      <button
                        type="button"
                        className={
                          hasAnime(
                            userWatchlist,
                            item.uid
                          )
                            ? 'anime-action active-action'
                            : 'anime-action'
                        }
                        onClick={() =>
                          updateUserPreference(
                            'watchlist',
                            item.uid
                          )
                        }
                      >
                        + Watchlist
                      </button>

                      <button
                        type="button"
                        className={
                          hasAnime(
                            userWatched,
                            item.uid
                          )
                            ? 'anime-action active-action'
                            : 'anime-action'
                        }
                        onClick={() =>
                          updateUserPreference(
                            'watched',
                            item.uid
                          )
                        }
                      >
                        ✓ Watched
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          </div>

        )}

      </section>


      {/* BROWSE SECTION */}

      <section
        className="explorer"
        id="browse"
      >

        <div className="section-heading browse-heading">

          <p className="eyebrow">
            Explore
          </p>

          <h2>
            Browse Anime
          </h2>

          <p>
            Search by title or genre and narrow
            your results using the filters.
          </p>

        </div>


        {/* SEARCH AND FILTER CONTROLS */}

        <div className="search-filter-panel">


          {/* SEARCH BAR */}

          <div className="search-wrapper">

            {/* magnifying glass search icon */}
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <path
                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

            </svg>


            <input
              className="search-input"
              type="search"
              placeholder="Search anime or genre..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          {/* FILTERS */}

          <div className="filters">


            {/* GENRE FILTER */}

            <label className="filter-control">

              <span>
                Genre
              </span>


              <select
                value={selectedGenre}
                onChange={(event) =>
                  setSelectedGenre(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Genres
                </option>

                <option value="Action">
                  Action
                </option>

                <option value="Adventure">
                  Adventure
                </option>

                <option value="Comedy">
                  Comedy
                </option>

                <option value="Drama">
                  Drama
                </option>

                <option value="Fantasy">
                  Fantasy
                </option>

                <option value="Romance">
                  Romance
                </option>

              </select>

            </label>


            {/* RATING FILTER */}

            <label className="filter-control">

              <span>
                Rating
              </span>


              <select
                value={ratingFilter}
                onChange={(event) =>

                  // save the selected rating filter
                  setRatingFilter(
                    event.target.value
                  )

                }
              >

                {/* show all anime */}
                <option value="Any">
                  Any Rating
                </option>


                {/* LOWER RATED ANIME */}

                <option value="below2">
                  Below 2
                </option>

                <option value="below3">
                  Below 3
                </option>

                <option value="below4">
                  Below 4
                </option>

                <option value="below5">
                  Below 5
                </option>

                <option value="below6">
                  Below 6
                </option>


                {/* HIGHER RATED ANIME */}

                <option value="6plus">
                  6+
                </option>

                <option value="7plus">
                  7+
                </option>

                <option value="8plus">
                  8+
                </option>

                <option value="9plus">
                  9+
                </option>

              </select>

            </label>

          </div>

        </div>


        {/* SEARCH RESULTS TITLE */}

        <div className="results-heading">

          <h3>

            {search ||
            selectedGenre !== 'All' ||
            ratingFilter !== 'Any'

              ? 'Matching Anime'

              : 'Anime Library'}

          </h3>


          <span>
            {displayedAnime.length} results
          </span>

        </div>


        {/* ANIME CARDS */}

        <div className="anime-grid">

          {displayedAnime
            .slice(0, 24)
            .map((item, index) => (

              <article
                className="anime-card"
                key={
                  item.uid ??
                  `${item.title}-${index}`
                }
              >


                {/* ANIME POSTER */}

                <div className="poster-wrapper">

                  {item.img_url ? (

                    <img
                      src={item.img_url}
                      alt={`${item.title} poster`}
                    />

                  ) : (

                    <div className="no-image">
                      No Image
                    </div>

                  )}


                  {/* anime score */}
                  <div className="score-badge">

                    ★ {item.score || 'N/A'}

                  </div>

                </div>


                {/* ANIME INFORMATION */}

                <div className="anime-info">

                  <h3>
                    {item.title}
                  </h3>


                  <p className="anime-meta">

                    {item.episodes || 'N/A'} episodes

                  </p>


                  {/* show up to three genres */}

                  <div className="genres">

                    {item.genre
                      ?.slice(0, 3)
                      .map((genre) => (

                        <span key={genre}>
                          {genre}
                        </span>

                      ))}

                  </div>


                  <div className="anime-actions">

                    <button
                      type="button"
                      className={
                        hasAnime(userFavorites, item.uid)
                          ? 'anime-action active-action'
                          : 'anime-action'
                      }
                      onClick={() =>
                        updateUserPreference(
                          'favorites',
                          item.uid
                        )
                      }
                    >
                      ♥ Favorite
                    </button>

                    <button
                      type="button"
                      className={
                        hasAnime(userWatchlist, item.uid)
                          ? 'anime-action active-action'
                          : 'anime-action'
                      }
                      onClick={() =>
                        updateUserPreference(
                          'watchlist',
                          item.uid
                        )
                      }
                    >
                      + Watchlist
                    </button>

                    <button
                      type="button"
                      className={
                        hasAnime(userWatched, item.uid)
                          ? 'anime-action active-action'
                          : 'anime-action'
                      }
                      onClick={() =>
                        updateUserPreference(
                          'watched',
                          item.uid
                        )
                      }
                    >
                      ✓ Watched
                    </button>

                  </div>

                </div>

              </article>

            ))}

        </div>


        {/* show message when no anime match */}

        {!loading &&
          displayedAnime.length === 0 && (

          <div className="empty-state">

            <div className="empty-icon">
              ⌕
            </div>

            <h3>
              No anime found
            </h3>

            <p>
              Try changing your search or filters.
            </p>

          </div>

        )}

      </section>


      {/* FOOTER */}

      <footer>

        <a
          className="brand footer-brand"
          href="#top"
        >
          Ani<span>Match</span>
        </a>


        <p>
          Anime discovery and recommendation project.
        </p>

      </footer>

{/* LOGIN / SIGN UP MODAL */}

{accountOpen && (

<AccountModal
  mode={accountMode}
  setMode={setAccountMode}
  onClose={() =>
    setAccountOpen(false)
  }
  onLogin={(user) =>
    setCurrentUser(user)
  }
/>

)}

    </main>
  )
}


export default App