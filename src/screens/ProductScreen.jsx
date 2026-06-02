import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  useGetProductDetailsQuery,
  useCreateProductReviewMutation,
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
    if (product.colors?.length > 0 &&!selectedColor) {
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

  const submitReviewHandler = async (e) => {
    e.preventDefault()
    try {
      await createProductReview({
        productId,
        rating,
        comment,
      }).unwrap()
      refetch()
      toast.success('Review submitted')
      setRating(0)
      setComment('')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  if (isLoading) return <Loader />
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>

  const currentStock = selectedColor?.countInStock?? product.countInStock?? 0
  const currentPrice = selectedColor?.price?? product.price?? 0

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
                    className={`flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg border-2 p-1 transition-all ${
                      mainImage === img? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-400'
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
              <Rating value={product.rating || 0} text={`${product.numReviews || 0} reviews`} />
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

              {product.specs && Object.values(product.specs).some(v => v)? (
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
                      className={`relative w-14 h-14 rounded-full border-3 transition-all duration-200 ${
                        selectedColor?.name === color.name
                      ? 'border-blue-600 ring-4 ring-blue-100 scale-110'
                          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <FaCheck className='text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg drop-shadow-md' />
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
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                currentStock > 0? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${currentStock > 0? 'bg-green-500' : 'bg-red-500'}`}></span>
                {currentStock > 0? `In Stock (${currentStock})` : 'Out of Stock'}
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
      <div className='mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Reviews List */}
        <div>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>Customer Reviews</h2>
          {Array.isArray(product.reviews) && product.reviews.length > 0? (
            <div className='space-y-4'>
              {product.reviews.map((review) => (
                <div key={review._id} className='border border-gray-200 rounded-xl p-5 bg-white shadow-sm'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600'>
                        {review.name[0].toUpperCase()}
                      </div>
                      <div>
                        <strong className='text-gray-900'>{review.name}</strong>
                        <Rating value={review.rating} />
                      </div>
                    </div>
                    <p className='text-xs text-gray-500'>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className='text-gray-700'>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <Message>No reviews yet. Be the first!</Message>
          )}
        </div>

        {/* Write Review */}
        <div>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>Write a Review</h2>
          {loadingProductReview && <Loader />}
          {userInfo? (
            <form onSubmit={submitReviewHandler} className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
              <div className='mb-5'>
                <label className='block mb-2 font-semibold text-gray-900'>Rating</label>
                <select
                  required
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                >
                  <option value=''>Select rating...</option>
                  <option value='1'>1 - Poor</option>
                  <option value='2'>2 - Fair</option>
                  <option value='3'>3 - Good</option>
                  <option value='4'>4 - Very Good</option>
                  <option value='5'>5 - Excellent</option>
                </select>
              </div>
              <div className='mb-5'>
                <label className='block mb-2 font-semibold text-gray-900'>Comment</label>
                <textarea
                  required
                  rows='4'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                  placeholder='Share your experience...'
                ></textarea>
              </div>
              <button
                disabled={loadingProductReview}
                type='submit'
                className='w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors'
              >
                Submit Review
              </button>
            </form>
          ) : (
            <Message>
              Please <Link to='/login' className='text-blue-600 font-semibold'>sign in</Link> to write a review
            </Message>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductScreen