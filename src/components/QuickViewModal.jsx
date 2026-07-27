import { useState } from 'react'
import { FaTimes, FaShoppingCart } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import WishlistButton from './WishlistButton' // <-- IMPORT THIS

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null

  const firstVariant = product.variants?.[0]
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <img 
                src={firstImage} 
                alt={product.name} 
                className="w-full h-80 object-contain bg-gray-50 rounded-xl" 
              />
            </div>

            {/* Info */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
              
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold">${discountPrice.toFixed(2)}</span>
                  {isDiscountActive && (
                    <span className="text-lg line-through text-gray-400">${firstPrice}</span>
                  )}
                  {isDiscountActive && (
                    <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">-{discount.value}%</span>
                  )}
                </div>
                {isDiscountActive && (
                  <p className="text-green-600 text-sm mt-1 font-semibold">You save ${youSave.toFixed(2)}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{product.rating?.toFixed(1) || 0}</span>
                <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => { 
                    onAddToCart(product._id); 
                    onClose() 
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition"
                >
                  <FaShoppingCart /> Add to Cart
                </button>

                {/* USE YOUR EXISTING WISHLIST BUTTON */}
                <div className="w-12 h-12 flex-shrink-0">
                  <WishlistButton
                    product={product}
                    selectedColor={firstColor?.name}
                    selectedStorage={firstVariant?.storage}
                    selectedPrice={firstPrice}
                    selectedImage={firstImage}
                    countInStock={firstVariant?.countInStock}
                    className="w-12 h-12 flex items-center justify-center border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition"
                    showText={false}
                  />
                </div>
              </div>

              <Link 
                to={`/product/${product.slug}`} 
                className="text-blue-600 hover:underline font-semibold"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal