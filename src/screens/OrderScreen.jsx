import React, { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, payOrder, deliverOrder, resetPay, resetDeliver } from '../slices/orderSlice'

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

  const deliverHandler = () => {
    dispatch(deliverOrder(orderId))
  }
  const successPaymentHandler = () => {
    const paymentResult = {
      id: 'test_pay_' + Date.now(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: userInfo?.email || 'test@example.com',
    }
    dispatch(payOrder({ orderId, paymentResult }))
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (error) {
    return <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4'>{error}</div>
  }

  if (!order._id) {
    return <div className='p-4'>Order not found</div>
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Order {order._id}</h1>
      <div className='grid md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold mb-4'>Shipping</h2>
            <p><strong>Name:</strong> {order.user?.name}</p>
            <p><strong>Email:</strong> {order.user?.email}</p>
            <p>
              <strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
              {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
            </p>
            {order.isDelivered ? (
              <div className='mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
                Delivered on {order.deliveredAt && new Date(order.deliveredAt).toLocaleDateString()}
              </div>
            ) : (
              <div className='mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                Not Delivered
              </div>
            )}
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold mb-4'>Payment Method</h2>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            {order.isPaid ? (
              <div className='mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded'>
                Paid on {order.paidAt && new Date(order.paidAt).toLocaleDateString()}
                {order.paymentResult?.email_address && (
                  <div className='text-sm mt-1'>Email: {order.paymentResult.email_address}</div>
                )}
                {order.paymentResult?.id && (
                  <div className='text-sm mt-1'>Transaction ID: {order.paymentResult.id}</div>
                )}
              </div>
            ) : (
              <div className='mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                Not Paid
              </div>
            )}
          </div>

          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-xl font-semibold mb-4'>Order Items</h2>
            {!order.orderItems || order.orderItems.length === 0 ? (
              <div>Order is empty</div>
            ) : (
              <div className='space-y-4'>
                {order.orderItems.map((item) => (
                  <div key={item.product} className='flex items-center gap-4 border-b pb-4'>
                    <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded' />
                    <Link to={`/product/${item.product}`} className='flex-1 text-blue-600 hover:underline'>
                      {item.name}
                    </Link>
                    <div>{item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow h-fit'>
          <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
          <div className='space-y-2'>
            <div className='flex justify-between'><span>Items</span><span>${order.itemsPrice}</span></div>
            <div className='flex justify-between'><span>Shipping</span><span>${order.shippingPrice}</span></div>
            <div className='flex justify-between'><span>Tax</span><span>${order.taxPrice}</span></div>
            <div className='flex justify-between font-bold text-lg border-t pt-2'>
              <span>Total</span><span>${order.totalPrice}</span>
            </div>

            {!order.isPaid && userInfo && (
              <button
                onClick={successPaymentHandler}
                className='w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
              >
                Test Pay
              </button>
            )}

            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button
                onClick={deliverHandler}
                className='w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700'
              >
                Mark As Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderScreen