import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaTrash, FaHeart, FaShoppingCart } from 'react-icons/fa'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getWishlist, removeFromWishlist } from '../slices/wishlistSlice'
import { addToCart } from '../slices/cartSlice'
import { toast } from 'react-toastify'


const WishlistScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo } = useSelector((state) => state.auth)
  const { wishlistItems, loading, error } = useSelector((state) => state.wishlist)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo, navigate])

  const removeFromWishlistHandler = (id) => {
    dispatch(removeFromWishlist(id))
  }

 const addToCartHandler = (product) => {
  dispatch(addToCart({
    product: product._id, // Cart uses 'product' not '_id'
    name: product.name,
    image: product.image || product.images?.[0] || product.colors?.[0]?.images?.[0],
    price: product.price,
    countInStock: product.countInStock,
    color: product.colors?.[0]?.color || 'Default', // add default color
    qty: 1,
  }))
}
const moveAllToCartHandler = () => {
  wishlistItems.forEach(item => dispatch(addToCart({
    product: item._id,
    name: item.name,
    image: item.image || item.images?.[0] || item.colors?.[0]?.images?.[0],
    price: item.price,
    countInStock: item.countInStock,
    color: item.colors?.[0]?.color || 'Default',
    qty: 1,
  })))
}

  return (
  <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
      <FaHeart className="text-red-500" />
      My Wishlist
    </h1>

    {wishlistItems.length > 0 && (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <p className="text-gray-600 text-sm sm:text-base">{wishlistItems.length} items saved</p>
        <button
          onClick={moveAllToCartHandler}
          className='bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-700 font-semibold flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center'
        >
          <FaShoppingCart /> Move All to Cart
        </button>
      </div>
    )}

    {loading? (
      <Loader />
    ) : error? (
      <Message variant="danger">{error}</Message>
    ) : wishlistItems.length === 0? (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
    <FaHeart className="text-gray-200 text-6xl sm:text-8xl mb-6" />
    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
      Your wishlist is empty
    </h2>
    <p className="text-gray-500 mb-6 max-w-md">
      Save your favorite items here. Tap the heart icon on any product to add it to your wishlist.
    </p>
    <Link 
      to="/" 
      className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 font-semibold inline-flex items-center gap-2"
    >
      <FaShoppingCart /> Start Shopping
    </Link>
  </div>
    ) : (
      // Changed: 2 cols on mobile, tighter gap
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {wishlistItems.map((product) => (
          <div key={product._id} className="border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 hover:shadow-lg transition bg-white">
            <Link to={`/product/${product._id}`}>
              <div className="w-full aspect-square bg-gray-50 rounded-md sm:rounded-lg mb-2 sm:mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    product.image ||
                    product.images?.[0] ||
                    product.colors?.[0]?.images?.[0] ||
                    '/images/sample.jpg'
                  }
                  alt={product.name}
                  className="w-full h-full object-contain p-1 sm:p-2"
                />
              </div>
            </Link>

            <Link to={`/product/${product._id}`}>
              <h3 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2 hover:text-blue-600 line-clamp-2 min-h-[2rem] sm:min-h-[3rem]">
                {product.name}
              </h3>
            </Link>

            <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
              ${product.price}
            </p>

            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => addToCartHandler(product)}
                disabled={product.countInStock === 0}
                className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold"
              >
                <FaShoppingCart className="text-xs sm:text-base" />
                <span className="hidden xs:inline sm:inline">Add to Cart</span>
                <span className="xs:hidden sm:hidden">Add</span>
              </button>

              <button
                onClick={() => removeFromWishlistHandler(product._id)}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border border-red-200 sm:border-2 text-red-500 rounded-md sm:rounded-lg hover:bg-red-50"
              >
                <FaTrash className="text-xs sm:text-base" />
              </button>
            </div>

            {product.countInStock === 0 && (
              <p className="text-red-500 text-xs sm:text-sm mt-1 sm:mt-2 text-center">Out of Stock</p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)
}

export default WishlistScreen