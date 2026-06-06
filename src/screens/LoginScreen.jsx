import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../slices/authSlice'
import { clearCartItems, setCartItems } from '../slices/cartSlice'
import { toast } from 'react-toastify'
import axios from 'axios'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { search } = useLocation()

  const { userInfo, loading, error } = useSelector((state) => state.auth)

   const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/' // <- Get redirect or default to home

   useEffect(() => {
    if (userInfo) {
      navigate(redirect) // <- Changed from navigate('/') to navigate(redirect)
    }
  }, [navigate, userInfo, redirect])

 const submitHandler = async (e) => {
  e.preventDefault()
  try {
    await dispatch(login({ email, password })).unwrap()
    // Merge happens automatically in App.js useEffect
  } catch (err) {
    toast.error(err?.data?.message || err.message)
  }
}

  return (
   <div className='min-h-screen bg-gray-100 flex flex-col justify-center py-6 px-4 sm:px-6'>
      <div className='w-full max-w-md mx-auto'>
        <form onSubmit={submitHandler} className='bg-white p-6 sm:p-8 rounded-lg shadow-md'>
          <h2 className='text-2xl font-bold mb-6 text-gray-900'>Sign In</h2>
          
          <input
            type='email'
            required
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          <input
            type='password'
            required
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium'
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

          {error && <p className='text-red-500 mt-3 text-sm'>{error}</p>}
          
          <div className='mt-4 text-sm text-center'>
            New Customer? <Link to='/register' className='text-blue-500 hover:text-blue-600 font-medium'>Register</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginScreen


{/* <div className="mt-4">
        New Customer? <Link to="/register" className="text-blue-500">Register</Link>
      </div> */}