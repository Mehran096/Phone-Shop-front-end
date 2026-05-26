import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, data } from 'react-router-dom';
import { getProductDetails, createProductReview, resetReview } from '../slices/productSlice'
import Rating from '../components/Rating'
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useGetProductDetailsQuery } from '../slices/productsApiSlice'
import ProductSpecs from '../components/ProductSpecs'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

function ProductScreen() {
    const [qty, setQty] = useState(1);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isEditing, setIsEditing] = useState(false) // NEW
  const { data: producted } = useGetProductDetailsQuery(id)

    const { product, loading, error, successReview, reviewError } = useSelector((state) => state.products);
    const { userInfo } = useSelector((state) => state.auth)
const [selectedImage, setSelectedImage] = useState(0)


    useEffect(() => {
    if (successReview) {
      alert('Review submitted successfully')
      setRating(0)
      setComment('')
      setIsEditing(false)
      dispatch(resetReview())
      dispatch(getProductDetails(id)) // reload product to show new review + rating
    }
    dispatch(getProductDetails(id))
  }, [dispatch, id, successReview])

  //edit reviews
  const handleEditClick = () => {
    setRating(userAlreadyReviewed.rating)
    setComment(userAlreadyReviewed.comment)
    setIsEditing(true)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

//creating reviews
  const submitReviewHandler = (e) => {
    e.preventDefault()
    if (!rating) {
      alert('Please select a rating')
      return
    }
    dispatch(createProductReview({ id, rating: Number(rating), comment }))
  }

    // Reset selected image when product loads
  useEffect(() => {
    setSelectedImage(0)
  }, [product])

    const addToCartHandler = () => {
  if (!userInfo) {
    toast.warn(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <span>Please register/login to add items to cart</span>
          <button
            onClick={() => {
              closeToast()
              navigate('/register')
            }}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Go to Register/Login
          </button>
        </div>
      ),
      {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: false,
        draggable: true,
      }
    )
    return
  }
  
  dispatch(addToCart({ ...product, qty }))
  
  toast.success(
    ({ closeToast }) => (
      <div className="flex flex-col gap-2">
        <span>{product.name} added to cart</span>
        <button
          onClick={() => {
            closeToast()
            navigate('/cart')
          }}
          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          Go to Cart
        </button>
      </div>
    ),
    {
      position: "bottom-right",
      autoClose: 4000,
      closeOnClick: false,
    }
  )
}

    //     useEffect(() => {
    //      if (!userInfo) {
    //     navigate('/login?redirect=/placeorder')
    //   }

    //   }, [userInfo, navigate])

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!product || !product.name) return <div className="p-8 text-center">Loading...</div>;
     // Use images array. Fallback to single image field for old products
  const images = product.images?.length > 0? product.images : [product.image].filter(Boolean)

  // Check if current user already reviewed
  const userAlreadyReviewed = userInfo 
    ? product.reviews.find(r => r.user.toString() === userInfo._id.toString())
    : null


const getCloudinaryUrl = (url, width = 800) => {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`)
}


    //return
    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Image Gallery */}
         {/* Image Gallery */}
        <div>
          
          {/* Main Image with Zoom */}
          <div className="border rounded-lg overflow-hidden mb-4 bg-white">
            {images[selectedImage] ? (
              <Zoom>
                <img
                  src={getCloudinaryUrl(images[selectedImage], 1200)}
                  alt={product.name}
                  className="w-full h-96 object-contain cursor-zoom-in"
                />
              </Zoom>
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-100 text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                img && (
                  <img
                    key={idx}
                    src={getCloudinaryUrl(img, 200)}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 object-cover border-2 rounded cursor-pointer ${
                      selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                    }`}
                    alt={`${product.name} ${idx + 1}`}
                  />
                )
              ))}
            </div>
          )}
          
       
        </div>
                <div>
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                     <ProductSpecs product={producted} isAdmin={userInfo?.isAdmin} />
                    <p className="text-gray-600 mb-2">{product.brand}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
                    <p className="mb-4">{product.description}</p>
                    <div className="mb-4">
                        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Stock:</span> {product.countInStock}
                    </div>
                    {/* selector */}
                    {product.countInStock > 0 && (
                        <div className="flex items-center mb-4">
                            <span className="mr-2">Qty:</span>
                            <select
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                className="border rounded px-2 py-1"
                            >
                                {[...Array(product.countInStock).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                        {x + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* selector */}
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        onClick={addToCartHandler}
                        disabled={product.countInStock === 0}
                    >
                        {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div> 

        {/* Reviews Section */}
      <div className="border-t pt-8 m-4">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

        {reviewError && <p className="text-red-500 mb-4">{reviewError}</p>}
        {product.reviews.length === 0 && <p className="mb-6">No reviews yet</p>}

        <div className="space-y-4 mb-8">
          {product.reviews.map(review => (
            <div key={review._id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <strong>{review.name}</strong>
                  <Rating value={review.rating} />
                  <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                {/* Show Edit button only for current user's review */}
                {userInfo && review.user.toString() === userInfo._id.toString() && !isEditing && (
                  <button 
                    onClick={handleEditClick}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Want to Edit your reviews
                  </button>
                )}
              </div>
              <p className="mt-2">{review.comment}</p>
            </div>
          
          ))}
          </div>
      </div>

       
        

        

        {/* Review Form - show if not reviewed OR if editing */}
        {userInfo && (!userAlreadyReviewed || isEditing) && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <form onSubmit={submitReviewHandler} className="space-y-4">
              <div>
                <label className="block mb-1">Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)} 
                  className="border rounded px-3 py-2 w-full"
                  required
                >
                  <option value="">Select...</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {isEditing ? 'Update Review' : 'Submit Review'}
                </button>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

       {/* Message if user already reviewed and not editing */}
        {userInfo && userAlreadyReviewed && !isEditing && (
          <div className="bg-green-50 border-green-200 text-green-700 p-4 rounded-lg">
            You’ve already reviewed this product. Use the Edit button on your review to update it.
          </div>
        )}

         {/* Message if not logged in */}
        {!userInfo && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <p>Please <a href="/login" className="text-blue-600 underline">sign in</a> to write a review</p>
          </div>
        )}
      </div>
    
    
        
    );
}

export default ProductScreen;