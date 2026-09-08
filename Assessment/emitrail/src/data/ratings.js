// Get all saved ratings from localStorage
export const getRatings = () => {
  const ratings = localStorage.getItem('emitrailRatings')

  return ratings ? JSON.parse(ratings) : []
}

// Save a rating or update the user's previous rating
export const saveRating = (rating) => {
  const ratings = getRatings()

  const existingRating = ratings.findIndex((item) => item.userId === rating.userId)

  if (existingRating !== -1) {
    ratings[existingRating] = rating
  } else {
    ratings.push(rating)
  }

  localStorage.setItem('emitrailRatings', JSON.stringify(ratings))
}

// Calculate the average rating
export const getAverageRating = () => {
  const ratings = getRatings()

  if (ratings.length === 0) {
    return 0
  }

  const total = ratings.reduce((sum, rating) => sum + rating.score, 0)

  return (total / ratings.length).toFixed(1)
}
