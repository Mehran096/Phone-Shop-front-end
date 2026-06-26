import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearCartItems, resetCart } from '../slices/cartSlice'
import { createCheckoutSession, createOrder, resetOrder } from '../slices/orderSlice'
import CheckoutSteps from '../components/CheckoutSteps'
import Message from '../components/Message'
import { toast } from 'react-toastify'

const PlaceOrderScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [orderPlaced, setOrderPlaced] = useState(false)

  const cart = useSelector((state) => state.cart)
  const { order, success, error, loading } = useSelector((state) => state.order)

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
  }

  // Calculate prices
const itemsPrice = addDecimals(
  cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
)
const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 10)

// FIX: Tax only for COD
const taxPrice = addDecimals(
  cart.paymentMethod === 'COD' ? Number((0.15 * itemsPrice).toFixed(2)) : 0
)

const totalPrice = addDecimals(Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice))

 useEffect(() => {
  if (!cart.paymentMethod) {
    navigate('/payment')
  }
  // REMOVED shippingAddress check - causes redirect loop after order success
}, [cart.paymentMethod, navigate])

//   useEffect(() => {
//   if (success && order && orderPlaced) {
//     if (order.paymentMethod === 'COD') {
//       navigate(`/order/${order._id}`) // NAVIGATE FIRST
//       dispatch(clearCartItems())      // CLEAR AFTER
//       dispatch(resetCart())
//       dispatch(resetOrder())
//     }
//   }
//   // Stripe: redirect handled in placeOrderHandler
// }, [success, order, orderPlaced, navigate, dispatch])

 const placeOrderHandler = async () => {
  try {
    const orderData = {
      orderItems: cart.cartItems.map((item) => ({
        product: item.product,
        
        qty: item.qty, 
         
        color: item.color,
        hexCode: item.hexCode,
      })),
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    }

    if (cart.paymentMethod === 'COD') {
      //console.log('Sending to backend:', orderData.orderItems)
      const newOrder = await dispatch(createOrder(orderData)).unwrap() // CAPTURE THE RESPONSE
      //console.log('Order created:', newOrder) // This will show the _id
      
      navigate(`/order/${newOrder._id}`) // NAVIGATE USING THE RESPONSE
      dispatch(clearCartItems())         // CLEAR AFTER NAVIGATE
      dispatch(resetOrder())             // RESET ORDER STATE
    } else if (cart.paymentMethod === 'Stripe') {
      const session = await dispatch(createCheckoutSession(orderData)).unwrap()
      window.location.href = session.url // Redirect to Stripe
    } else {
      toast.error('Please select a payment method')
    }
  } catch (err) {
    toast.error(err?.data?.message || err.error || 'Failed to place order')
  }
}

  return (
    <>
    {/* seo start */}
           <Helmet>
                <title>PlaceOrder | Phone-Store</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
        {/* seo end*/}
      
      <div className='container mx-auto px-4 py-8'>
        <CheckoutSteps step1 step2 step3 step4 />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Shipping */}
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-bold mb-4'>Shipping</h2>
              <p>
                <span className='font-semibold'>Address: </span>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
            </div>

            {/* Payment Method */}
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-bold mb-4'>Payment Method</h2>
              <p><strong>Method: </strong>{cart.paymentMethod}</p>
            </div>

            {/* Order Items */}
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-2xl font-bold mb-4'>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <div className='space-y-4'>
                  {cart.cartItems.map((item) => (
                    <div key={`${item.product}-${item.color}`} className='flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0'>
                      <div className='w-16 h-16 flex-shrink-0'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover rounded'
                        />
                      </div>
                      <div className='flex-1'>
                        <Link
                          to={`/product/${item.slug}`}
                          className='text-blue-600 hover:text-blue-800 font-medium'
                        >
                          {item.name}
                        </Link>
                        {item.color && (
                          <p className='text-sm text-gray-500'>Color: {item.color}</p>
                        )}
                      </div>
                      <div className='text-gray-700'>
                        {item.qty} x ${item.price} = ${addDecimals(item.qty * item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-md p-6 sticky top-4'>
              <h2 className='text-2xl font-bold mb-6'>Order Summary</h2>
              
              <div className='space-y-3 mb-6'>
                <div className='flex justify-between pb-3 border-b border-gray-200'>
                  <span className='text-gray-600'>Items</span>
                  <span className='font-semibold'>${itemsPrice}</span>
                </div>
                <div className='flex justify-between pb-3 border-b border-gray-200'>
                  <span className='text-gray-600'>Shipping</span>
                  <span className='font-semibold'>${shippingPrice}</span>
                </div>
                <div className='flex justify-between pb-3 border-b border-gray-200'>
                  <span className='text-gray-600'>Tax</span>
                  <span className='font-semibold'>${taxPrice}</span>
                </div>
                <div className='flex justify-between pt-3'>
                  <span className='text-lg font-bold'>Total</span>
                  <span className='text-lg font-bold'>${totalPrice}</span>
                </div>
              </div>

              {error && <Message variant='danger'>{error}</Message>}

               {cart.paymentMethod === 'Stripe' && (
          <p className="text-xs text-gray-500 mb-3 text-center">
            You'll be redirected to Stripe to complete payment
          </p>
        )}

        <button
          type='button'
          disabled={cart.cartItems.length === 0 || loading}
          onClick={placeOrderHandler}
          className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition'
        >
          {loading ? 'Processing...' : cart.paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
        </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PlaceOrderScreen