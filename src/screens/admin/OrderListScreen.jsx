import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listOrders, deleteOrder, resetDelete } from '../../slices/orderSlice' 
import { FaTimes, FaCheck } from 'react-icons/fa'

const OrderListScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { orders, loading, error, successDelete } = useSelector((state) => state.order)
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders())
    } else {
      navigate('/login')
    }

    if (successDelete) {
      dispatch(resetDelete())
    }

  }, [dispatch, userInfo, navigate, successDelete])

  const deleteHandler = (id) => {
    if (window.confirm('Delete this order? This cannot be undone.')) {
      dispatch(deleteOrder(id))
    }
  }

 return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Orders</h1>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                USER
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                TOTAL
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                PAID
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                DELIVERED
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  {order._id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                  {order.user ? order.user.name : 'Guest / Deleted'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.createdAt.substring(0, 10)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${order.totalPrice.toFixed(2)}
                </td>
                
                {/* PAID Status */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {order.isPaid ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheck className="mr-1" /> {order.paidAt.substring(0, 10)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaTimes className="mr-1" /> Not Paid
                    </span>
                  )}
                </td>
                
                {/* DELIVERED Status */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {order.isDelivered ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FaCheck className="mr-1" /> {order.deliveredAt.substring(0, 10)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaTimes className="mr-1" /> Not Delivered
                    </span>
                  )}
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                  <button
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-xs font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => deleteHandler(order._id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderListScreen