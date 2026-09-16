import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [anime, setAnime] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/data/animes-sample.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Could not load anime dataset')
        }

        return response.json()
      })
      .then((data) => {
        setAnime(data)
        setLoading(false)
      })
      .catch((error) => {
        setError(error.message)
        setLoading(false)
      })
  }, [])

  const filteredAnime = useMemo(() => {
    const searchText = search.toLowerCase().trim()

    if (!searchText) {
      return anime
    }

    return anime.filter((item) => {
      const title = item.title?.toLowerCase() || ''

      const genres = Array.isArray(item.genre)
        ? item.genre.join(' ').toLowerCase()
        : ''

      return (
        title.includes(searchText) ||
        genres.includes(searchText)
      )
    })
  }, [anime, search])

  const averageScore = useMemo(() => {
    const scores = anime
      .map((item) => Number(item.score))
      .filter((score) => Number.isFinite(score) && score > 0)

    if (scores.length === 0) {
      return 'N/A'
    }

    const total = scores.reduce(
      (sum, score) => sum + score,
      0
    )

    return (total / scores.length).toFixed(2)
  }, [anime])

  if (loading) {
    return (
      <main className="app">
        <h1>Anime Recommender</h1>
        <p>Loading anime dataset...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="app">
        <h1>Anime Recommender</h1>
        <h2>Dataset Error</h2>
        <p>{error}</p>

        <p>
          Run:
          <code>
            python3 scripts/prepare_anime_data.py
          </code>
        </p>
      </main>
    )
  }

  return (
    <main className="app">
      <header>
        <p className="label">
          NCF Computer Science Thesis
        </p>

        <h1>Anime Recommender</h1>

        <p>
          Exploring the MyAnimeList dataset as the first
          step toward building a personalized anime
          recommendation system.
        </p>
      </header>

      <section className="success">
        ✅ Dataset loaded successfully — React is using{' '}
        <strong>{anime.length}</strong> anime records.
      </section>

      <section className="stats">
        <div className="stat">
          <span>Anime Loaded</span>
          <strong>{anime.length}</strong>
        </div>

        <div className="stat">
          <span>Average Score</span>
          <strong>{averageScore}</strong>
        </div>

        <div className="stat">
          <span>Search Results</span>
          <strong>{filteredAnime.length}</strong>
        </div>
      </section>

      <section className="explorer">
        <div className="explorer-header">
          <div>
            <p className="label">
              Dataset Explorer
            </p>

            <h2>Browse Anime</h2>
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

        <div className="anime-grid">
          {filteredAnime
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
                  <h3>{item.title}</h3>

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

        {filteredAnime.length === 0 && (
          <p>No anime matched your search.</p>
        )}
      </section>
    </main>
  )
}

export default App