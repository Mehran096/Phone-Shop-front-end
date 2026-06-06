import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, payOrder, deliverOrder, resetPay, resetDeliver } from '../slices/orderSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { toast } from 'react-toastify'

const OrderScreen = () => {
  const { id: orderId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { order = {}, loading, error, successPay, successDeliver } = useSelector((state) => state.order)
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
      return
    }

    if (!order._id || successPay || successDeliver || order._id !== orderId) {
      dispatch(resetPay())
      dispatch(resetDeliver())
      dispatch(getOrderDetails(orderId))
    }
  }, [dispatch, orderId, successPay, successDeliver, order._id, userInfo, navigate])

  useEffect(() => { 
    if (successDeliver) toast.success('Order marked as delivered')
  }, [successDeliver])

  const deliverHandler = async () => {
    try {
      await dispatch(deliverOrder(orderId)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to mark as delivered')
    }
  }

  const successPaymentHandler = async () => {
    const paymentResult = {
      id: 'test_pay_' + Date.now(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: userInfo?.email || 'test@example.com',
    }
    try {
      await dispatch(payOrder({ orderId, paymentResult })).unwrap()
    } catch (err) {
      toast.error(err || 'Payment failed')
    }
  }

  const getOrderNumber = (id) => {
    if (!id) return ''
    return parseInt(id.substring(0, 8), 16) % 9000 + 1001
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getOrderStatus = () => {
    if (order.isDelivered) return { text: 'Delivered', color: 'green' }
    if (order.isPaid) return { text: 'Shipped', color: 'blue' }
    if (order.paymentMethod === 'Cash on Delivery') return { text: 'Processing', color: 'yellow' }
    return { text: 'Awaiting Payment', color: 'red' }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (error) return <Message variant='danger'>{error}</Message>
  if (!order._id) return <Message variant='danger'>Order not found</Message>

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-2'>Order #{getOrderNumber(order._id)}</h1>
      <p className='text-gray-500 mb-6'>Placed on {formatDate(order.createdAt)}</p>

      <div className='grid md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          {/* Shipping Card */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>Shipping</h2>
            <p className='mb-2'><strong>Name:</strong> {order.user?.name}</p>
            <p className='mb-2'><strong>Email:</strong> {order.user?.email}</p>
            <p className='mb-4'>
              <strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
              {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
            </p>
            {order.isDelivered ? (
              <Message variant='success'>Delivered on {formatDate(order.deliveredAt)}</Message>
            ) : (
              <Message variant='info'>Order is being processed</Message>
            )}
          </div>

          {/* Payment Card */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>Payment Method</h2>
            <p className='mb-4'><strong>Method:</strong> {order.paymentMethod}</p>
            {order.isPaid ? (
              <div className='space-y-2'>
                <Message variant='success'>Paid on {formatDate(order.paidAt)}</Message>
                {order.paymentResult?.email_address && (
                  <p className='text-sm text-gray-600'>Email: {order.paymentResult.email_address}</p>
                )}
                {order.paymentResult?.id && (
                  <p className='text-sm text-gray-600'>Transaction ID: {order.paymentResult.id}</p>
                )}
              </div>
            ) : order.paymentMethod === 'Cash on Delivery' ? (
              <Message variant='warning'>Pay when you receive your order</Message>
            ) : (
              <Message variant='danger'>Not Paid</Message>
            )}
          </div>

          {/* Order Items Card */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>Order Items</h2>
            {!order.orderItems || order.orderItems.length === 0 ? (
              <Message>Order is empty</Message>
            ) : (
              <div className='space-y-4'>
                {order.orderItems.map((item) => (
                  <div key={item.product} className='flex items-center gap-4 border-b pb-4 last:border-b-0'>
                    <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded' />
                    <div className='flex-1'>
                      <Link to={`/product/${item.product}`} className='text-blue-600 hover:underline font-medium'>
                        {item.name}
                      </Link>
                    </div>
                    <div className='text-gray-700'>
                      {item.qty} x ${item.price} = <strong>${(item.qty * item.price).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className='md:col-span-1'>
          <div className='bg-white p-6 rounded-lg shadow-md h-fit'>
            <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
            
            <div className='mb-4'>
              {(() => {
                const status = getOrderStatus()
                return (
                  <span className={`bg-${status.color}-100 text-${status.color}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                    {status.text}
                  </span>
                )
              })()}
            </div>

            <div className='space-y-2 mb-6'>
              <div className='flex justify-between'>
                <span>Items</span>
                <span>${order.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Shipping</span>
                <span>${order.shippingPrice?.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Tax</span>
                <span>${order.taxPrice?.toFixed(2)}</span>
              </div>
              <hr className='my-2' />
              <div className='flex justify-between font-bold text-lg'>
                <span>Total</span>
                <span>${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>

            {userInfo?.isAdmin && !order.isPaid && (
              <button
                type='button'
                onClick={successPaymentHandler}
                className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-3 transition disabled:opacity-50'
              >
                Mark as Paid
              </button>
            )}

            {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
              <button
                type='button'
                onClick={deliverHandler}
                className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50'
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderScreen