import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserProfile, logout } from '../slices/authSlice'
import { listMyOrders } from '../slices/orderSlice'
import { FaTimes } from 'react-icons/fa'

const ProfileScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo, loading: loadingUpdate, error: errorUpdate, success: successUpdate } = useSelector((state) => state.auth)
  const { myOrders, loading: loadingOrders, error: errorOrders } = useSelector((state) => state.order)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      setName(userInfo.name)
      setEmail(userInfo.email)
      dispatch(listMyOrders())
    }
  }, [dispatch, userInfo, navigate, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
    } else {
      setMessage(null)
      dispatch(updateUserProfile({ id: userInfo._id, name, email, password }))
    }
  }

  const logoutHandler = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
  <div className='container mx-auto px-4 py-6'>
    
    <h1 className='text-2xl md:text-3xl font-bold mb-6'>Profile</h1>

    {message && <div className='bg-red-100 text-red-700 p-3 rounded mb-4'>{message}</div>}
    {errorUpdate && <div className='bg-red-100 text-red-700 p-3 rounded mb-4'>{errorUpdate}</div>}
    {successUpdate && <div className='bg-green-100 text-green-700 p-3 rounded mb-4'>Profile Updated</div>}

    {/* Stack on mobile, 2 columns on desktop */}
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      
      {/* Left: Profile Form */}
      <div className='lg:col-span-1 bg-white p-5 rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>User Profile</h2>
        
        <form onSubmit={submitHandler}>
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Password</label>
            <input
              type='password'
              placeholder='Enter new password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Confirm Password</label>
            <input
              type='password'
              placeholder='Confirm new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <button
            type='submit'
            disabled={loadingUpdate}
            className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-2'
          >
            Update
          </button>

          <button
            type='button'
            onClick={() => {
              dispatch(logout())
              navigate('/login')
            }}
            className='w-full bg-red-600 text-white py-2 rounded hover:bg-red-700'
          >
            Logout
          </button>
        </form>
      </div>

      {/* Right: Orders Table */}
      <div className='lg:col-span-2'>
        <h2 className='text-xl font-semibold mb-4'>My Orders</h2>
        
        {loadingOrders? (
          <p>Loading...</p>
        ) : errorOrders? (
          <div className='bg-red-100 text-red-700 p-3 rounded'>{errorOrders}</div>
        ) : (
          <div className='overflow-x-auto bg-white rounded-lg shadow'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-3 text-left'>ID</th>
                  <th className='px-4 py-3 text-left'>DATE</th>
                  <th className='px-4 py-3 text-left'>TOTAL</th>
                  <th className='px-4 py-3 text-left'>PAID</th>
                  <th className='px-4 py-3 text-left'>DELIVERED</th>
                  <th className='px-4 py-3'></th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order._id} className='border-t hover:bg-gray-50'>
                    <td className='px-4 py-3 truncate max-w-[100px]'>{order._id}</td>
                    <td className='px-4 py-3'>{order.createdAt.substring(0, 10)}</td>
                    <td className='px-4 py-3'>${order.totalPrice}</td>
                    <td className='px-4 py-3'>
                      {order.isPaid? (
                        <span className='text-green-600'>{order.paidAt.substring(0, 10)}</span>
                      ) : (
                        <span className='text-red-600'><FaTimes /></span>
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      {order.isDelivered? (
                        <span className='text-green-600'>{order.deliveredAt.substring(0, 10)}</span>
                      ) : (
                        <span className='text-red-600'><FaTimes /></span>
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        className='bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300'
                        onClick={() => navigate(`/order/${order._id}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
)
}

export default ProfileScreen