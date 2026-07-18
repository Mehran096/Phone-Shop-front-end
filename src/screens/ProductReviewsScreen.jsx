import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    useGetProductBySlugQuery,
    useGetProductReviewsQuery,
    useMarkReviewHelpfulMutation,
    useMarkReviewNotHelpfulMutation,
    useAddAdminReplyMutation,
    useEditAdminReplyMutation,
    useDeleteAdminReplyMutation,
} from '../slices/productsApiSlice';
import { FaStar, FaTimes, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';
import ReviewSkeleton from '../components/ReviewSkeleton';



const ProductReviewsScreen = () => {
    const { slug } = useParams();

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('helpful');
    const [colorFilter, setColorFilter] = useState('All');
    const [storageFilter, setStorageFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingReply, setEditingReply] = useState(null);
    const [allReviews, setAllReviews] = useState([]);
    const [search, setSearch] = useState('');
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
        isFetching,
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
            keyword: search,
            rating: ratingFilter,
        },
        {
            skip: !productId,
        }
    );



    const [markHelpful, { isLoading: loadingHelpful }] = useMarkReviewHelpfulMutation();
    const [markReviewNotHelpful, { isLoading: loadingNotHelpful }] = useMarkReviewNotHelpfulMutation();
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

    useEffect(() => {
        setPage(1);
        setAllReviews([]);
    }, [sort, colorFilter, storageFilter]);

    //const reviews = data?.reviews || [];
    useEffect(() => {
        if (!data) return;

        if (data.page === 1) {
            setAllReviews(data.reviews);
        } else {
            setAllReviews(prev => [...prev, ...data.reviews]);
        }
    }, [data]);

    const customerPhotos = allReviews.flatMap((review) =>
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
            const res = await markHelpful({ productId, reviewId }).unwrap();
            refetch();
            toast.success(
  res.userVoted
    ? 'Thanks! You found this review helpful.'
    : 'Your helpful vote has been removed.'
);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleNotHelpful = async (reviewId) => {
        if (!userInfo) {
            toast.error("Please login to mark as not helpful");
            return;
        }

        try {
           const res = await markReviewNotHelpful({
                productId,
                reviewId,
            }).unwrap();

            refetch();
            toast.success(
  res.userVoted
    ? "Thanks! You marked this review as not helpful."
    : 'Your not helpful vote has been removed.'
);
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
                        {options.find((opt) => opt.value === value)?.label || label}
                    </span>
                    <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[60] 
          max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm text-gray-900
                   hover:bg-gray-100 ${value === opt.value ? 'bg-gray-100 font-medium' : ''}`}
                            >
                                {opt.label}
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
                                    ({product.numReviews} allReviews)
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
                                        Based on {product.numReviews} allReviews
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
                                    className="w-16 h-16
                                        sm:w-20 sm:h-20
                                        lg:w-24 lg:h-24
                                        object-contain
                                        rounded-lg
                                        bg-white
                                        border
                                        border-gray-200
                                        p-1
                                        cursor-pointer
                                        hover:opacity-80
                                        flex-shrink-0"
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Search Reviews */}
            <div className="mb-6">
                <div className="relative w-full md:max-w-md lg:max-w-lg">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reviews..."
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>


            {/* Sort + Stats */}
            <div className="p-3 sm:p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">
                    {data?.totalReviews || 0} allReviews
                </span>

                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <CustomDropdown
                        value={ratingFilter}
                        onChange={(value) => setRatingFilter(value)}
                        options={[
                            { label: "All Stars", value: "" },
                            { label: "5 Stars", value: "5" },
                            { label: "4 Stars", value: "4" },
                            { label: "3 Stars", value: "3" },
                            { label: "2 Stars", value: "2" },
                            { label: "1 Star", value: "1" },
                        ]}
                    />
                    <CustomDropdown
                        value={colorFilter}
                        onChange={(val) => {
                            setColorFilter(val);
                            setPage(1);
                        }}
                        options={[
                            { label: 'All Colors', value: 'All' },
                            ...colors.map((color) => ({
                                label: color,
                                value: color,
                            })),
                        ]}
                        label="All Colors"
                    />
                    <CustomDropdown
                        value={storageFilter}
                        onChange={(val) => {
                            setStorageFilter(val);
                            setPage(1);
                        }}
                        options={[
                            { label: 'All Storage', value: 'All' },
                            ...storages.map((storage) => ({
                                label: storage,
                                value: storage,
                            })),
                        ]}
                        label="All Storage"
                    />
                    <CustomDropdown
                        value={sort}
                        onChange={(val) => {
                            setSort(val);
                            setPage(1);
                        }}
                        options={[
                            { label: 'Most Helpful', value: 'helpful' },
                            { label: 'Most Not Helpful', value: 'notHelpful' },
                            { label: 'Newest', value: 'newest' },
                            { label: 'Highest Rating', value: 'highest' },
                            { label: 'Lowest Rating', value: 'lowest' },
                        ]}
                        label="Sort By"

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
                        {allReviews.length === 0 ? (
                            <Message>No reviews yet</Message>
                        ) : (
                            allReviews.map((review, index) => {
                                const hasMarkedHelpful = review.helpful?.includes(userInfo?._id);
                                const hasMarkedNotHelpful = review.notHelpful?.includes(userInfo?._id);

                                return (
                                    <div key={`${review._id}-${index}`} className="border-b py-4 sm:py-6 last:border-b-0">
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
                                        {review.title && (
                                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg mt-2 mb-1">
                                                {review.title}
                                            </h4>
                                        )}
                                        <p className="text-gray-800 mb-3 break-words text-sm sm:text-base">{review.comment}</p>

                                        {review.images?.length > 0 && (
                                            <div className="flex gap-2 mb-3 flex-wrap">
                                                {review.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.url}
                                                        onClick={() => setSelectedImage(img.url)}
                                                        alt={`review-${idx}`}
                                                        className="w-16 h-16
                                                                sm:w-20 sm:h-20
                                                                lg:w-24 lg:h-24
                                                                object-contain
                                                                rounded-lg
                                                                bg-white
                                                                border
                                                                border-gray-200
                                                                p-1
                                                                cursor-pointer
                                                                hover:opacity-80
                                                                flex-shrink-0"
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
                                            <button
                                                onClick={() => handleNotHelpful(review._id)}
                                                disabled={loadingNotHelpful}
                                                className={`flex items-center gap-1 text-sm ${hasMarkedNotHelpful
                                                        ? "text-red-600 font-semibold"
                                                        : "text-gray-600 hover:text-red-600"
                                                    }`}
                                            >
                                                <FaThumbsDown className={hasMarkedNotHelpful ? "fill-current" : ""} />
                                                Not Helpful ({review.notHelpful?.length || 0})
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
            {/* Show skeleton while loading more */}
            {isFetching && (
                <div className="mt-6">
                    {[1, 2, 3].map((item) => (
                        <ReviewSkeleton key={item} />
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {page < data?.totalPages && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={isFetching}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl
                 hover:bg-black transition-all duration-300
                 hover:scale-105 shadow-lg
                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isFetching ? "Loading..." : "Load More Reviews"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductReviewsScreen;