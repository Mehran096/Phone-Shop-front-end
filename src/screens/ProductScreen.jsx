import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../slices/productSlice'
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function ProductScreen() {
    const [qty, setQty] = useState(1);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { product, loading, error } = useSelector((state) => state.products);
    const { userInfo } = useSelector((state) => state.auth)

    useEffect(() => {
        dispatch(getProductDetails(id))
    }, [dispatch, id])

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

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full object-contain" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-2">{product.brand}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
                    <p className="mb-4">{product.description}</p>
                    <div className="mb-4">
                        <span className="font-semibold">Rating:</span> {product.rating} ({product.numReviews} reviews)
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
        </div>
    );
}

export default ProductScreen;