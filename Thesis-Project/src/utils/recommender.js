// ----------------------------------------------------------
// WEEK 6
// CONTENT-BASED RECOMMENDATIONS
// ----------------------------------------------------------


// count how many genres two anime share
export function countSharedGenres(
  animeA,
  animeB
) {
  // check that both anime have genre arrays
  if (
    !Array.isArray(animeA.genre) ||
    !Array.isArray(animeB.genre)
  ) {
    return 0
  }

  // start shared genre count at 0
  let sharedGenreCount = 0

  // loop through animeA genres
  for (const genre of animeA.genre) {

    // check if animeB has the same genre
    if (animeB.genre.includes(genre)) {
      sharedGenreCount++
    }
  }

  return sharedGenreCount
}


// compare the MAL scores of two anime
export function calculateScoreSimilarity(
  animeA,
  animeB
) {
  const scoreA = parseFloat(
    animeA.score
  )

  const scoreB = parseFloat(
    animeB.score
  )

  // return 0 if either score is invalid
  if (
    isNaN(scoreA) ||
    isNaN(scoreB)
  ) {
    return 0
  }

  const scoreDifference =
    Math.abs(
      scoreA - scoreB
    )

  // closer scores get higher similarity
  if (scoreDifference <= 1) {
    return 5
  } else if (scoreDifference <= 2) {
    return 4
  } else if (scoreDifference <= 3) {
    return 3
  } else if (scoreDifference <= 4) {
    return 2
  } else if (scoreDifference <= 5) {
    return 1
  } else {
    return 0
  }
}


// calculate the overall similarity
// between two anime
export function calculateSimilarity(
  animeA,
  animeB
) {
  const sharedGenreCount =
    countSharedGenres(
      animeA,
      animeB
    )

  const scoreSimilarity =
    calculateScoreSimilarity(
      animeA,
      animeB
    )

  // genre is more important
  // than MAL score
  const genreWeight = 4

  const totalSimilarity =
    sharedGenreCount *
      genreWeight +
    scoreSimilarity

  return totalSimilarity
}


// recommend anime similar
// to one selected anime
export function recommendSimilarAnime(
  animeList,
  selectedAnime
) {
  const recommendations = []

  // compare selected anime
  // against every anime
  for (const anime of animeList) {

    // do not recommend
    // the selected anime itself
    if (
      anime.uid ===
      selectedAnime.uid
    ) {
      continue
    }

    const similarityScore =
      calculateSimilarity(
        selectedAnime,
        anime
      )

    recommendations.push({
      anime: anime,
      similarityScore:
        similarityScore
    })
  }

  // highest similarity first
  recommendations.sort(
    (a, b) =>
      b.similarityScore -
      a.similarityScore
  )

  // return top 5 anime
  return recommendations
    .slice(0, 5)
    .map(
      recommendation =>
        recommendation.anime
    )
}



// ----------------------------------------------------------
// WEEK 7
// PERSONALIZED RECOMMENDATIONS
// ----------------------------------------------------------


// create a genre profile
// from the user's saved anime
export function buildGenreProfile(
  animeList,
  animeIds
) {
  const genreProfile = {}

  // go through all anime
  for (const anime of animeList) {

    // check if this anime belongs
    // to the user's saved anime
    const matchesUserAnime =
      animeIds.some(
        animeId =>
          String(animeId) ===
          String(anime.uid)
      )

    if (matchesUserAnime) {

      // skip anime without genres
      if (
        !Array.isArray(
          anime.genre
        )
      ) {
        continue
      }

      // count each genre
      for (
        const genre
        of anime.genre
      ) {

        if (!genreProfile[genre]) {
          genreProfile[genre] = 0
        }

        genreProfile[genre]++
      }
    }
  }

  return genreProfile
}


// calculate how well an anime
// matches the user's genre profile
export function calculatePersonalizedScore(
  anime,
  genreProfile
) {
  let genreScore = 0

  // skip anime without genres
  if (
    !Array.isArray(
      anime.genre
    )
  ) {
    return 0
  }

  // add points for genres
  // the user already likes
  for (
    const genre
    of anime.genre
  ) {

    if (genreProfile[genre]) {
      genreScore +=
        genreProfile[genre]
    }
  }

  return genreScore
}


// recommend anime based on
// the user's favorites and watched list
export function recommendForUser(
  animeList,
  favoriteIds,
  watchedIds
) {
  // combine favorites and watched
  // and remove duplicate ids
  const userAnimeIds = [
    ...new Set([
      ...favoriteIds,
      ...watchedIds
    ])
  ]

  // build user's preferred genres
  const genreProfile =
    buildGenreProfile(
      animeList,
      userAnimeIds
    )

  const recommendations = []

  // score every anime
  for (const anime of animeList) {

    // check if user already knows it
    const alreadySeen =
      userAnimeIds.some(
        animeId =>
          String(animeId) ===
          String(anime.uid)
      )

    // do not recommend
    // anime already saved
    if (alreadySeen) {
      continue
    }

    const personalizedScore =
      calculatePersonalizedScore(
        anime,
        genreProfile
      )

    recommendations.push({
      anime: anime,
      personalizedScore:
        personalizedScore
    })
  }

  // highest personalized score first
  recommendations.sort(
    (a, b) =>
      b.personalizedScore -
      a.personalizedScore
  )

  // return top 5 anime
  return recommendations
    .slice(0, 5)
    .map(
      recommendation =>
        recommendation.anime
    )
}



// ----------------------------------------------------------
// WEEK 8
// COLLABORATIVE FILTERING
// ----------------------------------------------------------


// count how many anime
// two users have in common
export function calculateUserSimilarity(
  userAnimeIdsA,
  userAnimeIdsB
) {
  let sharedCount = 0

  // loop through user A's anime
  for (
    const animeIdA
    of userAnimeIdsA
  ) {

    // check whether user B
    // has the same anime
    const match =
      userAnimeIdsB.some(
        animeIdB =>
          String(animeIdB) ===
          String(animeIdA)
      )

    if (match) {
      sharedCount++
    }
  }

  return sharedCount
}


// recommend anime using
// other users with similar taste
export function recommendFromSimilarUsers(
  currentUserAnimeIds,
  otherUsers
) {
  // stores candidate anime scores
  const candidateScores = {}

  // compare against every other user
  for (
    const otherUser
    of otherUsers
  ) {

    // WEEK 8
    // combine favorites,
    // watchlist, and watched
    const otherUserAnimeIds = [
      ...new Set([
        ...(
          otherUser.favorites ||
          []
        ),
        ...(
          otherUser.watchlist ||
          []
        ),
        ...(
          otherUser.watched ||
          []
        )
      ])
    ]

    // calculate how similar
    // this user is
    const sharedCount =
      calculateUserSimilarity(
        currentUserAnimeIds,
        otherUserAnimeIds
      )

    // ignore users with
    // no shared anime
    if (sharedCount === 0) {
      continue
    }

    // look through anime
    // from the similar user
    for (
      const animeId
      of otherUserAnimeIds
    ) {

      // check if current user
      // already knows this anime
      const alreadyKnown =
        currentUserAnimeIds.some(
          currentId =>
            String(currentId) ===
            String(animeId)
        )

      // do not recommend
      // something already saved
      if (alreadyKnown) {
        continue
      }

      // use string version
      // as object key
      const animeKey =
        String(animeId)

      // stronger user similarity
      // gives more points
      candidateScores[
        animeKey
      ] =
        (
          candidateScores[
            animeKey
          ] || 0
        ) +
        sharedCount
    }
  }

  // convert score object
  // into an array
  const rankedCandidates =
    Object.entries(
      candidateScores
    )

  // highest score first
  rankedCandidates.sort(
    (a, b) =>
      b[1] - a[1]
  )

  // return top 5 anime ids
  return rankedCandidates
    .slice(0, 5)
    .map(
      candidate =>
        candidate[0]
    )
}

// ----------------------------------------------------------
// WEEK 9
// HYBRID RECOMMENDER
// ----------------------------------------------------------

// combine scores from content-based, personalized, and collaborative recommendations 
export function calculateHybridScore(
  contentScore,
  personalizedScore,
  collaborativeScore
) {
  // Define weights for each recommendation type
  const contentWeight = 0.4
  const personalizedWeight = 0.3
  const collaborativeWeight = 0.3

  // Calculate the weighted hybrid score
  const hybridScore =
    contentScore * contentWeight +
    personalizedScore * personalizedWeight +
    collaborativeScore * collaborativeWeight

  return hybridScore
}

export function recommendHybridAnime(animeList,favoriteIds,watchlistIds,watchedIds,otherUsers) {
  // combine user's saved anime
  const userAnimeIds = [
    ...new Set([
      ...favoriteIds,
      ...watchlistIds,
      ...watchedIds
    ])
  ]

  // build genre profile
  const genreProfile =
    buildGenreProfile(
      animeList,
      userAnimeIds
    )

  // create recommendation array
  const recommendations = []

  // loop through anime
  for (const anime of animeList) {

    // don't recommend anime already saved
    const alreadySeen =
      userAnimeIds.some(
        animeId =>
          String(animeId) ===
          String(anime.uid)
      )
      // do not recommend anime already saved
    if (alreadySeen) {
      continue
    }


    // --------------------------------
    // PERSONALIZED SCORE
    // --------------------------------

    // calculate how well this anime matches the user's genre profile
    const personalizedScore =
      calculatePersonalizedScore(
        anime,
        genreProfile
      )


    // --------------------------------
    // CONTENT SCORE
    // --------------------------------

    // calculate how similar this anime is to the user's saved anime
    let contentScore = 0

    // loop through the user's saved anime
    for (const userAnimeId of userAnimeIds) {

      // find the user's anime object in the anime list
      const userAnime =
        animeList.find(
          item =>
            String(item.uid) ===
            String(userAnimeId)
        )

        // skip if the user's anime is not found in the anime list
      if (!userAnime) {
        continue
      }

      // calculate similarity between the current anime and the user's anime
      const similarity =
        calculateSimilarity(
          anime,
          userAnime
        )

        // update content score if this similarity is higher than the current content score
      if (similarity > contentScore) {
        contentScore = similarity
      }
    }


    // --------------------------------
    // COLLABORATIVE SCORE
    // --------------------------------

    // calculate how many similar users have this anime
    let collaborativeScore = 0

    // loop through other users
    for (const otherUser of otherUsers) {

      // combine the other user's lists
      const otherUserAnimeIds = [
        ...new Set([
          ...(otherUser.favorites || []),
          ...(otherUser.watchlist || []),
          ...(otherUser.watched || [])
        ])
      ]

      // calculate similarity between users
      const userSimilarity =
        calculateUserSimilarity(
          userAnimeIds,
          otherUserAnimeIds
        )

      // check if the other user has this anime
      const otherUserHasAnime =
        otherUserAnimeIds.some(
          animeId =>
            String(animeId) ===
            String(anime.uid)
        )

      // add collaborative points
      if (otherUserHasAnime) {
        collaborativeScore +=
          userSimilarity
      }
    }


    // --------------------------------
    // HYBRID SCORE
    // --------------------------------

    // combine the three scores into a hybrid score
    const hybridScore =
      calculateHybridScore(
        contentScore,
        personalizedScore,
        collaborativeScore
      )


    // add candidate
    recommendations.push({
      anime: anime,
      hybridScore: hybridScore
    })
  }


  // sort highest hybrid score first
  recommendations.sort(
    (a, b) =>
      b.hybridScore -
      a.hybridScore
  )


  // return top 5
  return recommendations
    .slice(0, 5)
    .map(
      recommendation =>
        recommendation.anime
    )
}