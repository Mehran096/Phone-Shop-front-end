import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  FaBox, FaUsers, FaShoppingCart, FaChartLine, 
  FaPlus, FaHeadphones, FaBlog, FaArrowUp, FaChevronRight 
} from 'react-icons/fa'
import api from '../../utils/axios';
 
const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        setStats(data)
      } catch {}
    }
    fetchStats()
  }, [userInfo])

  return (
    <div className="text-white">
      {/* BREADCRUMB - shows only on mobile when you don't use AdminLayout */}
      <div className="lg:hidden flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/" className="hover:text-white">Home</Link>
        <FaChevronRight size={10}/> <span className="text-white font-semibold">Admin / Dashboard</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-400">Welcome, <span className="text-white font-semibold">{userInfo?.name}</span></div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Sales" value={`$${stats.totalSales?.toLocaleString() || '160106.24'}`} sub="+12% this month" icon={<FaChartLine />} color="from-emerald-500 to-teal-600" />
        <StatCard title="Products" value={stats.productCount || 39} sub="Active listings" icon={<FaBox />} color="from-blue-500 to-indigo-600" />
        <StatCard title="Orders" value={stats.orderCount || 134} sub="Total orders" icon={<FaShoppingCart />} color="from-orange-500 to-red-500" />
        <StatCard title="Users" value={stats.userCount || 55} sub="Registered" icon={<FaUsers />} color="from-purple-500 to-pink-600" />
      </div>

      {/* Quick Actions - NOW WITH ALL 6 LINKS */}
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard to="/admin/productlist" title="Manage Products" desc="View, edit, delete all products" icon={<FaBox />} />
        <ActionCard to="/admin/accessorylist" title="Manage Accessories" desc="View, edit accessory stock" icon={<FaHeadphones />} />
        <ActionCard to="/admin/orderlist" title="View Orders" desc="Process & update order status" icon={<FaShoppingCart />} />
        <ActionCard to="/admin/userlist" title="Manage Users" desc="View users & manage admins" icon={<FaUsers />} />
        <ActionCard to="/admin/bloglist" title="Manage Blogs" desc="Create and edit blog posts" icon={<FaBlog />} />
        <ActionCard to="/admin/product/create" title="Add New Product" desc="Create a new phone listing" icon={<FaPlus />} highlight />
      </div>
    </div>
  )
}

const StatCard = ({ title, value, sub, icon, color }) => (
  <div className="relative bg-[#1e293b] p-6 rounded-2xl border border-white/10 overflow-hidden group hover:border-white/20 transition">
    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-20 rounded-bl-full group-hover:opacity-30 transition`} />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><FaArrowUp size={10}/> {sub}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-lg`}>{icon}</div>
    </div>
  </div>
)

const ActionCard = ({ to, title, desc, icon, highlight }) => (
  <Link to={to} className={`p-6 rounded-2xl border transition-all group ${highlight ? 'bg-white text-black border-white hover:bg-gray-100' : 'bg-[#1e293b] border-white/10 hover:border-white/20 hover:bg-[#243447]'}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition ${highlight ? 'bg-black text-white' : 'bg-white/10 group-hover:bg-white text-white group-hover:text-black'}`}>{icon}</div>
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className={`text-sm ${highlight ? 'text-gray-600' : 'text-gray-400'}`}>{desc}</p>
  </Link>
)

export default AdminDashboard