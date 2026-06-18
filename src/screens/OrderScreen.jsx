import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  getOrderDetails,
  shipOrder,
  deliverOrder,
  resetShip,
  resetDeliver,
} from '../slices/orderSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'

const OrderScreen = () => {
  const { id: orderId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')

  const { order, loading, error, successShip, successDeliver } = useSelector(
    (state) => state.order
  )
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
      return
    }

    if (successShip) {
      toast.success('Order shipped')
      dispatch(resetShip())
    }

    if (successDeliver) {
      toast.success('Order delivered')
      dispatch(resetDeliver())
    }

    if (!order || order._id !== orderId) {
      dispatch(getOrderDetails(orderId))
    }
  }, [dispatch, orderId, order, userInfo, navigate, successShip, successDeliver])

  const getOrderStatus = () => {
    if (!order) return { text: 'Loading...', color: 'gray' }
    if (order.isDelivered) return { text: 'Delivered', color: 'green' }
    if (order.isShipped) return { text: 'Shipped', color: 'blue' }
    if (order.isPaid) return { text: 'Processing', color: 'yellow' }
    if (order.paymentMethod === 'COD') return { text: 'Awaiting Shipment', color: 'orange' }
    return { text: 'Awaiting Payment', color: 'red' }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const shipHandler = () => {
    if (!trackingNumber || !carrier) {
      toast.error('Please enter tracking number and carrier')
      return
    }
    dispatch(shipOrder({ orderId, trackingNumber, carrier }))
  }

  const deliverHandler = () => {
    dispatch(deliverOrder(orderId))
  }

  // FIX 1: Added !order check here
  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : !order || !order._id ? (
    <Loader />
  ) : (
    <>
      <div className='max-w-7xl mx-auto p-4'>
        <Link to='/admin/orderlist' className='btn btn-light mb-4'>
          Go Back
        </Link>

        <h1 className='text-2xl font-bold mb-6'>Order {order._id}</h1>

        <div className='grid md:grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='md:col-span-2'>
            <div className='bg-white p-6 rounded-lg shadow mb-6'>
              <h2 className='text-xl font-semibold mb-4'>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user?.name}
              </p>
              <p>
                <strong>Email: </strong>
                <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {formatDate(order.deliveredAt)}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </div>

            <div className='bg-white p-6 rounded-lg shadow mb-6'>
              <h2 className='text-xl font-semibold mb-4'>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {formatDate(order.paidAt)}</Message>
              ) : order.paymentMethod === 'COD' ? (
                <Message variant='warning'>Pay when you receive your order</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </div>

            <div className='bg-white p-6 rounded-lg shadow'>
              <h2 className='text-xl font-semibold mb-4'>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <div className='divide-y'>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className='flex items-center py-4'>
                      <div className='w-16 h-16 flex-shrink-0'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover rounded'
                        />
                      </div>
                      <div className='flex-1 ml-4'>
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </div>
                      <div className='text-right'>
                        {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className='bg-white p-6 rounded-lg shadow'>
              <h2 className='text-xl font-semibold mb-4'>Order Summary</h2>
              
              <div className='flex justify-between items-center mb-4'>
                <span>Status:</span>
                {(() => {
                  const status = getOrderStatus()
                  const colorMap = {
                    green: 'bg-green-100 text-green-800',
                    blue: 'bg-blue-100 text-blue-800',
                    yellow: 'bg-yellow-100 text-yellow-800',
                    orange: 'bg-orange-100 text-orange-800',
                    red: 'bg-red-100 text-red-800',
                    gray: 'bg-gray-100 text-gray-800',
                  }
                  return (
                    <span className={`${colorMap[status.color]} px-3 py-1 rounded-full text-sm font-medium`}>
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

              {/* Ship Order - Admin Only */}
              {userInfo?.isAdmin && !order.isShipped && (
                <div className='space-y-2 mb-3'>
                  <input
                    type='text'
                    placeholder='Tracking Number'
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className='w-full border rounded px-3 py-2'
                  />
                  <input
                    type='text'
                    placeholder='Carrier'
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className='w-full border rounded px-3 py-2'
                  />
                  <button
                    type='button'
                    onClick={shipHandler}
                    className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50'
                    disabled={loading}
                  >
                    {loading ? 'Shipping...' : 'Ship Order'}
                  </button>
                </div>
              )}

              {/* Deliver Order - Admin Only */}
              {userInfo?.isAdmin && order.isShipped && !order.isDelivered && (
                <button
                  type='button'
                  onClick={deliverHandler}
                  className='w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-3 transition disabled:opacity-50'
                  disabled={loading}
                >
                  {loading ? 'Marking...' : 'Mark As Delivered'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderScreen