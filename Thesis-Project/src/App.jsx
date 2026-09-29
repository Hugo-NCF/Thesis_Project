import { useEffect, useState } from 'react'
import './App.css'

import {
  loadAnimeData,
  searchAnime,
  filterByGenre,
  filterByMinimumScore,
  calculateAverageScore
} from './utils/animeData'


function App() {
  const [anime, setAnime] = useState([])
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [minimumScore, setMinimumScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  // ----------------------------------------------------------
  // WEEK 1
  // Load your dataset when React first opens.
  // ----------------------------------------------------------

  useEffect(() => {
    async function getAnime() {
      setLoading(true)

      try {
        const data = await loadAnimeData()
        setAnime(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getAnime()
  }, [])


  // ----------------------------------------------------------
  // WEEK 3
  // Search and filter the anime data.
  // ----------------------------------------------------------

  let displayedAnime = anime

  displayedAnime = searchAnime(displayedAnime, search)
  displayedAnime = filterByGenre(displayedAnime, selectedGenre)
  displayedAnime = filterByMinimumScore(displayedAnime, minimumScore)


  // ----------------------------------------------------------
  // WEEK 2
  // Dataset statistic.
  // ----------------------------------------------------------

  const averageScore = calculateAverageScore(anime)


  return (
    <main className="app">

      <header>
        <p className="label">
          NCF Computer Science Thesis
        </p>

        <h1>Anime Recommender</h1>

        <p>
          Exploring anime data and building a personalized
          recommendation system.
        </p>
      </header>


      {/* DATASET STATUS */}

      <section className="status-panel">

        <h2>Dataset Status</h2>

        {loading && (
          <p>Loading dataset...</p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {!loading && !error && anime.length > 0 && (
          <p className="success-text">
            Dataset successfully loaded.
          </p>
        )}

        {!loading && !error && anime.length === 0 && (
          <p>
            No anime data was loaded.
          </p>
        )}

      </section>


      {/* DATASET STATISTICS */}

      <section className="stats">

        <div className="stat">
          <span>Anime Loaded</span>
          <strong>{anime.length}</strong>
        </div>

        <div className="stat">
          <span>Average Score</span>
          <strong>{averageScore.toFixed(2)}</strong>
        </div>

        <div className="stat">
          <span>Search Results</span>
          <strong>{displayedAnime.length}</strong>
        </div>

      </section>


      {/* DATASET EXPLORER */}

      <section className="explorer">

        <div className="explorer-header">

          <div>
            <p className="label">
              Dataset Explorer
            </p>

            <h2>
              Browse Anime
            </h2>
          </div>


          <input
            type="search"
            placeholder="Search anime or genre..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        {/* FILTERS */}

        <div className="filters">

          <select
            value={selectedGenre}
            onChange={(event) =>
              setSelectedGenre(event.target.value)
            }
          >
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Romance">Romance</option>
          </select>


          <select
            value={minimumScore ?? ''}
            onChange={(event) => {
              const value = event.target.value

              setMinimumScore(
                value === '' ? null : parseFloat(value)
              )
            }}
          >
            <option value="">Any Rating</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
            <option value="9">9+</option>
          </select>

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


                <div className="anime-info">

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    ⭐ {item.score || 'N/A'}
                    {' • '}
                    {item.episodes || 'N/A'} episodes
                  </p>


                  <div className="genres">

                    {item.genre
                      ?.slice(0, 4)
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


        {!loading && displayedAnime.length === 0 && (

          <div className="empty-state">

            <h3>
              No anime found.
            </h3>

            <p>
              Try changing your search or filters.
            </p>

          </div>

        )}

      </section>

    </main>
  )
}


export default App