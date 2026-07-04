import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'; 
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaTrash, FaHeart, FaShoppingCart, FaChevronDown} from 'react-icons/fa'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getWishlist, removeFromWishlist, updateWishlistQty } from '../slices/wishlistSlice'
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
    toast.success('Removed from wishlist')
  }

  const addToCartHandler = (item) => {
    dispatch(addToCart({
      product: item.product,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.price,
      color: item.color,
      storage: item.storage,
      countInStock: item.countInStock,
      qty: item.qty,
    }))
    dispatch(removeFromWishlist(item._id))
    toast.success('Added to cart')
  }

  const moveAllToCartHandler = () => {
    wishlistItems.forEach((item) => {
      dispatch(addToCart({
        product: item.product,
        slug: item.slug,
        name: item.name,
        image: item.image,
        price: item.price,
        color: item.color,
        storage: item.storage,
        countInStock: item.countInStock,
      qty: item.qty,
      }))
    })
    toast.success('All items moved to cart')
  }

  //qty drop down
  // V34.38 KEY: Reusable Dropdown - Works Mobile + Desktop
const CustomDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => ref.current &&!ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-16">
      <button
        type="button"
        disabled={options.length === 0}
        onClick={() => setOpen(!open)}
        className='flex items-center justify-between border rounded-lg gap-1 px-2 h-8 w-full border-gray-300 rounded-md bg-white shadow-sm font-medium text-xs text-gray-900'
      >
        <span>{value}</span>
        <FaChevronDown className={`text-gray-500 transition-transform text-[10px] ${open? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto 
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-2 py-1.5 text-xs font-medium text-gray-900 hover:bg-blue-50 ${Number(value) === Number(opt)? 'bg-blue-50 text-blue-600' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

  return (
    <>
     {/* seo start */}
           <Helmet>
                <title>Wishlist | Phone-Store</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
          {/* seo end*/}
   
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <FaHeart className="text-red-500" />
        My Wishlist
      </h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : wishlistItems.length === 0 ? (
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
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <p className="text-gray-600 text-sm sm:text-base">{wishlistItems.length} items saved</p>
            <button
              onClick={moveAllToCartHandler}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-green-700 font-semibold flex items-center gap-2 text-sm sm:text-base"
            >
              <FaShoppingCart /> Move All to Cart
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-4 hover:shadow-lg transition">
                <Link to={`/product/${item.slug}`}>
                  <div className="w-full aspect-square bg-gray-50 rounded-md sm:rounded-lg mb-2 sm:mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-1 sm:p-2"
                    />
                  </div>
                </Link>
                
                <Link to={`/product/${item.slug}`}>
                  <h3 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2 hover:text-blue-600 line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                  <span className="font-medium">Color:</span> {item.color}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">  
  <span className="font-medium">Storage:</span> {item.storage}
</p>
                
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
                  ${item.price}
                </p>

                {/* Add this qty selector */}
                {/* QTY ROW - V34.39 KEY */}
<div className="flex items-center gap-2 mb-2 sm:mb-4">
  <label className="text-xs sm:text-sm text-gray-600">Qty:</label>
  <CustomDropdown
    value={item.qty}
    onChange={(val) => dispatch(updateWishlistQty({ id: item._id, qty: Number(val) }))}
    options={Array.from({ length: Math.min(item.countInStock, 10) }, (_, i) => i + 1)}
  />
  <span className="text-xs text-gray-500">({item.countInStock} in stock)</span>
</div>
                
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={() => addToCartHandler(item)}
                    className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-md sm:rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold"
                  >
                    <FaShoppingCart className="text-xs sm:text-base" />
                    <span className="hidden xs:inline sm:inline">Add to Cart</span>
                    <span className="xs:hidden sm:hidden">Add</span>
                  </button>
                  <button
                    onClick={() => removeFromWishlistHandler(item._id)}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 border border-red-200 sm:border-2 text-red-500 rounded-md sm:rounded-lg hover:bg-red-50 hover:border-red-300 transition"
                    title="Remove"
                  >
                    <FaTrash className="text-xs sm:text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>

 </>
  )
}

export default WishlistScreen