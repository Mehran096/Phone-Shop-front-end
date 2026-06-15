import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { addToWishlist, removeFromWishlist, getWishlist } from '../slices/wishlistSlice'

const WishlistButton = ({ product }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { userInfo } = useSelector((state) => state.auth)
  const { wishlistItems } = useSelector((state) => state.wishlist)

  // Load wishlist when user logs in
  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo])

  const isWishlisted = wishlistItems.some((item) => item._id === product._id)

  const wishlistHandler = () => {
    if (!userInfo) {
      navigate('/login')
      return
    }
    
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id))
    } else {
      dispatch(addToWishlist(product._id))
    }
  }

  return (
    <button
    onClick={wishlistHandler}
    className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center"
    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
  >
    {isWishlisted ? (
      <FaHeart className="text-red-500" size={22} />
    ) : (
      <FaRegHeart className="text-gray-600" size={22} />
    )}
  </button>
  )
}

export default WishlistButton