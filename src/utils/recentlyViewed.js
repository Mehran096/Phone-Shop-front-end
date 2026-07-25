const RECENT_KEY = 'recentlyViewed'
const MAX_ITEMS = 8

export const addToRecentlyViewed = (product) => {
  let recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || []

  // Use slug to check duplicates
  recent = recent.filter(item => item.slug!== product.slug)

  recent.unshift({
    _id: product._id, // keep _id for Product component
    slug: product.slug, 
    name: product.name,
    image: product.image || '/images/placeholder-phone.jpg',
    price: product.price,
    originalPrice: product.originalPrice,
    bestDiscount: product.bestDiscount,
    endDate: product.endDate, // for countdown
    youSave: product.youSave, // for "You save" text
  })

  recent = recent.slice(0, MAX_ITEMS)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

export const getRecentlyViewed = () => {
  return JSON.parse(localStorage.getItem(RECENT_KEY)) || []
}

export const clearRecentlyViewed = () => {
  localStorage.removeItem(RECENT_KEY)
}