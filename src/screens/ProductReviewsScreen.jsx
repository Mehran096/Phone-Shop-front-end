import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    useGetProductBySlugQuery,
    useGetProductReviewsQuery,
    useMarkReviewHelpfulMutation,
    useAddAdminReplyMutation,
    useEditAdminReplyMutation,
    useDeleteAdminReplyMutation,
} from '../slices/productsApiSlice';
import { FaStar, FaTimes, FaThumbsUp, FaReply, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';


const ProductReviewsScreen = () => {
    const { slug } = useParams();

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('helpful');
    const [colorFilter, setColorFilter] = useState('All');
    const [storageFilter, setStorageFilter] = useState('All');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingReply, setEditingReply] = useState(null);
    //image view
    const [selectedImage, setSelectedImage] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    const {
        data: product,
        isLoading: loadingProduct,
        error: errorProduct,
    } = useGetProductBySlugQuery(slug);


    const productId = product?._id;

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useGetProductReviewsQuery(
        {
            productId,
            page,
            limit: 10,
            sort,
            color: colorFilter === "All" ? "" : colorFilter,
            storage: storageFilter === 'All' ? '' : storageFilter,
        },
        {
            skip: !productId,
        }
    );



    const [markHelpful, { isLoading: loadingHelpful }] = useMarkReviewHelpfulMutation();
    const [addAdminReply, { isLoading: loadingReply }] = useAddAdminReplyMutation();
    const [editAdminReply, { isLoading: loadingEdit }] = useEditAdminReplyMutation();
    const [deleteAdminReply, { isLoading: loadingDelete }] = useDeleteAdminReplyMutation();

    const colors = [
        ...new Set(
            product?.variants?.flatMap(v =>
                v.colors.map(c => c.name)
            ) || []
        )
    ];

    const storages = [...new Set(product?.variants?.map(v => v.storage) || [])];



    //filter image start
    const selectedVariant =
        product?.variants?.find(
            v => storageFilter === 'All' || v.storage === storageFilter
        );

    const selectedColor =
        selectedVariant?.colors?.find(
            c => colorFilter === 'All' || c.name === colorFilter
        );

    const productImage =
        selectedColor?.images?.[0]?.url ||
        selectedVariant?.colors?.[0]?.images?.[0]?.url ||
        product?.variants?.[0]?.colors?.[0]?.images?.[0]?.url;

    //filters iamge end


    const reviews = data?.reviews || [];

    const customerPhotos = reviews.flatMap((review) =>
  (review.images || []).map((img) => ({
    ...img,
    reviewId: review._id,
  }))
);

    const handleHelpful = async (reviewId) => {
        if (!userInfo) {
            toast.error('Please login to mark as helpful');
            return;
        }
        try {
            await markHelpful({ productId, reviewId }).unwrap();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) {
            toast.error('Reply cannot be empty');
            return;
        }
        try {
            if (editingReply === reviewId) {
                await editAdminReply({
                    productId,
                    reviewId,
                    reply: replyText,
                }).unwrap();
                toast.success('Reply updated');
            } else {
                await addAdminReply({
                    productId,
                    reviewId,
                    reply: replyText,
                }).unwrap();
                toast.success('Reply posted');
            }
            refetch();
            setReplyText('');
            setReplyingTo(null);
            setEditingReply(null);

        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleDeleteReply = async (reviewId) => {
        if (window.confirm('Delete this admin reply?')) {
            try {
                await deleteAdminReply({ productId, reviewId }).unwrap();
                toast.success('Reply deleted');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };


    const CustomDropdown = ({ value, onChange, options, label, displayMap = {} }) => {
        const [open, setOpen] = useState(false);
        const ref = useRef(null);

        useEffect(() => {
            const handleClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div ref={ref} className="relative w-full md:w-auto md:min-w-[160px]">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between gap-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white 
          hover:border-gray-400 transition"
                >
                    <span className="text-gray-900">
                        {value === 'All'
                            ? label
                            : displayMap[value] || value}
                    </span>
                    <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60] 
          max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm text-gray-900
                   hover:bg-gray-100 ${value === opt ? 'bg-gray-100 font-medium' : ''}`}
                            >
                                {opt === 'All'
                                    ? label
                                    : displayMap[opt] || opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loadingProduct) {
        return <Loader />;
    }

    if (errorProduct) {
        return (
            <Message variant="danger">
                {errorProduct?.data?.message || errorProduct.error}
            </Message>
        );
    }

    if (!product) {
        return <Message>Product not found</Message>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">

                <Link
                    to={`/product/${product.slug}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                >
                    ← Back to Product
                </Link>

                <h1 className="text-4xl font-bold mt-3">
                    Customer Reviews
                </h1>

                <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <img
                            src={productImage}
                            alt={product.name}
                            className="w-36 h-36 object-contain"
                        />
                        <div className="flex-1">

                            <h2 className="text-2xl font-bold">
                                {product.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-3">
                                <Rating value={product.rating} />
                                <span className="text-gray-600">
                                    ({product.numReviews} Reviews)
                                </span>
                            </div>

                            <p className="mt-3 text-gray-600">
                                Read real customer experiences, ratings,
                                photos and seller responses.
                            </p>

                        </div>

                    </div>
                </div>

                <div className="mt-8 bg-white border rounded-xl shadow-sm p-6 mb-8">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                        {/* Left */}
                        <div>

                            <div className="flex items-center gap-4">

                                <span className="text-5xl font-bold">
                                    {product.rating.toFixed(1)}
                                </span>

                                <div>

                                    <Rating value={product.rating} />

                                    <p className="text-gray-500 mt-1">
                                        Based on {product.numReviews} reviews
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Right */}
                        <div className="w-full lg:w-80 space-y-2">

                            {[5, 4, 3, 2, 1].map(star => {

                                const count = product.reviews.filter(
                                    r => r.rating === star
                                ).length;

                                const percent =
                                    product.numReviews
                                        ? (count / product.numReviews) * 100
                                        : 0;

                                return (

                                    <div
                                        key={star}
                                        className="flex items-center gap-3"
                                    >

                                        <span className="w-10 text-sm">
                                            {star} ★
                                        </span>

                                        <div className="flex-1 bg-gray-200 rounded-full h-2">

                                            <div
                                                className="bg-yellow-400 h-2 rounded-full"
                                                style={{
                                                    width: `${percent}%`
                                                }}
                                            />

                                        </div>

                                        <span className="w-6 text-sm text-gray-600">
                                            {count}
                                        </span>

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                </div>

                {customerPhotos.length > 0 && (
  <div className="bg-white rounded-lg border p-5 mb-8">
    <h3 className="text-lg font-semibold mb-4">
      Customer Photos ({customerPhotos.length})
    </h3>

    <div className="flex flex-wrap gap-3">
      {customerPhotos.map((photo, index) => (
        <img
          key={index}
          src={photo.url}
          alt="Customer Review"
          onClick={() => setSelectedImage(photo.url)}
          className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:scale-105 transition"
        />
      ))}
    </div>
  </div>
)}

            </div>


            {/* Sort + Stats */}
            <div className="p-3 sm:p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">
                    {data?.totalReviews || 0} reviews
                </span>

                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <CustomDropdown
                        value={colorFilter}
                        onChange={(val) => {
                            setColorFilter(val);
                            setPage(1);
                        }}
                        options={['All', ...colors]}
                        label="All Colors"
                    />
                    <CustomDropdown
                        value={storageFilter}
                        onChange={(val) => {
                            setStorageFilter(val);
                            setPage(1);
                        }}
                        options={['All', ...storages]}
                        label="All Storage"
                    />
                    <CustomDropdown
                        value={sort}
                        onChange={(val) => {
                            setSort(val);
                            setPage(1);
                        }}
                        options={['helpful', 'newest', 'highest', 'lowest']}
                        label="Sort By"
                        displayMap={{
                            helpful: 'Most Helpful',
                            newest: 'Newest',
                            highest: 'Highest Rating',
                            lowest: 'Lowest Rating',
                        }}
                    />
                </div>
            </div>

            {/* Reviews list */}
            <div className="overflow-y-auto p-3 sm:p-4 flex-1">
                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <Message variant="danger">{error?.data?.message || error.error}</Message>
                ) : (
                    <>
                        {reviews.length === 0 ? (
                            <Message>No reviews yet</Message>
                        ) : (
                            reviews.map((review) => {
                                const hasMarkedHelpful = review.helpful?.includes(userInfo?._id);

                                return (
                                    <div key={review._id} className="border-b py-4 sm:py-6 last:border-b-0">
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="font-semibold">{review.name}</span>
                                            {review.verifiedPurchase && (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                                                    ✓ Verified Purchase
                                                </span>
                                            )}
                                            <span className="text-gray-500">
                                                {review.color || review.storage ? (
                                                    <>
                                                        {review.color}
                                                        {review.storage && ` / ${review.storage}`}
                                                        {' | '}
                                                    </>
                                                ) : null}
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <Rating value={review.rating} />

                                        <p className="text-gray-800 mb-3 break-words text-sm sm:text-base">{review.comment}</p>

                                        {review.images?.length > 0 && (
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                {review.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.url}
                                                        onClick={() => setSelectedImage(img.url)}
                                                        alt={`review-${idx}`}
                                                        className='w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border border-gray-200 cursor-pointer'
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {selectedImage && (
                                            <div
                                                className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
                                                onClick={() => setSelectedImage(null)}
                                            > 
                                                <img
                                                    src={selectedImage}
                                                    className="max-w-[90%] max-h-[90%] rounded-lg"
                                                />

                                            </div>
                                        )}

                                        {/* Admin Reply Section */}
                                        {review.adminReply?.reply && (
                                            <div className="bg-blue-50 p-3 rounded mt-3 text-sm">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-blue-800">
                                                            {review.adminReply.name || 'Seller'} Response:
                                                        </p>
                                                        {editingReply === review._id ? (
                                                            <div className="mt-2">
                                                                <textarea
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    className="w-full border rounded p-2 text-sm"
                                                                    rows="2"
                                                                />
                                                                <div className="flex gap-2 mt-2">
                                                                    <button
                                                                        onClick={() => handleReply(review._id)}
                                                                        disabled={loadingEdit}
                                                                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                                                    >
                                                                        {loadingEdit ? 'Saving...' : 'Save'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingReply(null);
                                                                            setReplyText('');
                                                                        }}
                                                                        className="bg-gray-300 px-3 py-1 rounded text-xs"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-gray-700 mt-1 break-words">
                                                                    {review.adminReply.reply}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {review.adminReply?.createdAt
                                                                        ? new Date(review.adminReply.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                        })
                                                                        : 'Just now'}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                    {userInfo?.isAdmin && editingReply !== review._id && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingReply(review._id);
                                                                    setReplyingTo(null);
                                                                    setReplyText(review.adminReply.reply);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReply(review._id)}
                                                                disabled={loadingDelete}
                                                                className="text-red-600 hover:text-red-800 flex-shrink-0"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                            <button
                                                onClick={() => handleHelpful(review._id)}
                                                disabled={loadingHelpful}
                                                className={`flex items-center gap-1 text-sm ${hasMarkedHelpful
                                                    ? 'text-blue-600 font-semibold'
                                                    : 'text-gray-600 hover:text-blue-600'
                                                    }`}
                                            >
                                                <FaThumbsUp className={hasMarkedHelpful ? 'fill-current' : ''} />
                                                Helpful ({review.helpful?.length || 0})
                                            </button>

                                            {userInfo?.isAdmin && !review.adminReply?.reply && (
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review._id === replyingTo ? null : review._id);
                                                        setEditingReply(null);
                                                        setReplyText('');
                                                    }}
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaReply />
                                                    {replyingTo === review._id ? 'Cancel' : 'Reply as Admin'}
                                                </button>
                                            )}
                                        </div>

                                        {/* New Reply Form */}
                                        {replyingTo === review._id && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your reply..."
                                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                />
                                                <button
                                                    onClick={() => handleReply(review._id)}
                                                    disabled={loadingReply || loadingEdit}
                                                    className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 
                            disabled:bg-gray-400"
                                                >
                                                    {loadingReply || loadingEdit ? 'Posting...' : editingReply ? 'Update Reply' : 'Post Reply'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {data?.totalPages > 1 && (
                <div className="p-3 sm:p-4 border-t flex justify-between items-center bg-gray-50">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 sm:px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-xs sm:text-sm">
                        Page {page} of {data.totalPages}
                    </span>
                    <button
                        disabled={page === data.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 sm:px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductReviewsScreen;