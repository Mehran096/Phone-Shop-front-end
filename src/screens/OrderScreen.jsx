import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaCopy, 
  FaHome, 
  FaCreditCard, 
  FaBox, 
  FaTruck,
  FaReceipt
} from 'react-icons/fa';
import {
  getOrderDetails,
  shipOrder,
  deliverOrder,
  resetShip,
  resetDeliver,
} from '../slices/orderSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const { order, loading, error, successShip, successDeliver } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

  const originalItemsPrice =
  order?.orderItems?.reduce(
    (acc, item) => acc + (item.originalPrice || item.price) * item.qty,
    0
  ) || 0;

const totalDiscount =
  order?.orderItems?.reduce(
    (acc, item) => acc + (item.discountAmount || 0) * item.qty,
    0
  ) || 0;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    if (!order || order._id !== orderId) {
      dispatch(getOrderDetails(orderId));
    }
    
    if (successShip) {
      toast.success('Order marked as shipped');
      dispatch(resetShip());
      dispatch(getOrderDetails(orderId));
    }
    
    if (successDeliver) {
      toast.success('Order marked as delivered');
      dispatch(resetDeliver());
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, order, navigate, userInfo, successShip, successDeliver]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order._id);
    toast.success('Order ID copied!');
  };

  const shipHandler = () => {
    if (!trackingNumber || !carrier) {
      toast.error('Please enter tracking number and carrier');
      return;
    }
    dispatch(shipOrder({ orderId, trackingNumber, carrier }));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(orderId));
  };

  const getOrderStatus = () => {
    if (order.isDelivered) return { text: 'Delivered', color: 'bg-green-100 text-green-800' };
    if (order.isShipped) return { text: 'Shipped', color: 'bg-blue-100 text-blue-800' };
    if (order.isPaid) return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Awaiting Payment', color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : !order || !order._id ? (
    <Loader />
  ) : (
    <>
      <Helmet>
        <title>Order Details | Phone-Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header + Copy ID */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium transition"
          >
            <FaArrowLeft /> Go Back
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order #{order._id.slice(-7).toUpperCase()}
            </h1>
            <button 
              onClick={copyOrderId}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline self-start sm:self-auto"
            >
              <FaCopy /> Copy Order ID
            </button>
          </div>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Shipping Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FaHome className="text-gray-600" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">{order.user?.name}</p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                <p className="text-gray-500 text-xs">Email: {order.user?.email}</p>
              </div>
              <div className="mt-4">
                {(() => {
                  const status = getOrderStatus();
                  const Icon = order.isDelivered ? FaTruck : order.isShipped ? FaTruck : FaBox;
                  return (
                    <div className={`flex items-center gap-2 p-3 rounded-md text-sm font-medium ${status.color}`}>
                      <Icon /> {status.text}
                      {order.isDelivered && ` on ${formatDate(order.deliveredAt)}`}
                      {order.isShipped && !order.isDelivered && ` on ${formatDate(order.shippedAt)}`}
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white p-5 rounded-lg shadow-sm border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-gray-600" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>
              <p className="text-sm text-gray-700"><strong>{order.paymentMethod}</strong></p>
              
              {order.isPaid ? (
                <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                  Paid on {formatDate(order.paidAt)}
                </div>
              ) : order.paymentMethod === 'COD' ? (
                <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm font-medium">
                  Pay when you receive your order
                </div>
              ) : (
                <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                  Payment Pending
                </div>
              )}
            </div>

            {/* FANTASY Order Items */}
            <div className="bg-white p-5 rounded-lg shadow-sm border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain rounded-xl bg-gray-50 p-2 border-gray-100" 
                        />
                      </div>
                      
                      {/* Details + Price */}
                      <div className="flex-1 flex-col justify-between">
                        <div>
                          <Link 
                            to={`/product/${item.slug}`} 
                            className="text-blue-600 hover:underline font-semibold text-sm sm:text-base line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1">
                            {item.color && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">Color: {item.color}</span>
                            )}
                            {item.storage && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">Storage: {item.storage}</span>
                            )}
                            <span className="bg-gray-100 px-2 py-0.5 rounded">Qty: {item.qty}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          {item.discountAmount > 0 && (
                            <>
                              <div className="text-sm text-gray-500 line-through">
                                Original: ${Number(item.originalPrice).toFixed(2)}
                              </div>

                              <div className="text-sm font-medium text-green-600">
                                Discount: -${Number(item.discountAmount).toFixed(2)}
                              </div>
                            </>
                          )}

                          <div className="flex items-end justify-between gap-2 sm:gap-3">
                            <span className="text-sm text-gray-600 whitespace-nowrap flex-shrink-0">
                              {item.qty} × ${Number(item.price).toFixed(2)} 
                            </span>

                            <span className="sm:text-lg font-bold text-gray-900">
                              ${(item.qty * item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1/3 Summary + Admin */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Order Summary Card - NO MOBILE STICKY */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl shadow-sm border-gray-200 lg:sticky lg:top-4">
              <div className="flex items-center gap-2 mb-4">
                <FaReceipt className="text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
  <span>Original Price</span>
  <span className="font-medium text-gray-900">
    ${originalItemsPrice}
  </span>
</div>

{totalDiscount > 0 && (
  <div className="flex justify-between text-green-600">
    <span>Discount</span>
    <span className="font-medium">
      ${totalDiscount}
    </span>
  </div>
)}
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-gray-900">${order.itemsPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">${order.shippingPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">${order.taxPrice?.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Order Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin: Ship Order Card */}
            {userInfo?.isAdmin && !order.isShipped && (
              <div className="bg-white p-5 rounded-xl shadow-sm border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaTruck className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Mark As Shipped</h2>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Carrier e.g. DHL, FedEx"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={shipHandler}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Shipping...' : 'Ship Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Admin: Mark As Delivered Card */}
            {userInfo?.isAdmin && order.isShipped && !order.isDelivered && (
              <div className="bg-white p-5 rounded-xl shadow-sm border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FaBox className="text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Mark As Delivered</h2>
                </div>
                <button
                  type="button"
                  onClick={deliverHandler}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Marking...' : 'Mark As Delivered'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderScreen;