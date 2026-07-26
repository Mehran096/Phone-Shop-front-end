import { Link } from 'react-router-dom'
import { getRecentlyViewed } from '../utils/recentlyViewed'
import { useState, useEffect } from 'react'
import Product from './Product'

const RecentlyViewed = () => {
  const [recent, setRecent] = useState([])

  useEffect(() => {
  let data = getRecentlyViewed();
  console.log('RAW DATA FROM STORAGE:', data)
  
  // NEW: DEDUPE BY FULL UNIQUE ID
  const seen = new Set();
  data = data.filter(p => {
    const uniqueId = `${p._id}-${p.storage}-${p.color}`;
    if (seen.has(uniqueId)) return false;
    seen.add(uniqueId);
    return true;
  });

  setRecent(data)
}, [])

  if (recent.length === 0) return null

  return (
    <div className="mt-12 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {recent.map((product) => {
        const uniqueKey = `${product._id}-${product.storage}-${product.color}`
        console.log('RENDERING WITH KEY:', uniqueKey)
        return <Product key={uniqueKey} product={product} />
      })}
      </div>
    </div>
  )
}

export default RecentlyViewed