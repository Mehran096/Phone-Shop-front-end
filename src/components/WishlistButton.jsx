import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { addToWishlist, removeFromWishlist, getWishlist } from '../slices/wishlistSlice'
import { toast } from 'react-toastify'

const WishlistButton = ({ product, selectedColor, selectedPrice, selectedImage, countInStock }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo } = useSelector((state) => state.auth)
  const { wishlistItems } = useSelector((state) => state.wishlist)

  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo])

  // FIX: Convert color object to string for DB comparison
  const colorName = selectedColor?.name || selectedColor

  // Check product + color combo only
  const isWishlisted = wishlistItems.some(
    (item) => item.product === product._id && item.color === colorName
  )

  // Get wishlist item _id for removal
  const wishlistItem = wishlistItems.find(
    (item) => item.product === product._id && item.color === colorName
  )

  const wishlistHandler = () => {
    // FIX: Check if NOT logged in
    if (!userInfo) {
      navigate('/login')
      return
    }

    const selectedColorObj = product?.colors?.find(c => c.name === (colorName || selectedColor))
    // DEFINE THESE FIRST - before any if statements that use them
    const colorToSend = colorName || selectedColor || product?.colors?.[0]?.name
    const hexCodeToSend = selectedColorObj?.hexCode || product?.colors?.[0]?.hexCode || '#000000'
    const priceToSend = selectedPrice || product?.price
    const imageToSend = selectedImage || product?.image
    const stockToSend = countInStock || product?.countInStock || 0 // <-- Added for qty fix

    // NOW check if color exists
    if (!colorToSend) {
      toast.error('Please select a color first')
      return
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(wishlistItem._id))
      toast.success('Removed from wishlist')
    } else {
      //console.log('Sending to Redux:', { hexCode: hexCodeToSend })
      dispatch(addToWishlist({
        product: product._id,
        name: product.name,
        color: colorToSend,
        hexCode: hexCodeToSend,
        image: imageToSend,
        price: priceToSend,
        countInStock: stockToSend, // <-- Added for qty fix
        qty: 1
      }))
      toast.success('Added to wishlist')
    }
  }

  return (
    <button
      onClick={wishlistHandler}
      className={`px-4 py-3 w-full h-full border-2 rounded-xl hover:bg-gray-50 flex items-center justify-center transition ${
        isWishlisted
         ? 'bg-red-50 border-red-500 text-red-500'
          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
      }`}
      title={isWishlisted? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {isWishlisted? (
        <FaHeart className="text-red-500" size={22} />
      ) : (
        <FaRegHeart className="text-gray-600" size={22} />
      )}
    </button>
  )
}

export default WishlistButton