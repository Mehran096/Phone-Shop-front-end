import { useState, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import RatingStars from '../components/RatingStars';
import ReviewsModal from '../components/ReviewsModal';
import OfflineMessage from '../components/OfflineMessage'

import { useSelector, useDispatch } from 'react-redux'
import { FaThumbsUp } from 'react-icons/fa';
import {
  useGetProductDetailsQuery,
  useGetProductBySlugQuery,
  useCreateProductReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
  useDeleteAdminReplyMutation,
  useUploadReviewImageMutation,
  useDeleteCloudinaryImageMutation
} from '../slices/productsApiSlice'
import { addToCart } from '../slices/cartSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Rating from '../components/Rating'
import { FaEdit, FaCheck, FaTrash, FaShoppingCart, FaStar } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Product360 from '../components/Product360';
import WishlistButton from '../components/WishlistButton'
import { ChevronDown } from 'lucide-react';



const ProductScreen = ({ isOnline }) => {
  const { slug } = useParams()
  const productId = slug
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { userInfo } = useSelector((state) => state.auth)
  const { data: product, isLoading, error, refetch } = useGetProductBySlugQuery(slug)
  const [createProductReview, { isLoading: loadingProductReview }] = useCreateProductReviewMutation()
  const [deleteProductReview, { isLoading: loadingDeleteReview }] = useDeleteReviewMutation();
  const [addAdminReply, { isLoading: loadingAdminReply }] = useAddAdminReplyMutation();
  const [editAdminReply, { isLoading: loadingUpdateReply }] = useEditAdminReplyMutation();
  const [deleteAdminReply, { isLoading: loadingDeleteReply }] = useDeleteAdminReplyMutation();
  const [markHelpful, { isLoading: loadingHelpfulReview }] = useMarkReviewHelpfulMutation();
  const [uploadReviewImage, { isLoading: loadingUpload }] = useUploadReviewImageMutation();
  const [deleteCloudinaryImage] = useDeleteCloudinaryImageMutation();




  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0); // V9.26 KEY: Default first variant
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // V9.26 KEY: Default first color


  const selectedVariant = useMemo( // V27.1 KEY
    () => product?.variants?.[selectedVariantIndex],
    [product, selectedVariantIndex]
  );

  const selectedColor = useMemo( // V27.1 KEY
    () => selectedVariant?.colors?.[selectedColorIndex],
    [selectedVariant, selectedColorIndex]
  );
  //console.log(selectedColor?.images)

  // const [selectedPrice, setSelectedPrice] = useState(0) // ADD THIS
  // const [selectedImage, setSelectedImage] = useState('') // ADD THIS
  const [mainImage, setMainImage] = useState('/images/placeholder-phone.jpg') // Default to placeholder
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0) // ADD THIS
  //const [headline, setHeadline] = useState('')      // ADD THIS
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [comment, setComment] = useState('')
  const [sortBy, setSortBy] = useState('helpful');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isEditingReply, setIsEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  //const [reviewImages, setReviewImages] = useState([]);
  // V33.58 KEY: V31 Object[] -> V33.57 File[] + Preview[]
  const [reviewImageFiles, setReviewImageFiles] = useState([]); // V33.58 KEY: For upload on Submit
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]); // V33.58 KEY: For UI only
  //const [reviewImageFiles, setReviewImageFiles] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  //product360
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)


  // Edit states

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editImages, setEditImages] = useState([]);
  //const [removedImageIds, setRemovedImageIds] = useState([]);

  const [editColor, setEditColor] = useState(null);

  // const startEdit = (review) => {
  //   setEditingReview(review);
  //   setEditComment(review.comment);
  //   setEditRating(review.rating);
  //   setEditImages(review.images || []);
  //   setEditColor(review.color || null);

  // };

  //review edit modal
  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditImages(review.images || []); // V33.35B KEY
    setEditColor(review.color || null);
    setIsEditModalOpen(true); // V33.93 KEY

  };


  const cancelEdit = () => {
    setEditingReview(null);
    setEditComment('');
    setEditRating(0);
    setEditImages([]);
    setIsEditModalOpen(false);
    //setEditImageFiles([]);
    //setRemovedImageIds([]);

  };

  const [updateProductReview, { isLoading: loadingUpdateReview }] = useUpdateReviewMutation();

  // useEffect(() => {
  //   if (product?.variants?.length > 0) { // V9.99 KEY:?. added
  //     setSelectedColorIndex(0);
  //   }
  // }, [product, selectedVariantIndex]);

  useEffect(() => {
    if (selectedColor) { // V10.1 KEY: Add {
      setMainImage(selectedColor.images?.[0]?.url || '/images/placeholder-phone.jpg');
    } // V10.1 KEY: Add }
  }, [selectedColor]);


  // }

  const addToCartHandler = () => {
    if (selectedVariant?.colors?.length > 0 && !selectedColor?.name) {
      toast.error('Please select a color')
      return
    }

    const price = Number(selectedColor?.price || selectedVariant?.price || product?.price || 0);

    // V15.3 KEY: Grab.url from object
    const imageUrl = selectedColor.images?.[0]?.url || product.image || '/placeholder.png';

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: imageUrl, // V15.3 KEY: Now https://res.cloudinary.com/...
      price: price,
      color: selectedColor?.name || '',
      countInStock: selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0,
      storage: selectedVariant.storage || '',
      qty,
    }));
    toast.success('Added to cart')
    navigate('/cart')
  }


  // Filter reviews by selected color, user login to show first his review
  const sortedReviews = useMemo(() => {
    if (!product?.reviews) return [];
    let reviews = [...product.reviews];

    if (ratingFilter !== 0) {
      reviews = reviews.filter(r => r.rating === Number(ratingFilter));
    }

    // Put user's review first, then apply the selected sort
    reviews.sort((a, b) => {
      const aUserId = typeof a.user === 'string' ? a.user : a.user?._id;
      const bUserId = typeof b.user === 'string' ? b.user : b.user?._id;

      // Force user's review to top
      if (userInfo && aUserId === userInfo._id) return -1
      if (userInfo && bUserId === userInfo._id) return 1

      // Then apply user's chosen sort
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpful?.length || 0) - (a.helpful?.length || 0);

      // Default: newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return reviews;
  }, [product, ratingFilter, sortBy, userInfo]);



  const displayRating = product?.rating || 0;
  const displayNumReviews = product?.numReviews || 0;

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    // V33.66 REPLACE L211-L218 WHOLE BLOCK
    try {
      // V33.66 KEY: 1 FormData with 'images' field for multer.array
      const formData = new FormData();
      reviewImageFiles.forEach((file) => {
        formData.append('images', file); // V33.66 KEY: Must match backend
      });

      const uploadedImages = await uploadReviewImage(formData).unwrap(); // [{url, imagePublicId}]

      await createProductReview({
        productId,
        rating,
        comment,
        color: selectedColor?.name || '',
        images: uploadedImages, // V33.66 KEY: [{url, imagePublicId}]
      }).unwrap();

      refetch();
      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
      setReviewImageFiles([]);
      setReviewImagePreviews([]);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };



  // 3. Submit: just send URLs, no upload loop
  // V33.89: Submit Edit - No upload, just send current images
  const submitEditHandler = async (e) => {
    e.preventDefault();
    if (!editRating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      // V33.89 KEY: Send editImages as-is. No upload, no merge
      await updateProductReview({
        productId,
        reviewId: editingReview._id,
        rating: editRating,
        comment: editComment,
        images: editImages, // V33.89 KEY: [{url, imagePublicId}] only
      }).unwrap();

      toast.success('Review updated successfully');
      cancelEdit(); // V33.89 KEY: Reset editImages
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };




  //create review /upload images
  // V33.62 KEY: No upload here. Only store File + Preview
  const uploadFileHandler = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // V33.62 KEY: Check against new state
    if (reviewImageFiles.length + files.length > 3) { // V33.62 KEY: Max 3
      toast.error('Max 3 images per review');
      return;
    }

    // V33.62 KEY: Store File objects only
    setReviewImageFiles((prev) => [...prev, ...files]);

    // V33.62 KEY: Create local previews, no Cloudinary call
    const previews = files.map(file => URL.createObjectURL(file));
    setReviewImagePreviews((prev) => [...prev, ...previews]);

    toast.success(`${files.length} Image(s) added`); // V33.62 KEY: 'added' not 'uploaded'
    e.target.value = null;
  };

  // For CREATE form - remove image
  // V33.63 KEY: For CREATE form - UI only, no Cloudinary call
  const removeImage = (index) => { // V33.63 KEY: index not imgObj
    // V33.63 KEY: Remove File
    setReviewImageFiles((prev) => prev.filter((_, i) => i !== index));

    // V33.63 KEY: Remove Preview + Free memory
    setReviewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]); // V33.63 KEY: Prevent memory leak
      return prev.filter((_, i) => i !== index);
    });

    toast.success('Image removed'); // V33.63 KEY: 'removed' not 'deleted'
  };

  // 2.edit review / upload images
  // V33.41 EDIT form upload - 1 API call
  const uploadEditImageHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (editImages.length + files.length > 3) { // V33.41: Max 3 total
      toast.error('Max 3 images');
      return;
    }

    // V33.41 KEY: 1 API call for all files
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file)); // V33.41: must be 'images'

    try {
      const data = await uploadReviewImage(formData).unwrap(); // V33.41: Expect [{url, imagePublicId}]
      const uploaded = data.map((u) => ({
        url: u.url,
        imagePublicId: u.imagePublicId || u.public_id // V33.41: backend compat
      }));
      setEditImages((prev) => [...prev, ...uploaded]); // V33.41: Object[]
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
    e.target.value = null;
  };

  // V33.84: Remove handler - UI only, no Cloudinary delete/ for edit review
  const removeEditImage = (index) => {
    // V33.84 KEY 1: Just remove from UI array
    setEditImages((prev) => prev.filter((_, i) => i !== index));

    // V33.84 KEY 2: Also remove from file array if it's a new file
    //setEditImageFiles((prev) => prev.filter((_, i) => i !== index)); 
  };

  //delete review hnadler
  const deleteHandler = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteProductReview({ productId, reviewId }).unwrap();
        toast.success('Review deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };





  const helpfulHandler = async (reviewId) => {
    if (!userInfo) {
      toast.error('Please sign in to vote');
      return;
    }
    try {
      await markHelpful({ productId: product._id, reviewId }).unwrap();
      refetch(); // <- ADD THIS LINE to get updated helpfulBy array
      toast.success('Updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitReplyHandler = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    try {
      await addAdminReply({
        productId,
        reviewId,
        reply: replyText, // <-- Change key from replyText to reply
      }).unwrap();
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const updateReplyHandler = async (reviewId) => {
    try {
      await editAdminReply({
        productId,
        reviewId,
        reply: editReplyText  // <-- Change from replyText: to reply:
      }).unwrap();
      setIsEditingReply(null);
      toast.success('Reply updated');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const deleteReplyHandler = async (reviewId) => {
    if (window.confirm('Delete this reply?')) {
      try {
        await deleteAdminReply({ productId, reviewId }).unwrap();
        toast.success('Reply deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };




  const alreadyReviewed = product?.reviews?.find(
    (r) => r.user === userInfo?._id || r.user?._id === userInfo?._id
  );
  const showCreateForm = userInfo && !alreadyReviewed && !editingReview;
  const showAlreadyReviewedMsg = userInfo && alreadyReviewed && !editingReview;


  // This is the key part - check for network error
  if (!isOnline || error?.status === 'FETCH_ERROR' || error?.error === 'TypeError: Failed to fetch') {
    return <OfflineMessage refetch={refetch} isOnline={isOnline} />
  }

  // V9.92 KEY: GUARD. Stop code before accessing undefined
  if (isLoading) return <Loader />;
  if (error || !product || !product.variants?.[0]?.colors?.[0])
    return <Message variant='danger'>Product not found or invalid V9.47 data</Message>;

  const currentStock = selectedColor?.countInStock ?? product.countInStock ?? 0
  const currentPrice = selectedColor?.price ?? product.price ?? 0

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

//drop down for qty / mobile screen
 const CustomDropdown = ({ value, onChange, options, label, size = 'md' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => ref.current &&!ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sizeClasses = size === 'sm' 
 ? 'px-3.5 h- min-w- border border-gray-300 rounded-lg bg-white shadow-sm hover:border-gray-400'
    : 'px-4 py-3 text-base md:min-w-[160px] border border-gray-300 rounded-lg bg-white';

  return (
    <div ref={ref} className="relative w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 font-semibold text-gray-900 transition ${sizeClasses}`}
      >
        <span>{value}</span>
        <ChevronDown size={size === 'sm'? 16 : 18} className={`text-gray-500 transition-transform ${open? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 w-full bg-white border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto 
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-sm font-medium text-gray-900 hover:bg-blue-50 ${Number(value) === Number(opt)? 'bg-blue-50 text-blue-600' : ''}`}
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
      <Helmet>
        <title>{product?.name} - Phone-Store</title>
        <meta
          name="description"
          content={`${product?.name} - ${product?.description?.substring(0, 130)}... Buy now at Phone-Store Pakistan with warranty.`}
        />
        <link rel="canonical" href={`https://www.phone-store.asia/product/${product?.slug}`} />

        <meta property="og:title" content={`${product?.name} | Phone-Store`} />
        <meta property="og:description" content={product?.description?.substring(0, 155)} />
        <meta property="og:image" content={selectedColor?.images?.[0] || product?.image} />
        <meta property="og:url" content={`https://www.phone-store.asia/product/${product?.slug}`} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={currentPrice || product?.price} />
        <meta property="product:price:currency" content="PKR" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product?.name,
            "image": selectedColor?.images || [product?.image],
            "description": product?.description,
            "sku": product?._id,
            "brand": { "@type": "Brand", "name": product?.brand },
            "offers": {
              "@type": "Offer",
              "url": `https://www.phone-store.asia/product/${product?.slug}`,
              "priceCurrency": "PKR",
              "price": String(currentPrice || product?.price),
              "availability": currentStock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "seller": { "@type": "Organization", "name": "Phone-Store" }
            },
            ...(product?.numReviews > 0 && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product?.rating?.toFixed(1),
                "reviewCount": product?.numReviews
              }
            })
          })}
        </script>
      </Helmet>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        <Link to='/' className='text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium'>
          ← Go Back
        </Link>

        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='p-6 md:p-8'>

            {/* Top Section: Images + Buy Box */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8'>

              {/* Left: Thumbnails + Main Image */}

              {/* Main 360 Image */}

              <div className='lg:col-span-7 min-w-0'>
                <Product360
                  images={selectedColor.images?.length > 0
                    ? selectedColor.images.map(img => img.url)
                    : [product.image]} // V11.1 KEY: .map(img => img.url)
                  selectedIndex={selectedImageIndex}
                  setSelectedIndex={setSelectedImageIndex}
                />
              </div>





              {/* Right: Buy Box - Name, Brand, Price, Stock, Colors, Cart */}
              <div className='lg:col-span-5'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
                  {product.name}{selectedVariant.storage ? ` - ${selectedVariant.storage}` : ''} {/* V13.6 KEY */}
                </h1>

                {/* <div className='text-sm text-gray-500 mb-2 font-medium'>{product.brand}</div> */}
                {product.numReviews > 0 && (
                  <div className='flex items-center mt-3 mb-2'>
                    <div className='flex text-amber-500 gap-0.5'>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating)
                            ? 'fill-current'
                            : 'fill-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <a className='text-xs text-blue-600 ml-1.5 hover:text-orange-600 hover:underline cursor-pointer'>
                      {product.rating?.toFixed(1) ?? '0.0'}
                    </a>
                    <a className='text-xs text-blue-600 ml-1 hover:text-orange-600 hover:underline cursor-pointer'>
                      ({product.numReviews})
                    </a>
                  </div>
                )}
                <div className='text-5xl font-bold text-blue-600 mb-4'>
                  ${selectedColor?.price ?? selectedVariant?.price ?? 0}
                </div>


                {/* Stock Status V12.2 KEY */}
                <div className='mb-6'>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold 
                      ${(selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0) > 0
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'}`}>
                    <span className={`w-2 h-2 rounded-full 
                        ${(selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0) > 0
                        ? 'bg-green-500'
                        : 'bg-red-500'}`}></span>
                    {(selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0) > 0
                      ? `In Stock (${selectedColor?.countInStock ?? selectedVariant?.countInStock})`
                      : 'Out of Stock'}
                  </span>
                </div>

                {/* V9.40 KEY: VARIANT SELECTOR = STORAGE 128GB/256GB/512GB */}
                {product.variants?.length > 0 && (
                  <div className='mb-4'>
                    <label className='font-semibold block mb-2 text-gray-900'>
                      Storage: <span className='text-blue-600'>{selectedVariant.name || selectedVariant.storage}</span>
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {product.variants.map((variant, vIdx) => (
                        <button
                          key={vIdx}
                          type="button"
                          onClick={() => {
                            setSelectedVariantIndex(vIdx);
                            setSelectedColorIndex(0);
                          }}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${vIdx === selectedVariantIndex ?
                            'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400 text-gray-700'}`}
                        >
                          {variant.name || variant.storage || `${variant.size}GB`} {/* V9.40 KEY */}
                        </button>
                      ))}
                    </div>
                  </div>
                )}


                {/* Color Selection V12.6 */}
                {selectedVariant.colors?.length > 0 && (
                  <div className='mb-6'>
                    <h3 className='font-semibold mb-3 text-gray-900'>
                      Color: <span className='text-blue-600'>{selectedColor.name}</span>
                    </h3>
                    <div className='flex flex-wrap gap-3'>
                      {selectedVariant.colors.map((color, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => setSelectedColorIndex(cIdx)}
                          className={`p-1.5 border-2 rounded-lg transition-all duration-200 ${cIdx === selectedColorIndex
                            ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                            : 'border-gray-200 hover:border-gray-300'}`}
                          title={color.name}
                        >
                          <img
                            src={(color.images?.[0]?.url || selectedVariant.images?.[0]?.url || product.image || '/images/placeholder-phone.jpg').replace('/upload/', '/upload/w_400,h_400,c_pad,b_white,q_auto:best/')} // V12.7
                            alt={color.name}
                            className='w-20 h-20 object-contain bg-white rounded-md p-1' // V12.7
                            onError={(e) => e.target.src = '/images/placeholder-phone.jpg'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qty + Add to Cart - V12.8 KEY */}
            
{(selectedColor?.countInStock?? selectedVariant?.countInStock?? 0) > 0 && (
  <div className='flex items-end gap-3 mb-6'> 
    
    {/* QTY SELECT - V34.30 KEY: CustomDropdown */}
    <div className='flex flex-col'>
      <label className='text-sm font-semibold text-gray-700 mb-1.5'>Qty</label>
      <CustomDropdown
        size="sm"
        value={qty}
        onChange={(val) => setQty(Number(val))}
        options={Array.from(
          { length: Math.min(selectedColor?.countInStock?? selectedVariant?.countInStock?? 0, 10) }, 
          (_, i) => i + 1
        )}
        label="1"
      />
    </div>

    {/* ADD TO CART */}
    <button
      onClick={addToCartHandler}
      className='flex-1 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 h-'
    >
      <FaShoppingCart size={18} /> Add to Cart
    </button>

    {/* WISHLIST BUTTON */}
    <div className='flex-shrink-0'>
      {!isLoading && product?.variants?.length > 0 && selectedVariant && selectedColor? (
        <WishlistButton
          product={product}
          selectedColor={selectedColor}
          selectedStorage={selectedVariant}
          selectedPrice={selectedVariant.price}
          selectedImage={selectedColor.images?.[0]?.url}
          countInStock={selectedVariant.countInStock}
          className='w- h- border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50'  
        />
      ) : (
        <div className='w- h- rounded-xl bg-gray-200 animate-pulse' />
      )}
    </div>
  </div>
)}
              </div>
            </div>

            {/* Specifications Box - Full Width Below Grid V12.9 */}
            {(() => {
              const specs = { ...product.specs, ...selectedVariant.specs, ...selectedColor.specs }; // V12.9 KEY: Color > Variant > Product

              return Object.values(specs).some(v => v) ? (
                <div className='grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4'>
                  {specs.storage && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Storage</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{specs.storage}</div>
                    </div>
                  )}
                  {specs.ram && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>RAM</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{specs.ram}</div>
                    </div>
                  )}
                  {specs.display && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Display</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{specs.display}</div>
                    </div>
                  )}
                  {specs.camera && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Camera</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{specs.camera}</div>
                    </div>
                  )}
                  {specs.battery && (
                    <div>
                      <div className='text-xs text-gray-500 uppercase tracking-wide'>Battery</div>
                      <div className='font-semibold text-gray-900 mt-0.5'>{specs.battery}</div>
                    </div>
                  )}
                </div>
              ) : null;
            })()}


            {/* Description - Full Width V13.4 */}
            <div className='border-t pt-7'>
              <h2 className='text-xl font-bold text-gray-900 mb-3'>
                Description {selectedVariant.storage ? `- ${selectedVariant.storage}` : ''} {/* V13.4 KEY */}
              </h2>
              <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                {selectedVariant.description || selectedColor?.description || product.description || 'No description available.'} {/* V13.4 */}
              </p>
            </div>

          </div>
        </div>


        {/* Reviews Section */}
        <div className='mt-10'>

          <div className='mt-3 mb-4 flex items-center gap-2 flex-wrap'>
            <span className='font-medium text-sm'>Filter:</span>
            {[0, 5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRatingFilter(star)}
                className={`px-3 py-1 rounded text-sm border ${ratingFilter === star
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {star === 0 ? 'All' : `${star} ★`}
              </button>
            ))}
            {ratingFilter !== 0 && (
              <button
                type='button'
                onClick={() => setRatingFilter(0)}
                className='text-sm text-blue-600 hover:underline ml-2'
              >
                Clear
              </button>
            )}
          </div>

          {product?.reviews?.length === 0 && (
            <Message>No Reviews Yet</Message>
          )}

          {/* Review List */}
          <div className='mb-8'>
            {sortedReviews.length > 0 ? (
              sortedReviews.slice(0, 3).map((review) => (
                <div key={review._id} className='bg-gray-50 p-4 rounded-lg mb-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <strong>{review.name}</strong>
                      {review.color && <span className='text-sm text-gray-500 ml-2'>({review.color})</span>}
                      <span className='text-sm text-gray-500 ml-2'>
                        | {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {userInfo?._id === review.user && (
                      <div className='flex gap-3'>
                        <button
                          onClick={() => handleEditClick(review)}
                          className='text-blue-600 text-sm hover:underline font-medium'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteHandler(review._id)}
                          disabled={loadingDeleteReview}
                          className='text-red-600 text-sm hover:underline font-medium disabled:opacity-50'
                        >
                          {loadingDeleteReview ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>

                  <Rating value={review.rating} />
                  <p className='mt-2 text-gray-700'>{review.comment}</p>

                  {review.images?.length > 0 && (
                    <div className='flex gap-2 mt-2 flex-wrap'>
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url} // V33.21 KEY: .url not the whole object
                          alt={`Review ${idx + 1}`}
                          className="w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border-gray-200 cursor-pointer hover:opacity-80 p-1 flex-shrink-0"
                          onClick={() => window.open(img.url, '_blank')} // V33.21 KEY: .url
                        />
                      ))}
                    </div>
                  )}

                  <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                    <button
                      onClick={() => helpfulHandler(review._id)}
                      disabled={loadingHelpfulReview}
                      className={`flex items-center gap-1 hover:text-blue-600 disabled:opacity-50 ${userInfo && review.helpful?.includes(userInfo._id) ? 'text-blue-600 font-medium' : ''
                        }`}
                    >
                      <FaThumbsUp size={14} />
                      Helpful ({review.helpful?.length || 0})
                    </button>
                  </div>

                  {/* Show existing admin reply */}
                  {review.adminReply && (review.adminReply.reply || review.adminReply.text) && (
                    <div className='mt-3 ml-4 pl-3 border-l-2 border-gray-300 bg-gray-50 p-2 rounded'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-800'>
                            Store Response - {review.adminReply.name}
                          </p>
                          {isEditingReply === review._id ? (
                            <div className='mt-1'>
                              <textarea
                                rows='2'
                                value={editReplyText}
                                onChange={(e) => setEditReplyText(e.target.value)}
                                className='w-full border rounded p-1 text-sm'
                              />
                              <div className='flex gap-2 mt-1'>
                                <button
                                  onClick={() => updateReplyHandler(review._id)}
                                  disabled={loadingUpdateReply}
                                  className='bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50'
                                >
                                  {loadingUpdateReply ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setIsEditingReply(null)}
                                  className='text-gray-600 text-xs'
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className='text-sm text-gray-700 mt-1'>
                              <p>{review.adminReply.reply || review.adminReply.text}</p>
                              {review.adminReply.createdAt && (

                                <p className='text-xs text-gray-500 mt-1'>{timeAgo(review.adminReply.createdAt)}</p>

                              )}
                            </div>



                          )}
                        </div>

                        {userInfo?.isAdmin && isEditingReply !== review._id && (
                          <div className='flex gap-2 ml-2'>
                            <button
                              onClick={() => {
                                setIsEditingReply(review._id);
                                setEditReplyText(review.adminReply.reply);
                              }}
                              className='text-blue-600 text-xs hover:underline'
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteReplyHandler(review._id)}
                              disabled={loadingDeleteReply}
                              className='text-red-600 text-xs hover:underline disabled:opacity-50'
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin reply button + form - for reviews without replies */}
                  {userInfo?.isAdmin && !review.adminReply?.reply && (
                    <div className='mt-2'>
                      {replyingTo === review._id ? (
                        <div className='mt-2'>
                          <textarea
                            rows='2'
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder='Write admin reply...'
                            className='w-full border rounded p-2 text-sm'
                          />
                          <div className='flex gap-2 mt-1'>
                            <button
                              onClick={() => submitReplyHandler(review._id)}
                              disabled={loadingAdminReply}
                              className='bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50'
                            >
                              {loadingAdminReply ? 'Posting...' : 'Post Reply'}
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className='text-gray-600 text-sm'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review._id)}
                          className='text-blue-600 text-sm hover:underline mt-1'
                        >
                          Reply as Admin
                        </button>
                      )}
                    </div>

                  )}


                </div>

              ))
            ) : product?.reviews?.length > 0 ? (
              <p className='text-gray-500 py-4'>
                No {ratingFilter} star reviews yet
              </p>
            ) : null}



            {/* Add this right here*/}
            {product?.reviews?.length > 3 && (
              <button
                onClick={() => setShowAllReviews(true)}
                className="mt-6 px-6 py-2 border-2 border-gray-800 rounded-md hover:bg-gray-100 font-semibold transition w-full sm:w-auto"
              >
                See All Reviews ({product.reviews.length})
              </button>
            )}

            {showAllReviews && product && (
              <ReviewsModal
                productId={product?._id}  // <-- Change this line
                product={product}
                onClose={() => setShowAllReviews(false)}
              />
            )}

          </div>



          {/* CREATE REVIEW SECTION */}
          {/* WRITE REVIEW BUTTON - Shows when form is hidden */}
          {userInfo && !alreadyReviewed && !editingReview && !showReviewForm && (
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>Review this product</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Share your thoughts with other customers
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className='bg-white hover:bg-gray-50 text-gray-900 px-6 py-2 rounded-lg border border-gray-300 text-sm font-medium shadow-sm'
              >
                Write a customer review
              </button>
            </div>
          )}

          {/* CREATE REVIEW FORM - Shows when button clicked */}
          {userInfo && !alreadyReviewed && !editingReview && showReviewForm && (
            <div className='max-w-2xl bg-white p-6 rounded-lg border border-gray-200 mt-8'>
              <div className='flex justify-between items-center mb-4 pb-3 border-b border-gray-200'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Create Review
                </h2>
                <button
                  type='button'
                  onClick={() => setShowReviewForm(false)}
                  className='text-gray-500 hover:text-gray-700 text-2xl leading-none'
                >
                  ×
                </button>
              </div>

              {/* Product info */}
              {selectedColor && (
                <div className='flex items-center gap-3 mb-6 text-sm'>
                  <img
                    src={mainImage || '/images/placeholder-phone.jpg'}
                    alt={product.name}
                    className='w-12 h-12 object-contain border border-gray-200 rounded bg-white'
                    onError={(e) => { e.target.src = '/images/placeholder-phone.jpg' }}
                  />
                  <div>
                    <p className='text-gray-600'>You are reviewing:</p>
                    <p className='font-medium text-gray-900'>
                      {product.name} - {selectedColor.name}
                    </p>
                  </div>
                </div>
              )}

              {!selectedColor && product?.colors?.length > 0 && (
                <Message variant='danger'>Please select a color first</Message>
              )}

              <form onSubmit={submitReviewHandler}>
                {/* Overall Rating */}
                <div className='mb-6'>
                  <label className='block text-base font-bold text-gray-900 mb-2'>
                    Overall rating
                  </label>
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`w-7 h-7 cursor-pointer transition-colors ${(hoverRating || rating) >= star
                          ? 'text-amber-500'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  {rating === 0 && (
                    <p className='text-xs text-red-600 mt-1'>Please select a rating</p>
                  )}
                </div>

                {/* Written Review */}
                <div className='mb-6'>
                  <label className='block text-base font-bold text-gray-900 mb-2'>
                    Add a written review
                  </label>
                  <textarea
                    rows={5}
                    placeholder='What did you like or dislike? What did you use this product for?'
                    className='w-full px-3 py-2 border border-gray-400 rounded shadow-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {/* Upload Images */}
                <div className='mb-6'>
                  <label className='block text-base font-bold text-gray-900 mb-2'>
                    Add photos
                  </label>
                  <p className='text-xs text-gray-600 mb-3'>
                    Shoppers find images more helpful than text alone.
                  </p>

                  <label className={`
  inline-block px-4 py-2 rounded-lg border border-gray-400 bg-white text-sm font-medium text-gray-900
  hover:bg-gray-50 cursor-pointer shadow-sm
  ${reviewImageFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''} // V33.64 KEY: Files not Upload
`}>
                    <input
                      type='file'
                      accept='image/*'
                      multiple
                      onChange={uploadFileHandler}
                      disabled={reviewImageFiles.length >= 3}
                      className='hidden'
                    />
                    {'Choose files'}
                  </label>
                  <span className='text-xs text-gray-500 ml-3'>
                    {reviewImageFiles.length}/3 photos / (Optional)
                  </span>

                  {/* Image Preview Thumbnails */}
                  {reviewImagePreviews.length > 0 && (
                    <div className='flex gap-3 mt-4 flex-wrap'>
                      {reviewImagePreviews.map((url, idx) => (
                        <div key={idx} className='relative group'>
                          <img
                            src={url}
                            alt={`Review ${idx + 1}`}
                            className='w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border border-gray-200'
                          />
                          <button
                            type='button'
                            onClick={() => removeImage(idx)}
                            className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100'
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className='pt-4 border-t border-gray-200'>
                  <button
                    type='submit'
                    disabled={
                      loadingProductReview ||
                      loadingUpload ||
                      rating === 0 ||
                      !comment ||
                      (product?.colors?.length > 0 && !selectedColor)
                    }
                    className='bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-black px-6 py-2 rounded-full text-sm font-medium shadow-sm disabled:cursor-not-allowed'
                  >
                    {loadingProductReview ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          )}




          {/* EDIT REVIEW FORM */}
          {/* V33.99: EDIT REVIEW MODAL */}
          {isEditModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm" // V33.99 KEY: darker + blur
              onClick={cancelEdit}
            >
              <div
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative" // V33.99 KEY: max-w-md + relative
                onClick={(e) => e.stopPropagation()}
              >
                {/* V33.99 KEY: Top Close Button */}
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="p-6 pt-10"> {/* V33.99 KEY: pt-10 for X button space */}
                  <h3 className='text-2xl font-bold mb-5'>Edit Your Review</h3>

                  <form onSubmit={submitEditHandler} className='space-y-5'>
                    {/* Rating */}
                    <div>
                      <label className='block mb-2 font-semibold text-gray-700'>Rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button type="button" key={star} onClick={() => setEditRating(star)} className="cursor-pointer transition-transform hover:scale-110">
                            <FaStar
                              className={`w-8 h-8 ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'}`} // V33.99 KEY: w-8 bigger
                            />
                          </button>
                        ))}
                      </div>
                      {editRating === 0 && <p className='text-red-500 text-sm mt-1'>Please select a rating</p>}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className='block mb-2 font-semibold text-gray-700'>Comment</label>
                      <textarea
                        className='w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        rows='4'
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        required
                      />
                    </div>

                    {/* Images - Clear + Big */}
                    <div>
                      <label className='block mb-2 font-semibold text-gray-700'>Images (max 3)</label>
                      <div className='flex gap-3 mt-3 flex-wrap'>
                        {editImages.map((img, idx) => (
                          <div key={idx} className='relative'>
                            <img
                              src={img.url}
                              alt='review'
                              //className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm bg-white"
                              className='w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border border-gray-200' // V33.99 KEY: w-24 + border-2 + shadow
                            />
                            <button
                              type='button'
                              onClick={() => removeEditImage(idx)}
                              className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md transition' // V33.99 KEY: bigger X
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {editImages.length < 3 && (
                        <div className='mt-3'>
                          <input
                            type='file'
                            accept='image/*'
                            multiple
                            onChange={uploadEditImageHandler}
                            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer'
                          />
                          {loadingUpload && <p className='text-sm text-gray-500 mt-1'>Uploading...</p>}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">To add images, delete current and add new one</p>
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-3 pt-3'>
                      <button
                        type='submit'
                        disabled={loadingUpdateReview}
                        className='flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition'
                      >
                        {loadingUpdateReview ? 'Updating...' : 'Update Review'}
                      </button>
                      <button
                        type='button'
                        onClick={cancelEdit}
                        className='px-6 bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition'
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ALREADY REVIEWED MESSAGE */}
          {userInfo && alreadyReviewed && !editingReview && (
            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <p className='text-sm text-green-800'>
                ✓ You've already reviewed this product. Click "Edit" on your review above to update it.
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
    </>
  )
}

export default ProductScreen