import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listOrders, deleteOrder, resetDelete } from '../../slices/orderSlice'
import { FaSearch } from 'react-icons/fa'

const OrderListScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')

  const { orders, loading, error, successDelete, page, pages } = useSelector((state) => state.order)
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      const pageNumber = searchParams.get('page') || 1
      const searchKeyword = searchParams.get('keyword') || ''
      dispatch(listOrders({ pageNumber, keyword: searchKeyword }))
    } else {
      navigate('/login')
    }

    if (successDelete) {
      dispatch(resetDelete())
    } 

    setKeyword(searchParams.get('keyword') || '')
    
  }, [dispatch, userInfo, navigate, successDelete, searchParams])

  const deleteHandler = (id) => {
    if (window.confirm('Delete this order? This cannot be undone.')) {
      dispatch(deleteOrder(id))
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      setSearchParams({ keyword: keyword.trim(), page: 1 })  
    } else {
      setSearchParams({ page: 1 })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        
       <form onSubmit={submitHandler} className="flex w-full md:w-96">
    <div className='relative flex-1'>
      <input
        type="text"
        placeholder="Search by Order ID or User..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        //onFocus={() => setKeyword('')} // Clears when you click
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {keyword && (
        <button
          type="button"
          onClick={() => {
            setKeyword('')
            setSearchParams({ page: 1 })
          }}
          className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none z-10 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100'
        >
          ×
        </button>
      )}
    </div>
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
    >
      <FaSearch />
    </button>
  </form>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders?.filter(order => order !== null)?.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order._id.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name || 'Deleted User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.createdAt.substring(0, 10)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.isPaid ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ {order.paidAt.substring(0, 10)}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ✗ Not Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.isDelivered ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ {order.deliveredAt.substring(0, 10)}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ✗ Not Delivered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/order/${order._id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => deleteHandler(order._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders?.filter(order => order !== null)?.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{order.user?.name || 'Deleted User'}</h3>
                    <p className="text-xs text-gray-500">#{order._id.substring(0, 8)}</p>
                  </div>
                  <span className="font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{order.createdAt.substring(0, 10)}</p>
                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {order.isDelivered ? 'Delivered' : 'Not Delivered'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/order/${order._id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1 text-center"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => deleteHandler(order._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
         {/* Pagination */}
{pages > 1 && (
  <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
    <button
  onClick={() => setSearchParams({ keyword, page: 1 })}
  disabled={page === 1}
  className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
>
  « First
</button>
    <button
      onClick={() => setSearchParams({ keyword, page: page - 1 })}
      disabled={page === 1}
      className="px-4 py-2 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Prev
    </button>

    {/* Show only 5 pages max: current +/- 2 */}
    {[...Array(pages).keys()]
      .filter(x => x + 1 >= page - 2 && x + 1 <= page + 2)
      .map((x) => (
        <button
          key={x + 1}
          onClick={() => setSearchParams({ keyword, page: x + 1 })}
          className={`px-3 py-1 rounded ${
            x + 1 === page
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border hover:bg-gray-100'
          }`}
        >
          {x + 1}
        </button>
      ))
    }

    <button
      onClick={() => setSearchParams({ keyword, page: page + 1 })}
      disabled={page === pages}
      className="px-4 py-2 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
    <button
  onClick={() => setSearchParams({ keyword, page: pages })}
  disabled={page === pages}
  className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
>
  Last »
</button>

    <span className="text-sm text-gray-600 ml-4">
      Page {page} of {pages}
    </span>
  </div>
)}
        </>
      )}
    </div>
  )
}

export default OrderListScreen