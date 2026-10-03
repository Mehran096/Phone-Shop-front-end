import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listUsers, deleteUser } from '../../slices/authSlice'
import { FaTrash, FaEdit, FaUserShield, FaUser, FaSearch } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../../utils/axios'

const UserListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('keyword') || '')

  const keyword = searchParams.get('keyword') || ''
  const pageNumber = Number(searchParams.get('pageNumber')) || 1

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { users, userInfo, loading, error, page, pages, successDelete } = useSelector((state) => state.auth)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers({ keyword, pageNumber }))
    } else {
      navigate('/login')
    }
  }, [dispatch, navigate, userInfo, keyword, pageNumber, successDelete])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id))
    }
  }

  const toggleAdminHandler = async (id, isAdmin) => {
    if (window.confirm(`Are you sure you want to ${isAdmin? 'remove admin' : 'make admin'}?`)) {
      try {
        await api.put(`/users/${id}/toggleAdmin`, {}, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        toast.success('Admin status updated')
        dispatch(listUsers({ keyword, pageNumber }))
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message)
      }
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (search.trim()) setSearchParams({ keyword: search, pageNumber: 1 })
    else setSearchParams({ pageNumber: 1 })
  }

  const onPageChange = (pageNum) => {
    if (keyword) setSearchParams({ keyword, pageNumber: pageNum })
    else setSearchParams({ pageNumber: pageNum })
  }

  if (loading) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading users...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error}</div>

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-white text-gray-900 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Users ({users?.length || 0})</h1>
          <form onSubmit={submitHandler} className="flex w-full lg:w-96">
            <div className='relative flex-1'>
              <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search by name or email...'
                className='w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-l-xl text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none' />
              {search && (
                <button type='button' onClick={() => { setSearch(''); setSearchParams({ pageNumber: 1 }) }}
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 flex items-center justify-center'>×</button>
              )}
            </div>
            <button type='submit' className='bg-black text-white px-4 rounded-r-xl hover:bg-gray-800'><FaSearch/></button>
          </form>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className='hidden md:block bg-white text-gray-900 rounded-2xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='bg-gray-50'><tr className='text-left text-xs text-gray-500 uppercase'>
              <th className='px-6 py-3'>ID</th><th className='px-6 py-3'>Name</th><th className='px-6 py-3'>Email</th><th className='px-6 py-3'>Admin</th><th className='px-6 py-3 text-right'>Actions</th>
            </tr></thead>
            <tbody className='divide-y'>
              {users.map((user) => (
                <tr key={user._id} className='hover:bg-gray-50 text-sm text-gray-900'>
                  <td className='px-6 py-4 font-mono text-xs'>{user._id.substring(0, 10)}...</td>
                  <td className='px-6 py-4 font-semibold'>{user.name}</td>
                  <td className='px-6 py-4 text-gray-600'><a href={`mailto:${user.email}`} className="hover:text-black">{user.email}</a></td>
                  <td className='px-6 py-4'>
                    <button onClick={() => toggleAdminHandler(user._id, user.isAdmin)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.isAdmin? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.isAdmin? <FaUserShield /> : <FaUser />}{user.isAdmin? 'Admin' : 'User'}
                    </button>
                  </td>
                  <td className='px-6 py-4 text-right space-x-2'>
                    <Link to={`/admin/user/${user._id}/edit`} className='inline-flex bg-gray-100 hover:bg-black hover:text-white p-2 rounded-lg transition'><FaEdit /></Link>
                    <button disabled={user._id === userInfo._id} onClick={() => deleteHandler(user._id)} className='bg-red-50 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-lg transition disabled:opacity-40'><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden grid gap-3">
        {users.map((user) => (
          <div key={user._id} className="bg-white text-gray-900 rounded-2xl p-4 shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div><h3 className="font-bold text-gray-900 text-sm">{user.name}</h3><p className="text-xs text-gray-500">{user.email}</p><p className="text-[10px] text-gray-400 font-mono mt-1">#{user._id.substring(0,8)}</p></div>
              <button onClick={() => toggleAdminHandler(user._id, user.isAdmin)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isAdmin? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{user.isAdmin? 'Admin' : 'User'}</button>
            </div>
            <div className="flex gap-2 mt-3">
              <Link to={`/admin/user/${user._id}/edit`} className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm text-center">Edit</Link>
              <button disabled={user._id === userInfo._id} onClick={() => deleteHandler(user._id)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm disabled:opacity-40">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pages > 1 && (
        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-sm flex flex-wrap justify-center gap-2">
          {[...Array(pages).keys()].map(x => (
            <button key={x+1} onClick={()=>onPageChange(x+1)} className={`px-3 py-1.5 rounded-xl text-sm ${x+1===page? 'bg-black text-white' : 'bg-white border text-gray-700'}`}>{x+1}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserListScreen