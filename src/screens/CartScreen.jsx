import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../slices/cartSlice';
import { updateCartQty } from '../slices/cartSlice';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CartScreen() {
const { cartItems } = useSelector((state) => state.cart);
const { userInfo } = useSelector((state) => state.auth)
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const checkoutHandler = () => {
    if (!userInfo) {
      toast.info('Please sign in to checkout')
      navigate('/login?redirect=/shipping') // <- Login wall moved here
    } else {
      navigate('/shipping')
    }
  }


  const removeFromCartHandler = (item) => {
  dispatch(removeFromCart({ 
    product: item.product, // <- This is the product ID you stored in cart
    color: item.color 
  }));
};

  const updateQtyHandler = (item, qty) => {
  dispatch(updateCartQty({ 
    product: item.product, 
    color: item.color, 
    qty: Number(qty) 
  }));
};


  const cartSubtotal = cartItems?.reduce((acc, item) => acc + item.qty * item.price, 0);
  const cartItemsCount = cartItems?.reduce((acc, item) => acc + item.qty, 0);
return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen">
    <h1 className="text-2xl sm:text-3xl font-bold mb-6">Shopping Cart</h1>

    {cartItems?.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
        <FaShoppingCart className="text-gray-200 text-6xl sm:text-8xl mb-6" />
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our latest phones.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl hover:bg-blue-700 font-semibold inline-flex items-center gap-2"
        >
          <FaShoppingCart /> Continue Shopping
        </Link>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems?.map((item, index) => (
            <div 
              key={`${item.product || item._id}-${item.color || 'default'}-${index}`}
              className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-contain p-2" 
                />
              </div>

              <div className="flex-1 flex flex-col sm:flex-row sm:justify-between">
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/product/${item.product}`} 
                    className="font-semibold text-base sm:text-lg hover:text-blue-600 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">
                    Color: {item.color || 'Default'}
                  </p>
                  <p className="text-lg sm:text-xl font-bold mt-2">
                    ${item.price}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between mt-3 sm:mt-0 gap-3">
                  <select
                    value={item.qty}
                    onChange={(e) => updateQtyHandler(item, Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        Qty: {x + 1}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeFromCartHandler(item)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-gray-200">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                <span className="font-semibold text-gray-900">
                  ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
            </div>

            <div className="flex justify-between mb-6 text-lg font-bold border-t border-gray-200 pt-4">
              <span>Total</span>
              <span>
                ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
              </span>
            </div>

            <button
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition"
            >
              Proceed To Checkout
            </button>

            <Link 
              to="/" 
              className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-4 font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )}
  </div>
)
}

export default CartScreen;