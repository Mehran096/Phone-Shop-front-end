import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listOrders, listAllOrders, deleteOrder, resetDelete } from '../../slices/orderSlice'
import { FaSearch, FaDownload } from 'react-icons/fa'
import { toast } from 'react-toastify'

const OrderListScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [cancelCodeFilter, setCancelCodeFilter] = useState(searchParams.get('cancelCode') || 'ALL')

  const { orders, allOrders, loading, loadingAll, error, successDelete, page, pages } = useSelector((state) => state.order)
  const { userInfo } = useSelector((state) => state.auth)

  const filteredOrders = orders?.filter(order => {
    if (cancelCodeFilter === 'ALL') return true
    if (cancelCodeFilter === 'ACTIVE') return !order.isCancelled
    if (cancelCodeFilter === 'CANCELLED') return order.isCancelled
    return order.cancelCode === cancelCodeFilter
  }) || []

  const baseOrdersForStats = allOrders
  const cancelStats = {
    totalCancelled: baseOrdersForStats?.filter(o => o.isCancelled).length || 0,
    totalRevenueLost: baseOrdersForStats?.filter(o => o.isCancelled).reduce((acc, o) => acc + o.totalPrice, 0) || 0,
    activeOrders: baseOrdersForStats?.filter(o => !o.isCancelled).length || 0,
    byCode: baseOrdersForStats?.filter(o => o.isCancelled && o.cancelCode).reduce((acc, o) => {
      acc[o.cancelCode] = (acc[o.cancelCode] || 0) + 1
      return acc
    }, {})
  }

  const allCancelReasons = Object.entries(cancelStats.byCode).sort(([, a], [, b]) => b - a)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listAllOrders())
      const pageNumber = searchParams.get('page') || 1
      const searchKeyword = searchParams.get('keyword') || ''
      const cancelCode = searchParams.get('cancelCode') || 'ALL'
      dispatch(listOrders({ pageNumber, keyword: searchKeyword, cancelCode }))
    } else {
      navigate('/login')
    }
    if (successDelete) dispatch(resetDelete())
    setKeyword(searchParams.get('keyword') || '')
    setCancelCodeFilter(searchParams.get('cancelCode') || 'ALL')
  }, [dispatch, userInfo, navigate, successDelete, searchParams])

  const deleteHandler = (id) => {
    if (window.confirm('Delete this order? This cannot be undone.')) dispatch(deleteOrder(id))
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) setSearchParams({ keyword: keyword.trim(), page: 1, cancelCode: cancelCodeFilter })
    else setSearchParams({ page: 1, cancelCode: cancelCodeFilter })
  }

  const formatCancelCode = (code) => {
    if (!code) return '-'
    return code.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }

  if (loading || loadingAll) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading orders...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error}</div>

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-white text-gray-900 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Orders ({baseOrdersForStats?.length || 0})</h1>
          <form onSubmit={submitHandler} className="flex w-full lg:w-96">
            <div className='relative flex-1'>
              <input type="text" placeholder="Order ID or User..." value={keyword} onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-l-xl text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none" />
              {keyword && (
                <button type="button" onClick={() => { setKeyword(''); setCancelCodeFilter('ALL'); setSearchParams({ page: 1, cancelCode: 'ALL' }) }}
                  className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black w-6 h-6 flex items-center justify-center'>×</button>
              )}
            </div>
            <button type="submit" className="bg-black text-white px-4 rounded-r-xl hover:bg-gray-800"><FaSearch /></button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <select value={cancelCodeFilter} onChange={(e) => { const val = e.target.value; setCancelCodeFilter(val); setSearchParams({ keyword: searchParams.get('keyword') || '', page: 1, cancelCode: val }) }}
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white w-full sm:w-64">
            <option value="ALL">All Orders</option><option value="ACTIVE">Active Only</option><option value="CANCELLED">Cancelled Only</option>
            <option value="ADMIN_CANCEL_COD">ADMIN_CANCEL_COD</option><option value="USER_REQUEST">USER_REQUEST</option>
            <option value="OUT_OF_STOCK">OUT_OF_STOCK</option><option value="WRONG_ADDRESS">WRONG_ADDRESS</option>
            <option value="FRAUD">FRAUD</option><option value="DUPLICATE_ORDER">DUPLICATE_ORDER</option>
          </select>
          <button onClick={() => {
            if (filteredOrders.length === 0) { toast.info('No orders to export'); return }
            const headers = ['Order ID','User','Email','Date','Total','Payment','Delivery','Status','Cancel Code','Reason']
            const csvRows = [headers.join(','), ...filteredOrders.map(o => [o._id,`"${o.user?.name || 'Deleted'}"`,`"${o.user?.email || ''}"`,o.createdAt.substring(0,10),o.totalPrice.toFixed(2),o.isPaid?'Paid':'Not Paid',o.isDelivered?'Delivered':'Not Delivered',o.isCancelled?'Cancelled':'Active',o.cancelCode||'-',`"${o.cancelReason||''}"`].join(','))]
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' }); const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `orders-${cancelCodeFilter}-${new Date().toISOString().split('T')[0]}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url); toast.success(`${filteredOrders.length} orders exported`)
          }} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700">
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border text-gray-900 cursor-pointer hover:shadow-md" onClick={() => { setCancelCodeFilter('ALL'); setSearchParams({ keyword, page: 1, cancelCode: 'ALL' }) }}>
          <p className="text-xs text-gray-500 uppercase">Total Orders</p><p className="text-2xl font-bold text-gray-900 mt-1">{baseOrdersForStats?.length || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 text-gray-900 cursor-pointer hover:shadow-md" onClick={() => { setCancelCodeFilter('ACTIVE'); setSearchParams({ keyword, page: 1, cancelCode: 'ACTIVE' }) }}>
          <p className="text-xs text-gray-500 uppercase">Active</p><p className="text-2xl font-bold text-green-600 mt-1">{cancelStats.activeOrders}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 text-gray-900 cursor-pointer hover:shadow-md" onClick={() => { setCancelCodeFilter('CANCELLED'); setSearchParams({ keyword, page: 1, cancelCode: 'CANCELLED' }) }}>
          <p className="text-xs text-gray-500 uppercase">Cancelled</p><p className="text-2xl font-bold text-red-600 mt-1">{cancelStats.totalCancelled}</p>
          <p className="text-xs text-gray-400 mt-1">{baseOrdersForStats?.length ? ((cancelStats.totalCancelled / baseOrdersForStats.length) * 100).toFixed(1) : 0}% rate</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 text-gray-900">
          <p className="text-xs text-gray-500 uppercase">Revenue Lost</p><p className="text-2xl font-bold text-orange-600 mt-1">${cancelStats.totalRevenueLost.toFixed(2)}</p>
        </div>
      </div>

      {/* CANCEL REASONS */}
      {cancelStats.totalCancelled > 0 && (
        <div className="bg-white text-gray-900 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Cancel Reasons</h3>
          <div className="space-y-2">
            {allCancelReasons.map(([code, count]) => (
              <div key={code} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-xl cursor-pointer" onClick={() => { setCancelCodeFilter(code); setSearchParams({ keyword, page: 1, cancelCode: code }) }}>
                <span className="text-sm font-medium text-red-600">{formatCancelCode(code)}</span>
                <div className="flex items-center gap-3"><div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${(count / cancelStats.totalCancelled) * 100}%` }}></div></div><span className="text-sm font-bold">{count}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white text-gray-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50"><tr className="text-left text-xs text-gray-500 uppercase"><th className="px-6 py-3">ID</th><th className="px-6 py-3">User</th><th className="px-6 py-3">Date</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Cancel</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y">
              {filteredOrders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 text-sm text-gray-900">
                  <td className="px-6 py-4 font-mono text-xs">{order._id.substring(0,10)}...</td>
                  <td className="px-6 py-4 font-medium">{order.user?.name || 'Deleted'}</td>
                  <td className="px-6 py-4">{order.createdAt.substring(0,10)}</td>
                  <td className="px-6 py-4 font-bold">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${order.isCancelled?'bg-red-100 text-red-700': order.isDelivered?'bg-green-100 text-green-700': order.isPaid?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{order.isCancelled?'Cancelled': order.isDelivered?'Delivered': order.isPaid?'Paid':'Pending'}</span></td>
                  <td className="px-6 py-4 text-xs font-mono text-red-600">{order.isCancelled? formatCancelCode(order.cancelCode):'-'}</td>
                  <td className="px-6 py-4 text-right space-x-2"><Link to={`/order/${order._id}`} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs">Details</Link><button onClick={() => deleteHandler(order._id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden grid gap-3">
        {filteredOrders?.map((order) => (
          <div key={order._id} className="bg-white text-gray-900 rounded-2xl shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-2"><div><h3 className="font-bold text-gray-900 text-sm">{order.user?.name || 'Deleted User'}</h3><p className="text-xs text-gray-400 font-mono">#{order._id.substring(0,8)}</p></div><span className="font-bold text-lg text-gray-900">${order.totalPrice.toFixed(2)}</span></div>
            <p className="text-xs text-gray-500 mb-2">{order.createdAt.substring(0,10)}</p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${order.isPaid?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{order.isPaid?'Paid':'Not Paid'}</span>
              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${order.isDelivered?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{order.isDelivered?'Delivered':'Not Delivered'}</span>
              {order.isCancelled && <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-700 font-mono">{formatCancelCode(order.cancelCode)}</span>}
            </div>
            <div className="flex gap-2"><Link to={`/order/${order._id}`} className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm text-center">Details</Link><button onClick={() => deleteHandler(order._id)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm">Delete</button></div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pages > 1 && (
        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-sm flex flex-wrap justify-center items-center gap-2">
          <button onClick={() => setSearchParams({ keyword, page: 1, cancelCode: cancelCodeFilter })} disabled={page===1} className="px-3 py-1.5 rounded-xl bg-white border text-sm disabled:opacity-50">First</button>
          <button onClick={() => setSearchParams({ keyword, page: page-1, cancelCode: cancelCodeFilter })} disabled={page===1} className="px-3 py-1.5 rounded-xl bg-white border text-sm disabled:opacity-50">Prev</button>
          {[...Array(pages).keys()].filter(x=> x+1 >= page-2 && x+1 <= page+2).map(x=> (
            <button key={x+1} onClick={() => setSearchParams({ keyword, page: x+1, cancelCode: cancelCodeFilter })} className={`px-3 py-1.5 rounded-xl text-sm ${x+1===page?'bg-black text-white':'bg-white border text-gray-700'}`}>{x+1}</button>
          ))}
          <button onClick={() => setSearchParams({ keyword, page: page+1, cancelCode: cancelCodeFilter })} disabled={page===pages} className="px-3 py-1.5 rounded-xl bg-white border text-sm disabled:opacity-50">Next</button>
          <button onClick={() => setSearchParams({ keyword, page: pages, cancelCode: cancelCodeFilter })} disabled={page===pages} className="px-3 py-1.5 rounded-xl bg-white border text-sm disabled:opacity-50">Last</button>
        </div>
      )}
    </div>
  )
}

export default OrderListScreen