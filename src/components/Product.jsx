import { Link } from 'react-router-dom'

const Product = ({ product }) => {
  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-gray-100'>
      <Link to={`/product/${product._id}`} className="block">
  <div className="h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gray-50 rounded">
    <img 
      src={product.image} 
      alt={product.name}
      className="h-full w-full object-contain object-center" 
    />
  </div>
</Link>
      
      <div className='p-3'>
         <Link to={`/product/${product._id}`}>
    <h3 className="font-semibold text-sm md:text-base truncate">
      {product.name}
    </h3>
  </Link>

        <div className='flex items-center mt-2'>
          <div className='flex text-yellow-400'>
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'fill-gray-300'}`} 
                viewBox='0 0 20 20'
              >
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
            ))}
          </div>
          <span className='text-sm text-gray-600 ml-2'>
            {product.numReviews} reviews
          </span>
        </div>

        <p className="text-lg font-bold mt-1">
          ${product.price}
        </p>
      </div>
    </div>
  )
}

export default Product