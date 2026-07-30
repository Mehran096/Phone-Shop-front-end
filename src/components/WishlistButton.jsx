import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { addToWishlist, removeFromWishlist, getWishlist } from '../slices/wishlistSlice'
import { toast } from 'react-toastify'

// V25.3 KEY: selectedStorage MUST come from ProductScreen
const WishlistButton = ({ 
  product, 
  selectedColor, // {name: "Black", images: []}
  selectedStorage, // {name: "256GB", price: 999, countInStock: 4} V25.3 KEY
  selectedPrice, 
  selectedImage, 
  countInStock,
  className,
  showText = false,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false); 
  
  const { userInfo } = useSelector((state) => state.auth)
  const { wishlistItems } = useSelector((state) => state.wishlist)
  
  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo])

  // V25.3 KEY: Normalize to strings for DB comparison
  const colorName = selectedColor?.name || selectedColor
 const storageName = selectedStorage?.storage || selectedStorage?.name || selectedStorage; // V27.6 KEY
 const productIdStr = product._id?.toString()

  // V25.3 KEY: Check product + storage + color combo for toggle
  const isWishlisted = wishlistItems.some(
    (item) => 
      item.product?.toString() === productIdStr && 
      item.storage === storageName && 
      item.color === colorName
  )

  // V25.3 KEY: Get exact item for removal
  const wishlistItem = wishlistItems.find(
    (item) => 
      item.product?.toString() === productIdStr && 
      item.storage === storageName && 
      item.color === colorName
  )

  // V25.3 KEY: Read from nested variants[storage].colors[] not flat colors[]
  const variantToSend = product?.variants?.find(
    v => v.storage === storageName
  )
 
  const colorToSend = colorName || product?.variants?.[0]?.colors?.[0]?.name || ''
const storageToSend = variantToSend?.storage || storageName || product?.variants?.[0]?.storage || ''
const priceToSend = selectedPrice?? variantToSend?.colors?.find(c => c.name === colorToSend)?.finalPrice?? product?.variants?.[0]?.colors?.[0]?.finalPrice?? 0
const imageToSend = selectedImage || variantToSend?.colors?.find(c => c.name === colorToSend)?.images?.[0]?.url || product?.images?.[0]?.url || ''
const stockToSend = countInStock?? variantToSend?.colors?.find(c => c.name === colorToSend)?.countInStock?? 0
const originalPriceToSend = variantToSend?.colors?.find((c) => c.name === colorToSend)?.originalPrice || 0;

const discountAmountToSend = variantToSend?.colors?.find((c) => c.name === colorToSend)?.discountAmount || 0;


  const wishlistHandler = async () => {  
  // console.log('V32.32 DEBUG:', {colorToSend, storageToSend, priceToSend})
  
  if (!userInfo) {
    navigate('/login')
    return
  }

  if (isLoading) return // prevent spam clicks
  setIsLoading(true)

  // V25.3 KEY: Guard all 3 required fields
  if (!colorToSend || !storageToSend || !priceToSend) {
    toast.error('Please select color + storage first')
    setIsLoading(false)
    return
  }

  try {
    if (isWishlisted) {
      // V25.3 KEY: Send storage too so backend deletes exact variant
      if (wishlistItem?._id) {
        await dispatch(removeFromWishlist(wishlistItem._id)).unwrap() // <-- ADD await + unwrap
        toast.success('Removed from Wishlist')
      } else {
        toast.error('Wishlist item not found. Refresh page.')
      }
    } else {
      await dispatch(addToWishlist({ // <-- ADD await + unwrap
        product: product._id,
        slug: product.slug,
        name: product.name,
        image: imageToSend,
        price: priceToSend,
        originalPrice: originalPriceToSend,
        discountAmount: discountAmountToSend,
        storage: storageToSend, // "256GB"
        color: colorToSend, // "Black"
        countInStock: stockToSend,
        qty: 1,
      })).unwrap()
      toast.success('Added to Wishlist')
    }
  } catch (err) {
    toast.error(err || 'Something went wrong')
  } finally {
    setIsLoading(false) // <-- ALWAYS STOP LOADING
  }
}

 return (
  <button
    type='button'
    onClick={wishlistHandler}
    disabled={isLoading}  
    className={
      className ||
      `w-full h-12 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}` // <-- 2. OPACITY WHEN LOADING
    }
    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
  >
    {isLoading ? (  
      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : isWishlisted ? (
      <>
        <FaHeart className="text-red-500 text-xl" />
        {showText && <span>Remove from Wishlist</span>}
      </>
    ) : (
      <>
        <FaRegHeart className="text-gray-700 text-xl" />
        {showText && <span>Add to Wishlist</span>}
      </>
    )}
  </button>
)
}

export default WishlistButton