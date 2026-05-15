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
    <div className='container mx-auto px-4 py-8'>
      <div className='grid md:grid-cols-3 gap-8'>
        {/* Update Profile */}
        <div className='md:col-span-1'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-bold mb-6'>User Profile</h2>
            {message && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{message}</div>}
            {errorUpdate && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>{errorUpdate}</div>}
            {successUpdate && <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>Profile Updated</div>}
            
            <form onSubmit={submitHandler} className='space-y-4'>
              <div>
                <label className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
                <input 
                  type='text' 
                  className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
                <input 
                  type='email' 
                  className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
                <input 
                  type='password' 
                  className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                  placeholder='Enter new password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-gray-700 text-sm font-bold mb-2'>Confirm Password</label>
                <input 
                  type='password' 
                  className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button 
                type='submit' 
                className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700'
                disabled={loadingUpdate}
              >
                {loadingUpdate ? 'Updating...' : 'Update'}
              </button>
              <button 
                type='button'
                onClick={logoutHandler}
                className='w-full bg-red-600 text-white py-2 rounded hover:bg-red-700'
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* My Orders */}
        <div className='md:col-span-2'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-2xl font-bold mb-6'>My Orders</h2>
            {loadingOrders ? (
              <div className='flex justify-center items-center h-32'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              </div>
            ) : errorOrders ? (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>{errorOrders}</div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left text-gray-500'>
                  <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3'>ID</th>
                      <th className='px-4 py-3'>DATE</th>
                      <th className='px-4 py-3'>TOTAL</th>
                      <th className='px-4 py-3'>PAID</th>
                      <th className='px-4 py-3'>DELIVERED</th>
                      <th className='px-4 py-3'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders?.map((order) => (
                      <tr key={order._id} className='bg-white border-b hover:bg-gray-50'>
                        <td className='px-4 py-3'>{order._id?.substring(0, 8)}...</td>
                        <td className='px-4 py-3'>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className='px-4 py-3'>${order.totalPrice}</td>
                        <td className='px-4 py-3'>
                          {order.isPaid ? (
                            <span className='text-green-600 text-xs'>
                              {new Date(order.paidAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <FaTimes className='text-red-600' />
                          )}
                        </td>
                        <td className='px-4 py-3'>
                          {order.isDelivered ? (
                            <span className='text-green-600 text-xs'>
                              {new Date(order.deliveredAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <FaTimes className='text-red-600' />
                          )}
                        </td>
                        <td className='px-4 py-3'>
                          <Link to={`/order/${order._id}`}>
                            <button className='text-blue-600 hover:underline text-xs'>Details</button>
                          </Link>
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
    </div>
  )
}

export default ProfileScreen