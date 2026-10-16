import { useEffect, useState } from 'react'
import './App.css'

import AccountModal from './components/AccountModal'

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
        <span>Coming next</span>
      </div>

      <div>
        <strong>Watchlist</strong>
        <span>Coming next</span>
      </div>

      <div>
        <strong>Watched</strong>
        <span>Coming next</span>
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