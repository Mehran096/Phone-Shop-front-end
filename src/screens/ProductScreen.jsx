import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  useGetProductDetailsQuery,
  useCreateProductReviewMutation,
  useUpdateReviewMutation
} from '../slices/productsApiSlice'
import { addToCart } from '../slices/cartSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Rating from '../components/Rating'
import { FaEdit, FaCheck, FaShoppingCart } from 'react-icons/fa'
import { toast } from 'react-toastify'

const ProductScreen = () => {
  const { id: productId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { userInfo } = useSelector((state) => state.auth)
  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId)
  const [createProductReview, { isLoading: loadingProductReview }] = useCreateProductReviewMutation()

  const [selectedColor, setSelectedColor] = useState(null)
  const [mainImage, setMainImage] = useState('/images/placeholder-phone.jpg') // Default to placeholder
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  //edit review start
  const [isEditing, setIsEditing] = useState(false);
const [updateProductReview, { isLoading: loadingUpdateReview }] = useUpdateReviewMutation();

// Get user's existing review for this color
const userReview = product?.reviews?.find(
  (r) => r.user === userInfo?._id && r.color === selectedColor?.name
);

useEffect(() => {
  if (userReview && isEditing) {
    setRating(userReview.rating);
    setComment(userReview.comment);
  }
}, [userReview, isEditing]);


//edit review end
  useEffect(() => {
    if (product) {
      if (product.colors?.length > 0) {
        const firstColor = product.colors[0]
        setSelectedColor(firstColor)
        setMainImage(firstColor.images?.[0] || product.image || '/images/placeholder-phone.jpg')
      } else {
        setMainImage(product.image || '/images/placeholder-phone.jpg')
      }
    }
  }, [product])

  const selectColorHandler = (color) => {
    setSelectedColor(color)
    setMainImage(color.images?.[0] || product.image || '/images/placeholder-phone.jpg')
    setQty(1)
  }

  const addToCartHandler = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return
    }

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: mainImage,
      price: selectedColor?.price || product.price,
      color: selectedColor?.name || '',
      hexCode: selectedColor?.hexCode || '',
      countInStock: selectedColor?.countInStock || product.countInStock,
      qty,
    }))
    navigate('/cart')
  }

  // Filter reviews by selected color
  const filteredReviews = useMemo(() => {
    if (!product?.reviews || !selectedColor) return product?.reviews || []
    return product.reviews.filter((r) => r.color === selectedColor.name)
  }, [product?.reviews, selectedColor])

  // Calculate rating for selected color
  const colorRating = useMemo(() => {
    if (!selectedColor || filteredReviews.length === 0) return 0
    return filteredReviews.reduce((acc, item) => acc + item.rating, 0) / filteredReviews.length
  }, [filteredReviews, selectedColor])

  // Use color rating if colors exist, else use overall rating
  const displayRating = product?.colors?.length > 0 ? colorRating : product?.rating || 0
  const displayNumReviews = product?.colors?.length > 0 ? filteredReviews.length : product?.numReviews || 0

  const submitReviewHandler = async (e) => {
  e.preventDefault();

  if (product?.colors?.length > 0 && !selectedColor) {
    toast.error('Please select a color to review');
    return;
  }

  if (!rating) {
    toast.error('Please select a rating');
    return;
  }

  try {
    if (isEditing && userReview) {
      // UPDATE existing review
      await updateProductReview({
        productId,
        rating,
        comment,
        color: selectedColor?.name,
      }).unwrap();
      toast.success('Review updated successfully');
      setIsEditing(false);
    } else {
      // CREATE new review
      await createProductReview({
        productId,
        rating,
        comment,
        color: selectedColor?.name,
      }).unwrap();
      toast.success('Review submitted successfully');
    }
    
    setRating(0);
    setComment('');
    refetch();
  } catch (err) {
    toast.error(err?.data?.message || err.error);
  }
};

  if (isLoading) return <Loader />
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>

  const currentStock = selectedColor?.countInStock ?? product.countInStock ?? 0
  const currentPrice = selectedColor?.price ?? product.price ?? 0

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <Link to='/' className='text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium'>
        ← Go Back
      </Link>

      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8'>
          {/* Left: Images */}
          <div>
            <div className='bg-gray-50 rounded-xl overflow-hidden mb-4 aspect-square flex items-center justify-center'>
              {mainImage && (
                <img
                  src={mainImage}
                  alt={product.name}
                  className='w-full h-full object-contain p-4'
                  onError={(e) => { e.target.src = '/images/placeholder-phone.jpg' }}
                />
              )}
            </div>

            {/* Image Thumbnails */}
            {selectedColor?.images?.length > 1 && (
              <div className='flex gap-3 overflow-x-auto pb-2'>
                {selectedColor.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg border-2 p-1 transition-all ${mainImage === img ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className='w-full h-full object-contain'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className='flex flex-col'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>{product.name}</h1>

            <div className='flex items-center gap-3 mb-6'>
              {/* <Rating value={product.rating || 0} text={`${product.numReviews || 0} reviews`} /> */}
              <Rating value={displayRating} text={`${displayNumReviews} reviews`} />
            </div>

            {/* Specifications Box - matches your screenshot */}
            <div className='mb-6 bg-gray-50 rounded-xl p-5 border border-gray-100'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>Specifications</h3>
                {userInfo?.isAdmin && (
                  <Link
                    to={`/admin/product/${product._id}/edit`}
                    className='bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 font-medium'
                  >
                    <FaEdit className='text-xs' /> Edit
                  </Link>
                )}
              </div>

              {product.specs && Object.values(product.specs).some(v => v) ? (
                <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                  {product.specs.storage && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Storage</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{product.specs.storage}</div>
                    </div>
                  )}
                  {product.specs.ram && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>RAM</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{product.specs.ram}</div>
                    </div>
                  )}
                  {product.specs.display && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Display</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{product.specs.display}</div>
                    </div>
                  )}
                  {product.specs.battery && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Battery</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{product.specs.battery}</div>
                    </div>
                  )}
                  {product.specs.camera && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Camera</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{product.specs.camera}</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-gray-500 text-sm'>No specifications added</p>
              )}
            </div>

            {/* Color Selection */}
            {product.colors?.length > 1 && (
              <div className='mb-6'>
                <h3 className='font-semibold mb-3 text-gray-900'>
                  Color: <span className='text-blue-600'>{selectedColor?.name}</span>
                </h3>
                <div className='flex flex-wrap gap-3'>
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectColorHandler(color)}
                      className={`relative w-14 h-14 rounded-full border-2 transition-all duration-200 ${selectedColor?.name === color.name
                          ? 'border-blue-600 ring-4 ring-blue-100 scale-110'
                          : color.name.toLowerCase() === 'white'
                            ? 'border-gray-400 hover:border-gray-500 hover:scale-105'
                            : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <FaCheck className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg drop-shadow ${color.name.toLowerCase() === 'white' ? 'text-gray-800' : 'text-white'
                          }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className='text-sm text-gray-500 mb-2 font-medium'>{product.brand}</div>

            <div className='text-5xl font-bold text-blue-600 mb-4'>
              ${currentPrice}
            </div>

            {/* Stock Status */}
            <div className='mb-6'>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${currentStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                <span className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
              </span>
            </div>

            {/* Qty + Add to Cart */}
            {currentStock > 0 && (
              <div className='flex gap-3 mb-6'>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className='px-4 py-3 border-2 border-gray-200 rounded-xl bg-white font-semibold focus:border-blue-600 focus:outline-none'
                >
                  {[...Array(Math.min(currentStock, 10)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      Qty: {x + 1}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addToCartHandler}
                  className='flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200'
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            )}

            {/* Description */}
            <div className='pt-6 border-t border-gray-100'>
              <h3 className='font-semibold mb-2 text-gray-900'>Description</h3>
              <p className='text-gray-600 leading-relaxed'>{product.description}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Reviews Section */}
<div className='mt-10'>
  <h2 className='text-2xl font-bold mb-4'>
    Customer Reviews {selectedColor && `for ${selectedColor.name}`}
  </h2>

  {filteredReviews.length === 0 && (
    <Message>No Reviews for {selectedColor?.name || 'this product'}</Message>
  )}

  <div className='mb-8'>
    {filteredReviews.map((review) => (
      <div key={review._id} className='bg-gray-50 p-4 rounded-lg mb-4'>
        <div className='flex justify-between items-start mb-2'>
          <div>
            <strong>{review.name}</strong>
            <span className='text-sm text-gray-500 ml-2'>
              | {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          {userInfo?._id === review.user && review.color === selectedColor?.name && (
            <button
              onClick={() => setIsEditing(true)}
              className='text-blue-600 text-sm hover:underline font-medium'
            >
              Edit
            </button>
          )}
        </div>
        <Rating value={review.rating} />
        <p className='mt-2 text-gray-700'>{review.comment}</p>
      </div>
    ))}
  </div>

  {/* CREATE REVIEW FORM */}
  {userInfo && !userReview && !isEditing && (
    <div className='bg-white p-6 rounded-lg shadow'>
      <h3 className='text-xl font-semibold mb-4'>Write a Customer Review</h3>
      
      <form onSubmit={submitReviewHandler}>
        {selectedColor && (
          <div className='bg-blue-50 p-3 rounded-lg mb-4'>
            <p className='text-sm text-blue-800'>
              You are reviewing: <strong>{selectedColor.name}</strong>
            </p>
          </div>
        )}

        {!selectedColor && product?.colors?.length > 0 && (
          <Message variant='danger'>Please select a color first</Message>
        )}

        <div className='mb-4'>
          <label className='block mb-2 font-medium'>Rating</label>
          <select
            className='w-full p-2 border rounded'
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          >
            <option value=''>Select...</option>
            <option value='1'>1 - Poor</option>
            <option value='2'>2 - Fair</option>
            <option value='3'>3 - Good</option>
            <option value='4'>4 - Very Good</option>
            <option value='5'>5 - Excellent</option>
          </select>
        </div>

        <div className='mb-4'>
          <label className='block mb-2 font-medium'>Comment</label>
          <textarea
            className='w-full p-2 border rounded'
            rows='4'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          disabled={loadingProductReview || !selectedColor}
          type='submit'
          className='bg-black text-white px-6 py-2 rounded disabled:bg-gray-400 hover:bg-gray-800'
        >
          {loadingProductReview ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )}

  {/* EDIT REVIEW FORM */}
  {userInfo && isEditing && (
    <div className='bg-white p-6 rounded-lg shadow border-2 border-blue-500'>
      <h3 className='text-xl font-semibold mb-4'>Edit Your Review</h3>
      
      <form onSubmit={submitReviewHandler}>
        <div className='bg-blue-50 p-3 rounded-lg mb-4'>
          <p className='text-sm text-blue-800'>
            Editing review for: <strong>{selectedColor.name}</strong>
          </p>
        </div>

        <div className='mb-4'>
          <label className='block mb-2 font-medium'>Rating</label>
          <select
            className='w-full p-2 border rounded'
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          >
            <option value=''>Select...</option>
            <option value='1'>1 - Poor</option>
            <option value='2'>2 - Fair</option>
            <option value='3'>3 - Good</option>
            <option value='4'>4 - Very Good</option>
            <option value='5'>5 - Excellent</option>
          </select>
        </div>

        <div className='mb-4'>
          <label className='block mb-2 font-medium'>Comment</label>
          <textarea
            className='w-full p-2 border rounded'
            rows='4'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        <div className='flex gap-3'>
          <button
            type='submit'
            disabled={loadingUpdateReview}
            className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {loadingUpdateReview ? 'Updating...' : 'Update Review'}
          </button>
          <button
            type='button'
            onClick={() => setIsEditing(false)}
            className='bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )}

  {/* ALREADY REVIEWED MESSAGE */}
  {userInfo && userReview && !isEditing && (
    <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
      <p className='text-sm text-green-800'>
        ✓ You've already reviewed {selectedColor?.name}. Click "Edit" on your review above to update it.
      </p>
    </div>
  )}

  {/* NOT LOGGED IN */}
  {!userInfo && (
    <Message>
      Please <Link to='/login' className='text-blue-600 underline'>sign in</Link> to write a review
    </Message>
  )}
</div>
    </div>
  )
}

export default ProductScreen