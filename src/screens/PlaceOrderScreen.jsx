import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder, resetOrder } from '../slices/orderSlice'
import { clearCartItems } from '../slices/cartSlice' 

const PlaceOrderScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { order, success, error, loading } = useSelector((state) => state.order)

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping')
    } else if (!cart.paymentMethod) {
      navigate('/payment')
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate])

  useEffect(() => {
    if (success) {
      navigate(`/order/${order._id}`)
      dispatch(clearCartItems())
      dispatch(resetOrder())
    }
  }, [success, navigate, dispatch, order])

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
  }

  // Don't mutate cart - create new variables
  const itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  )
  const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 10)
  const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)))
  const totalPrice = (
    Number(itemsPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2)

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      })
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps step1 step2 step3 step4 />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {/* Shipping */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Shipping</h2>
              <p>
                <span className="font-semibold">Address: </span>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </div>

            {/* Payment Method */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
              <p>
                <span className="font-semibold">Method: </span>
                {cart.paymentMethod}
              </p>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                  Your cart is empty
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <Link 
                          to={`/product/${item.product}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <div className="text-gray-700">
                        {item.qty} x ${item.price} = ${addDecimals(item.qty * item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Items</span>
                <span className="font-semibold">${itemsPrice}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">${shippingPrice}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${taxPrice}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={cart.cartItems.length === 0 || loading}
              onClick={placeOrderHandler}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// CheckoutSteps Component with Tailwind
const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <nav className="flex justify-center mb-8">
      <div className="flex space-x-2 md:space-x-4">
        <div className={`flex items-center ${step1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/login" className={step1 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Sign In</span>
            <span className="md:hidden">1</span>
          </Link>
        </div>
        <span className="text-gray-400">→</span>
        <div className={`flex items-center ${step2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/shipping" className={step2 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Shipping</span>
            <span className="md:hidden">2</span>
          </Link>
        </div>
        <span className="text-gray-400">→</span>
        <div className={`flex items-center ${step3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/payment" className={step3 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Payment</span>
            <span className="md:hidden">3</span>
          </Link>
        </div>
        <span className="text-gray-400">→</span>
        <div className={`flex items-center ${step4 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/placeorder" className={step4 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Place Order</span>
            <span className="md:hidden">4</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default PlaceOrderScreen