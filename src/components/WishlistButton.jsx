import { useEffect } from 'react'
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
  className
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  // const colorToSend = colorName
  // const storageToSend = variantToSend?.storage || storageName // "256GB"
  // const priceToSend = selectedPrice || variantToSend?.colors?.find(c => c.name === colorToSend)?.price
  // const imageToSend = selectedImage || variantToSend?.colors?.find(c => c.name === colorToSend)?.images?.[0]?.url
  // const stockToSend = countInStock || variantToSend?.colors?.find(c => c.name === colorToSend)?.countInStock || 0
  const colorToSend = colorName || product?.variants?.[0]?.colors?.[0]?.name || ''
const storageToSend = variantToSend?.storage || storageName || product?.variants?.[0]?.storage || ''
const priceToSend = selectedPrice?? variantToSend?.colors?.find(c => c.name === colorToSend)?.price?? product?.variants?.[0]?.colors?.[0]?.price?? 0
const imageToSend = selectedImage || variantToSend?.colors?.find(c => c.name === colorToSend)?.images?.[0]?.url || product?.images?.[0]?.url || ''
const stockToSend = countInStock?? variantToSend?.colors?.find(c => c.name === colorToSend)?.countInStock?? 0


  const wishlistHandler = () => {
  //  console.log('V32.32 DEBUG:', {colorToSend, storageToSend, priceToSend})
    if (!userInfo) {
      navigate('/login')
      return
    }

    // V25.3 KEY: Guard all 3 required fields
    if (!colorToSend ||!storageToSend ||!priceToSend) {
      toast.error('Please select color + storage first')
      return
    }

    if (isWishlisted) {
      // V25.3 KEY: Send storage too so backend deletes exact variant
       if (wishlistItem?._id) {
    dispatch(removeFromWishlist(wishlistItem._id))
    toast.success('removed from Wishlist') 
  } else {
    toast.error('Wishlist item not found. Refresh page.')
  }
    } else {
      dispatch(addToWishlist({
        product: product._id,
        slug: product.slug,
        name: product.name,
        image: imageToSend,
        price: priceToSend,
        storage: storageToSend, // "256GB"
        color: colorToSend, // "Black"
        countInStock: stockToSend,
        qty: 1,
      }))
      toast.success('Added to wishlist')
    }
  }

 return (
  <button
    type='button'
    onClick={wishlistHandler}
    className='w-full h-12 flex items-center border justify-center gap-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-400 transition'
    title={isWishlisted? 'Remove from Wishlist' : 'Add to Wishlist'}
  >
    {isWishlisted? (
      <>
        <FaHeart className="text-red-500 text-xl" />
        <span className="lg:hidden font-semibold text-gray-900 text-base">Remove from Wishlist</span>
      </>
    ) : (
      <>
        <FaRegHeart className="text-gray-700 text-xl" />
        <span className="lg:hidden font-semibold text-gray-900 text-base">Add to Wishlist</span>
      </>
    )}
  </button>
)
}

export default WishlistButton