import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaTachometerAlt, FaUsers, FaMobileAlt, FaHeadphones,
  FaShoppingCart, FaBlog, FaBars, FaTimes, FaHome
} from 'react-icons/fa';
import { IoLogOutOutline } from "react-icons/io5";

import { logout } from '../../slices/authSlice';
import { clearCartItems } from '../../slices/cartSlice';
import { resetWishlist } from '../../slices/wishlistSlice';
import api from '../../utils/axios';

const menu = [
  { path: '/admin', label: 'Dashboard', icon: FaTachometerAlt, exact: true },
  { path: '/admin/userlist', label: 'Users', icon: FaUsers },
  { path: '/admin/productlist', label: 'Products', icon: FaMobileAlt },
  { path: '/admin/accessorylist', label: 'Accessories', icon: FaHeadphones },
  { path: '/admin/orderlist', label: 'Orders', icon: FaShoppingCart },
  { path: '/admin/bloglist', label: 'Blogs', icon: FaBlog },
];

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const current = menu.find(m => location.pathname === m.path || location.pathname.startsWith(m.path + '/')) || menu[0];

  // SAME AS Header.jsx
  const logoutHandler = async () => {
    if (userInfo?._id) {
      localStorage.removeItem(`cartMerged_${userInfo._id}`);
    }
    try {
      await api.post('/users/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout API error:', err.message);
    }
    dispatch(logout());
    dispatch(clearCartItems());
    dispatch(resetWishlist());
    navigate('/login');
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-[#111c33] border-r border-white/10 flex-col fixed h-screen top-0 left-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-white text-black w-8 h-8 flex items-center justify-center rounded">R</span> PhoneStore
          </Link>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map(m => (
            <NavLink
              key={m.path}
              to={m.path}
              end={m.exact}
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive? 'bg-white text-black font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            >
              <m.icon /> {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-xs text-gray-400 truncate">Hi, <span className="text-white">{userInfo?.name}</span></div>
          <button onClick={logoutHandler} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition text-sm font-medium">
            <IoLogOutOutline /> Logout
          </button>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"><FaHome/> Back to Store</Link>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {open && <div onClick={()=>setOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />}
      <aside className={`fixed lg:hidden z-50 top-0 left-0 h-full w-64 bg-[#111c33] transform transition-transform flex flex-col ${open? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <span className="font-bold">Admin</span>
          <button onClick={()=>setOpen(false)}><FaTimes/></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map(m => (
            <NavLink key={m.path} to={m.path} onClick={()=>setOpen(false)} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive? 'bg-white text-black' : 'text-gray-300'}`}>
              <m.icon /> {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={logoutHandler} className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
            <IoLogOutOutline /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-[#111c33]/80 backdrop-blur border-b border-white/10 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setOpen(true)} className="lg:hidden p-2 bg-white/10 rounded-lg"><FaBars/></button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 hidden sm:inline">Admin /</span>
              <span className="font-semibold flex items-center gap-2"><current.icon className="text-gray-400"/> {current.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden sm:block">Total Sales: <span className="text-white font-bold">$160106.24</span></div>
            <button onClick={logoutHandler} className="hidden lg:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white transition">
              <IoLogOutOutline/> Logout
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;