import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../slices/authSlice'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userInfo, loading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    if (userInfo) {
      navigate('/')
    }
  }, [navigate, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault()
    dispatch(login({ email, password }))
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