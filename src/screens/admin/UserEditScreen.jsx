import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails, updateUser } from '../../slices/authSlice'

const UserEditScreen = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const { userDetails, loading, error, successUpdate } = useSelector((state) => state.auth)

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: 'auth/resetUserUpdate' })
      navigate('/admin/userlist')
    } else {
      if (!userDetails || userDetails._id!== id) {
        dispatch(getUserDetails(id))
      } else {
        setName(userDetails.name)
        setEmail(userDetails.email)
        setIsAdmin(userDetails.isAdmin)
      }
    }
  }, [userDetails, id, dispatch, navigate, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUser({ id, name, email, isAdmin }))
  }

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black outline-none"
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5"

  if (loading) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading user...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error}</div>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to="/admin/userlist" className="text-gray-400 hover:text-white text-sm inline-flex items-center gap-1">← Back to Users</Link>
      <h1 className="text-xl md:text-2xl font-bold text-white">Edit User</h1>

      <div className="bg-white text-gray-900 p-5 md:p-6 rounded-2xl shadow-sm border">
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className={labelClass}>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="John Doe"/>
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required placeholder="john@email.com"/>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Admin Access</p>
              <p className="text-xs text-gray-500">Give full admin panel access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="sr-only peer"/>
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <button type="submit" className="w-full py-3.5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition">
            Update User
          </button>
        </form>
      </div>
    </div>
  )
}

export default UserEditScreen