import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FaEye } from 'react-icons/fa'
import QuickViewModal from './QuickViewModal'

const RecommendedProducts = ({ data, loading, error, onAddToCart }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  if (loading) {
    return (
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Customers also viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 mt-8">Failed to load recommendations</p>
  }

  if (!data?.recommendations || data.recommendations.length === 0) {
    return null
  }

  const { recommendations, type, brand } = data

  // DYNAMIC TITLE LOGIC
  let title = "Customers also viewed"
  if (type === 'brand') title = `More from ${brand}`
  if (type === 'category') title = `Similar Products`
  if (type === 'popular') title = `Best Sellers`

  return (
    <>
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((item) => {
            const firstVariant = item.variants?.[0]
            const firstColor = firstVariant?.colors?.[0]
            const firstImage = firstColor?.images?.[0]?.url || '/images/placeholder-phone.jpg'
            const firstPrice = firstColor?.price || 0
            const discount = firstColor?.discount
            const isDiscountActive = discount?.isActive && discount?.value > 0
            
            const discountPrice = isDiscountActive
              ? discount.type === 'percentage' 
                ? firstPrice - (firstPrice * discount.value / 100)
                : firstPrice - discount.value
              : firstPrice
            
            const youSave = firstPrice - discountPrice

            return (
              <div key={item._id} className="group relative">
                <Link to={`/product/${item.slug}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-lg transition">
                    <div className="relative">
                      <img
                        src={firstImage}
                        alt={item.name}
                        className="w-full h-32 object-contain mb-3"
                      />
                      {isDiscountActive && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          -{discount.value}%
                        </span>
                      )}
                      
                      {/* QUICK VIEW BUTTON ON HOVER */}
                      <button
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setQuickViewProduct(item) 
                        }}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300"
                      >
                        <span className="bg-white text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                          <FaEye /> Quick View
                        </span>
                      </button>
                    </div>
                    <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">{item.brand}</p>
                    <div className="mt-1">
                      <span className="text-base font-bold">${discountPrice.toFixed(2)}</span>
                      {isDiscountActive && (
                        <span className="text-xs line-through text-gray-400 ml-2">${firstPrice}</span>
                      )}
                    </div>
                    {isDiscountActive && (
                      <p className="text-xs text-green-600">You save ${youSave.toFixed(2)}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      ★ {item.rating?.toFixed(1) || 0} ({item.numReviews})
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  )
}

export default RecommendedProducts