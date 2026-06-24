import { Link } from 'react-router-dom'
import { FaEdit, FaStar } from 'react-icons/fa'

const Product = ({ product, userInfo }) => {
  const mainImage = product.colors?.[0]?.images?.[0] || product.image || '/images/placeholder-phone.jpg'

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-gray-100 group relative'>
      {/* Admin Edit Button */}
      {userInfo && userInfo.isAdmin && (
        <Link
          to={`/admin/product/${product._id}/edit`}
          className='absolute top-2 right-2 z-10 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={(e) => e.stopPropagation()}
        >
          <FaEdit />
        </Link>
      )}

      <Link to={`/product/${product._id}`} className='block'>
        <div className='h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-50 rounded'>
          <img
            src={mainImage}
            alt={product.name}
            className='h-full w-full object-contain object-center group-hover:scale-105 transition-transform duration-300'
            onError={(e) => { e.target.src = '/images/placeholder-phone.jpg' }}
          />
        </div>
      </Link>

      <div className='p-3'>
        <Link to={`/product/${product._id}`}>
          <h3 className='font-semibold text-sm md:text-base truncate'>
            {product.name}
          </h3>
        </Link>

        {product.numReviews > 0 && product.rating > 0 && (
          <div className='flex items-center mt-2'>
            <div className='flex items-center'>
              {[...Array(5)].map((_, i) => {
                const fillPercent = Math.min(Math.max(product.rating - i, 0), 1) * 100
                return (
                  <div key={i} className='relative w-4 h-4'>
                    <FaStar className='w-4 h-4 text-gray-300 absolute' />
                    <div
                      className='absolute overflow-hidden'
                      style={{ width: `${fillPercent}%` }}
                    >
                      <FaStar className='w-4 h-4 text-amber-500' />
                    </div>
                  </div>
                )
              })}
            </div>
            <span className='text-sm text-blue-600 hover:text-orange-700 hover:underline ml-1 cursor-pointer'>
              ({product.numReviews})
            </span>
          </div>
        )}

        <div className='flex items-center justify-between mt-3'>
          <span className='text-xl font-bold text-blue-600'>
            ${product.colors[0].price}
          </span>
          {product.colors?.length > 1 && (
            <div className='flex gap-1'>
              {product.colors.slice(0, 3).map((color, idx) => (
                <div
                  key={idx}
                  className='w-4 h-4 rounded-full border border-gray-300'
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 3 && (
                <span className='text-xs text-gray-500'>
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Product