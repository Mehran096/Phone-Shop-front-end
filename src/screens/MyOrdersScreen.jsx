import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listMyOrders } from '../slices/orderSlice'
import { FaTimes } from 'react-icons/fa'

const MyOrdersScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo } = useSelector((state) => state.auth) // ← Changed from state.userLogin
  const { myOrders, loading, error } = useSelector((state) => state.order)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      dispatch(listMyOrders())
    }
  }, [dispatch, navigate, userInfo])

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6 text-gray-800'>My Orders</h1>
      
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
        </div>
      ) : error ? (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      ) : myOrders.length === 0 ? (
        <div className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded'>
          You have no orders yet
        </div>
      ) : (
        <div className='overflow-x-auto shadow-md rounded-lg'>
          <table className='w-full text-sm text-left text-gray-500'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
              <tr>
                <th scope='col' className='px-6 py-3'>ID</th>
                <th scope='col' className='px-6 py-3'>DATE</th>
                <th scope='col' className='px-6 py-3'>TOTAL</th>
                <th scope='col' className='px-6 py-3'>PAID</th>
                <th scope='col' className='px-6 py-3'>DELIVERED</th>
                <th scope='col' className='px-6 py-3'></th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order._id} className='bg-white border-b hover:bg-gray-50'>
                  <td className='px-6 py-4 font-medium text-gray-900'>
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className='px-6 py-4'>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4'>${order.totalPrice}</td>
                  <td className='px-6 py-4'>
                    {order.isPaid ? (
                      <span className='text-green-600 font-medium'>
                        {new Date(order.paidAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <FaTimes className='text-red-600' />
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    {order.isDelivered ? (
                      <span className='text-green-600 font-medium'>
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <FaTimes className='text-red-600' />
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <Link to={`/order/${order._id}`}>
                      <button className='font-medium text-blue-600 hover:underline'>
                        Details
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MyOrdersScreen