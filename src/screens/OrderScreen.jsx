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
import { FaArrowLeft, FaCopy } from 'react-icons/fa'

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
    if (!order) return { text: 'Loading...', color: 'bg-gray-100 text-gray-800' }
    if (order.isDelivered) return { text: 'Delivered', color: 'bg-green-100 text-green-800' }
    if (order.isShipped) return { text: 'Shipped', color: 'bg-blue-100 text-blue-800' }
    if (order.isPaid) return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' }
    if (order.paymentMethod === 'COD') return { text: 'Awaiting Shipment', color: 'bg-orange-100 text-orange-800' }
    return { text: 'Awaiting Payment', color: 'bg-red-100 text-red-800' }
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

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id)
    toast.success('Order ID copied')
  }

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : !order || !order._id ? (
    <Loader />
  ) : (
    <div className="max-w-7xl mx-auto p-4">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition"
      >
        <FaArrowLeft /> Go Back
      </button>

      {/* Order Header - Short ID */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Order <span className="text-blue-600">#{order._id.slice(-8).toUpperCase()}</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-gray-500">ID: {order._id}</p>
          <button
            onClick={copyOrderId}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaCopy /> Copy
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Shipping</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Name:</strong> {order.user?.name}</p>
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${order.user?.email}`} className="text-blue-600 hover:underline">
                  {order.user?.email}
                </a>
              </p>
              <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
              <p>
                <strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
                {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
              </p>
            </div>
            {order.isDelivered ? (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm">
                Delivered on {formatDate(order.deliveredAt)}
              </div>
            ) : (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm">
                Not Delivered
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <p className="text-gray-700 mb-3">
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            {order.isPaid ? (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-md text-sm">
                Paid on {formatDate(order.paidAt)}
              </div>
            ) : order.paymentMethod === 'COD' ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-sm">
                Pay when you receive your order
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm">
                Not Paid
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            {order.orderItems.length === 0 ? (
              <Message>Order is empty</Message>
            ) : (
              <div className="divide-y">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <Link to={`/product/${item.product}`} className="text-blue-600 hover:underline font-medium">
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-right text-gray-700">
                      {item.qty} x ${item.price} = <strong>${(item.qty * item.price).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="flex justify-between items-center mb-4">
              <span>Status:</span>
              {(() => {
                const status = getOrderStatus()
                return (
                  <span className={`${status.color} px-3 py-1 rounded-full text-sm font-medium`}>
                    {status.text}
                  </span>
                )
              })()}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Items</span>
                <span>${order.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxPrice?.toFixed(2)}</span>
              </div>
            </div>
            
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>

          {/* Admin: Ship Order */}
          {userInfo?.isAdmin && !order.isShipped && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Mark As Shipped</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={shipHandler}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Shipping...' : 'Ship Order'}
                </button>
              </div>
            </div>
          )}

          {/* Admin: Mark As Delivered - Fixed with card wrapper */}
          {userInfo?.isAdmin && order.isShipped && !order.isDelivered && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Mark As Delivered</h2>
              <button
                type="button"
                onClick={deliverHandler}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Marking...' : 'Mark As Delivered'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderScreen