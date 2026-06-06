import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserProfile } from '../slices/authSlice'
import { listMyOrders } from '../slices/orderSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { toast } from 'react-toastify'

const ProfileScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo, loading: loadingUpdate, error: errorUpdate } =
    useSelector((state) => state.auth)
  const { myOrders, loading: loadingOrders, error: errorOrders } =
    useSelector((state) => state.order)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      setName(userInfo.name)
      setEmail(userInfo.email)
      dispatch(listMyOrders())
    }
  }, [dispatch, navigate, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    try {
      const userData = { id: userInfo._id, name, email }
      if (password) userData.password = password // Only send if changed

      await dispatch(updateUserProfile(userData)).unwrap()
      toast.success('Profile updated successfully')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err || 'Update failed')
      toast.error(err || 'Update failed')
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>My Account</h1>

      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Left: Profile Card */}
        <div className='lg:col-span-1'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>Update Profile</h2>

            {message && <Message variant='danger'>{message}</Message>}
            {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

            <form onSubmit={submitHandler} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name</label>
                <input
                  type='text'
                  placeholder='Enter name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Email Address</label>
                <input
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>New Password</label>
                <input
                  type='password'
                  placeholder='Leave blank to keep current'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Confirm Password</label>
                <input
                  type='password'
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <button
                type='submit'
                disabled={loadingUpdate}
                className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition'
              >
                {loadingUpdate ? <Loader /> : 'Update'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Orders Table */}
        <div className='lg:col-span-2'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>My Orders</h2>

            {loadingOrders ? (
              <Loader />
            ) : errorOrders ? (
              <Message variant='danger'>{errorOrders}</Message>
            ) : myOrders?.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-500 mb-4'>You haven't placed any orders yet</p>
                <Link to='/' className='text-blue-600 hover:underline font-medium'>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-100'>
                    <tr>
                      <th className='px-4 py-3 text-left font-medium text-gray-600 uppercase text-xs'>Order</th>
                      <th className='px-4 py-3 text-left font-medium text-gray-600 uppercase text-xs'>Date</th>
                      <th className='px-4 py-3 text-left font-medium text-gray-600 uppercase text-xs'>Total</th>
                      <th className='px-4 py-3 text-left font-medium text-gray-600 uppercase text-xs'>Status</th>
                      <th className='px-4 py-3'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {myOrders.map((order, index) => (
                      <tr key={order._id} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 font-medium'>#{1001 + index}</td>
                        <td className='px-4 py-3 text-gray-600'>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className='px-4 py-3 font-medium'>${order.totalPrice.toFixed(2)}</td>
                        <td className='px-4 py-3'>
                          {order.isDelivered ? (
                            <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                              Delivered
                            </span>
                          ) : order.isPaid ? (
                            <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                              Shipped
                            </span>
                          ) : (
                            <span className='bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium'>
                              Processing
                            </span>
                          )}
                        </td>
                        <td className='px-4 py-3'>
                          <button
                            className='text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline'
                            onClick={() => navigate(`/order/${order._id}`)}
                          >
                            View Details
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
    </div>
  )
}

export default ProfileScreen