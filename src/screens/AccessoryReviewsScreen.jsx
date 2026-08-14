import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
    useGetAccessoryBySlugQuery,
    useGetAccessoryReviewsQuery,
    useVoteReviewMutation,
    useReplyToReviewMutation,
    useUpdateReplyMutation,
    useDeleteReplyMutation,
} from '../slices/accessoriesApiSlice';
import { FaStar, FaTimes, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaChevronDown, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';
import ReviewSkeleton from '../components/ReviewSkeleton';

const AccessoryReviewsScreen = () => {
    const { slug } = useParams();

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('helpful');
    const [modelFilter, setModelFilter] = useState('All');
    const [variantFilter, setVariantFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingReply, setEditingReply] = useState(null);
    const [allReviews, setAllReviews] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    // 1. GET ACCESSORY BY SLUG
    const {
        data: accessory,
        isLoading: loadingAccessory,
        error: errorAccessory,
    } = useGetAccessoryBySlugQuery(slug);

    // 2. GET REVIEWS BY SLUG
    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetAccessoryReviewsQuery(
        {
            slug, // CHANGED: use slug instead of productId
            page,
            limit: 10,
            sort,
            model: modelFilter === "All"? "" : modelFilter,
            variant: variantFilter === 'All'? '' : variantFilter,
            keyword: search,
            rating: ratingFilter,
        },
        {
            skip:!slug,
        }
    );

    const [voteReview, { isLoading: voting }] = useVoteReviewMutation();
    const [replyToReview, { isLoading: loadingReply }] = useReplyToReviewMutation();
    const [updateReply, { isLoading: loadingEdit }] = useUpdateReplyMutation();
    const [deleteReply, { isLoading: loadingDelete }] = useDeleteReplyMutation();

    const models = [...new Set(accessory?.models?.map(m => m.modelName) || [])];
    const variants = [...new Set(accessory?.models?.flatMap(m => m.variants.map(v => v.name)) || [])];

    // Filter image
    const selectedModelObj = accessory?.models?.find(m => modelFilter === 'All' || m.modelName === modelFilter);
    const selectedVariantObj = selectedModelObj?.variants?.find(v => variantFilter === 'All' || v.name === variantFilter);
    const accessoryImage = selectedVariantObj?.images?.[0]?.url || accessory?.models?.[0]?.variants?.[0]?.images?.[0]?.url || '/placeholder.png';

    useEffect(() => {
        setPage(1);
        setAllReviews([]);
    }, [sort, modelFilter, variantFilter, ratingFilter, search]);

    useEffect(() => {
        if (!data) return;
        if (data.page === 1) {
            setAllReviews(data.reviews);
        } else {
            setAllReviews(prev => [...prev,...data.reviews]);
        }
    }, [data]);

    const customerPhotos = allReviews.flatMap((review) =>
        (review.images || []).map((img) => ({...img, reviewId: review._id }))
    );

    const handleVote = async (reviewId, type) => {
        if (!userInfo) return toast.error('Please login to vote');
        try {
            await voteReview({ slug, reviewId, type }).unwrap(); // CHANGED
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) return toast.error('Reply cannot be empty');
        try {
            if (editingReply === reviewId) {
                await updateReply({ slug, reviewId, replyId: editingReply, comment: replyText }).unwrap(); // CHANGED
                toast.success('Reply updated');
            } else {
                await replyToReview({ slug, reviewId, comment: replyText }).unwrap(); // CHANGED
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

    const handleDeleteReply = async (reviewId, replyId) => {
        if (window.confirm('Delete this admin reply?')) {
            try {
                await deleteReply({ slug, reviewId, replyId }).unwrap(); // CHANGED
                toast.success('Reply deleted');
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    const CustomDropdown = ({ value, onChange, options, label }) => {
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        useEffect(() => {
            const handleClickOutside = (e) => ref.current &&!ref.current.contains(e.target) && setOpen(false);
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
        return (
            <div ref={ref} className="relative w-full md:w-auto md:min-w-[160px]">
                <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white hover:border-gray-400 transition">
                    <span className="text-gray-900">{options.find((opt) => opt.value === value)?.label || label}</span>
                    <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open? 'rotate-180' : ''}`} />
                </button>
                {open && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border-gray-200 rounded-lg shadow-lg z-[60] max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 ${value === opt.value? 'bg-gray-100 font-medium' : ''}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (loadingAccessory) return <Loader />;
    if (errorAccessory) return <Message variant="danger">{errorAccessory?.data?.message || errorAccessory.error}</Message>;
    if (!accessory) return <Message>Accessory not found</Message>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Link to={`/accessory/${accessory.slug}`} className="text-blue-600 hover:text-blue-700 text-sm">← Back to Accessory</Link>
            <h1 className="text-4xl font-bold mt-3">Customer Reviews</h1>

            {/* SUMMARY CARD - same as product */}
            <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <img src={accessoryImage} alt={accessory.name} className="w-36 h-36 object-contain" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{accessory.name}</h2>
                        <div className="mt-2 flex items-center gap-3">
                            <Rating value={accessory.rating} />
                            <span className="text-gray-600">({accessory.numReviews} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RATING BREAKDOWN */}
            <div className="mt-8 bg-white border rounded-xl shadow-sm p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl font-bold">{accessory.rating?.toFixed(1)}</span>
                            <div>
                                <Rating value={accessory.rating} />
                                <p className="text-gray-500 mt-1">Based on {accessory.numReviews} reviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="p-3 sm:p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                <span className="text-sm text-gray-600">{data?.totalReviews || 0} reviews</span>
                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <CustomDropdown value={ratingFilter} onChange={setRatingFilter} options={[{label:"All Stars",value:""},{label:"5 Stars",value:"5"},{label:"4 Stars",value:"4"},{label:"3 Stars",value:"3"},{label:"2 Stars",value:"2"},{label:"1 Star",value:"1"}]} />
                    <CustomDropdown value={modelFilter} onChange={(val)=>{setModelFilter(val);setPage(1)}} options={[{label:'All Models',value:'All'},...models.map(m=>({label:m,value:m}))]} />
                    <CustomDropdown value={variantFilter} onChange={(val)=>{setVariantFilter(val);setPage(1)}} options={[{label:'All Variants',value:'All'},...variants.map(v=>({label:v,value:v}))]} />
                    <CustomDropdown value={sort} onChange={(val)=>{setSort(val);setPage(1)}} options={[{label:'Most Helpful',value:'helpful'},{label:'Newest',value:'newest'},{label:'Highest Rating',value:'highest'},{label:'Lowest Rating',value:'lowest'}]} />
                </div>
            </div>

            {/* REVIEWS LIST */}
            <div className="overflow-y-auto p-3 sm:p-4 flex-1">
                {isLoading? <Loader /> : error? <Message variant="danger">{error?.data?.message || error.error}</Message> : 
                allReviews.length === 0? <Message>No reviews yet</Message> :
                allReviews.map((review) => {
                    const hasMarkedHelpful = review.helpful?.includes(userInfo?._id);
                    const hasMarkedNotHelpful = review.notHelpful?.includes(userInfo?._id);
                    return (
                        <div key={review._id} className="border-b py-4 sm:py-6 last:border-b-0">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-semibold">{review.name}</span>
                                {review.verifiedPurchase && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"><FaCheck /> Verified</span>}
                                <span className="text-gray-500">{review.model} {review.variant && `/ ${review.variant}`} | {new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Rating value={review.rating} />
                            <h4 className="font-semibold mt-2">{review.title}</h4>
                            <p className="text-gray-800 mb-3">{review.comment}</p>
                            
                            {review.images?.length > 0 && <div className="flex gap-2 mb-3 flex-wrap">{review.images.map((img, idx) => <img key={idx} src={img.url} onClick={() => setSelectedImage(img.url)} className="w-20 h-20 object-contain border rounded bg-white p-1 cursor-pointer" />)}</div>}

                            {/* REPLIES */}
                            {review.replies?.map((reply) => (
                                <div key={reply._id} className="bg-blue-50 p-3 rounded mt-3 ml-6">
                                    <span className='bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-semibold'>Admin</span>
                                    <strong className='text-sm ml-2'>{reply.name}</strong>
                                    <p className='text-sm mt-1'>{reply.comment}</p>
                                    {userInfo?.isAdmin && <button onClick={()=>handleDeleteReply(review._id, reply._id)} className="text-red-600 text-xs mt-1"><FaTrash/></button>}
                                </div>
                            ))}

                            {/* ACTIONS */}
                            <div className="flex gap-4 mt-3">
                                <button onClick={()=>handleVote(review._id,'helpful')} className={`flex items-center gap-1 text-sm ${hasMarkedHelpful?'text-green-600':'text-gray-600'}`}><FaThumbsUp/> Helpful ({review.helpful?.length||0})</button>
                                <button onClick={()=>handleVote(review._id,'notHelpful')} className={`flex items-center gap-1 text-sm ${hasMarkedNotHelpful?'text-red-600':'text-gray-600'}`}><FaThumbsDown/> Not Helpful ({review.notHelpful?.length||0})</button>
                                {userInfo?.isAdmin && <button onClick={()=>setReplyingTo(review._id)} className="text-blue-600 text-sm"><FaReply/> Reply</button>}
                            </div>

                            {replyingTo === review._id && (
                                <div className="mt-3 ml-6">
                                    <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} className="w-full border p-2 rounded text-sm" rows={2}/>
                                    <button onClick={()=>handleReply(review._id)} disabled={loadingReply} className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded text-sm">{loadingReply?'Posting...':'Post Reply'}</button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {page < data?.totalPages && (
                <div className="flex justify-center mt-10">
                    <button onClick={()=>setPage(prev=>prev+1)} disabled={isFetching} className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black">
                        {isFetching?"Loading...":"Load More Reviews"}
                    </button>
                </div>
            )}

            {selectedImage && <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50" onClick={()=>setSelectedImage(null)}><img src={selectedImage} className="max-w-[90%] max-h-[90%] rounded-lg"/></div>}
        </div>
    );
};

export default AccessoryReviewsScreen;