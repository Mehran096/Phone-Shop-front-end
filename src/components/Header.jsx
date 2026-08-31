import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation, } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../slices/authSlice'
import { FaShoppingCart, FaUser, FaBars, FaChevronDown, FaHeart, FaUserPlus, FaSearch } from 'react-icons/fa'
import { clearCartItems } from '../slices/cartSlice'
import { getWishlist, resetWishlist } from '../slices/wishlistSlice'
import SearchBox from './SearchBox'
import { FaWifi } from 'react-icons/fa'
import api from '../utils/axios'
import Navbar from './Navbar'
import MobileSidebar from './MobileSidebar'

const Header = ({ isOnline, isMobileMenuOpen, setIsMobileMenuOpen, }) => {
  const location = useLocation();
  const hideSearchPages = ["/login", "/register", "/forgot-password", "/cart", "/shipping", "/payment", "/placeorder", "/order-success",]
  const hideSearch = hideSearchPages.includes(location.pathname) || location.pathname.startsWith("/reset-password/") || location.pathname.startsWith("/order/") || (location.pathname.startsWith("/products/") && location.pathname.endsWith("/reviews"));

  const [userDropdown, setUserDropdown] = useState(false)
  const [adminDropdown, setAdminDropdown] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { wishlist } = useSelector((state) => state.wishlist)
  const { cartItems } = useSelector((state) => state.cart)
  const { userInfo } = useSelector((state) => state.auth)
  const wishlistCount = wishlist.items.length

  const logoutHandler = async () => {
    if (userInfo?._id) localStorage.removeItem(`cartMerged_${userInfo._id}`)
    try { await api.post('/users/logout', {}, { withCredentials: true }) } catch (err) { console.error('Logout API error:', err.message) }
    dispatch(logout()); dispatch(clearCartItems()); dispatch(resetWishlist())
    navigate('/login'); setUserDropdown(false); setIsMobileMenuOpen(false)
  }

  useEffect(() => { if (userInfo) dispatch(getWishlist()) }, [dispatch, userInfo])
  useEffect(() => { document.body.style.overflow = isMobileMenuOpen? 'hidden' : 'unset' }, [isMobileMenuOpen])
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0

  return (
    <header className='bg-gray-900 shadow-md sticky top-0 z-50 text-white'>
      <nav className='container mx-auto px-2 sm:px-4 lg:px-6'>
        <div className='flex justify-between items-center h-16 gap-2 md:gap-4'>

          {/* 1. Logo - Never shrink */}
          <Link to='/' className='flex items-center flex-shrink-0 px-1 py-0.5 border-transparent hover:border-white rounded-sm'>
            <img src='/assets/logo-horizontal.png' alt='PhoneStore' className='h-10 md:h-12 w-auto' />
            <div className='hidden sm:flex flex-col ml-2'>
              <span className='text-base md:text-xl font-bold leading-none'>PhoneStore</span>
              <span className='text-[9px] md:text-xs text-gray-400 leading-none hidden md:block'>Your Phone, Our Passion</span>
            </div>
          </Link>

          {/* 2. Desktop Search - Show from sm+ */}
          {!hideSearch && (
            <div className='hidden sm:flex flex-1 min-w-0 justify-center mx-2 md:mx-4 lg:mx-8 max-w-2xl'>
              {isOnline? (
                <SearchBox onSearchComplete={closeMobileMenu} />
              ) : (
                <div className='bg-gray-700 text-gray-400 px-4 py-2 rounded flex items-center w-full text-sm'>
                  <FaWifi className='mr-2' /> Search disabled
                </div>
              )}
            </div>
          )}

          {/* 3. RIGHT ICONS - 3 STAGES */}

          {/* Stage A: Desktop lg+ = Full Text */}
          <div className='hidden lg:flex items-center gap-5 flex-shrink-0'>
            {/* Cart */}
            <Link to='/cart' className='flex items-center gap-2 text-white relative hover:text-yellow-400'>
              <FaShoppingCart className='text-xl' />
              <div className='flex flex-col leading-tight'>
                <span className='text-xs text-gray-300'>Cart</span>
                <span className='text-sm font-bold'>{cartCount > 0? cartCount : '0'}</span>
              </div>
              {cartCount > 0 && (<span className='absolute -top-1 left-6 bg-orange-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>{cartCount}</span>)}
            </Link>

            {/* Wishlist */}
            {userInfo && (
              <Link to='/wishlist' className='flex items-center gap-2 hover:text-yellow-400'>
                <FaHeart className='text-xl' />
                <div className='flex flex-col leading-tight relative'>
                  <span className='text-xs text-gray-300'>{wishlistCount > 0? `${wishlistCount} Items` : 'Your'}</span>
                  <span className='text-sm font-bold'>Wishlist</span>
                  {wishlistCount > 0 && (<span className='absolute -top-1 -right-6 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center'>{wishlistCount}</span>)}
                </div>
              </Link>
            )}

            {/* User */}
            {userInfo? (
              <div className='relative group'>
                <button className='flex items-center gap-2 hover:text-yellow-400'><FaUser />{userInfo.name}<FaChevronDown className='text-xs' /></button>
                <div className='absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100'>
                  <Link to='/my-account' className='block px-4 py-2 text-sm hover:bg-gray-100'>My Account</Link>
                  <Link to='/myorders' className='block px-4 py-2 text-sm hover:bg-gray-100'>My Orders</Link>
                  <button onClick={logoutHandler} className='block w-full text-left px-4 py-2 text-sm hover:bg-gray-100'>Logout</button>
                </div>
              </div>
            ) : (<Link to='/login' className='flex items-center gap-2 hover:text-yellow-400'><FaUser /> Sign In</Link>)}

            {/* Admin */}
            {userInfo && userInfo.isAdmin && (
              <div className='relative group'>
                <button className='flex items-center gap-2 hover:text-yellow-400'>Admin <FaChevronDown className='text-xs' /></button>
                <div className='absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100'>
                  <Link to='/admin' className='block px-4 py-2 text-sm hover:bg-gray-100'>Dashboard</Link>
                  <Link to='/admin/userlist' className='block px-4 py-2 text-sm hover:bg-gray-100'>Users</Link>
                  <Link to='/admin/productlist' className='block px-4 py-2 text-sm hover:bg-gray-100'>Products</Link>
                  <Link to='/admin/accessorylist' className='block px-4 py-2 text-sm hover:bg-gray-100'>Accessories</Link>
                  <Link to='/admin/orderlist' className='block px-4 py-2 text-sm hover:bg-gray-100'>Orders</Link>
                </div>
              </div>
            )}
          </div>

          {/* Stage B: Tablet md = Icons Only */}
          <div className='hidden md:flex lg:hidden items-center gap-4 text-xl flex-shrink-0'>
            <Link to='/cart' className='relative hover:text-yellow-400'><FaShoppingCart /><span className='absolute -top-2 -right-2 bg-orange-400 text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center'>{cartCount}</span></Link>
            {userInfo && (<Link to='/wishlist' className='relative hover:text-yellow-400'><FaHeart /><span className='absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center'>{wishlistCount}</span></Link>)}
            {userInfo? (<Link to='/my-account' className='hover:text-yellow-400'><FaUser /></Link>) : (<Link to='/login' className='hover:text-yellow-400'><FaUserPlus /></Link>)}
          </div>

          {/* Stage C: Mobile sm = Hamburger */}
          <div className='flex md:hidden items-center gap-3 text-xl flex-shrink-0'>
            <Link to="/cart" className="relative"><FaShoppingCart /><span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span></Link>
            {userInfo && (<Link to='/wishlist' className="relative"><FaHeart /><span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{wishlistCount}</span></Link>)}
            <button className='text-white' onClick={() => setIsMobileMenuOpen(true)}><FaBars /></button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        {!hideSearch && (
          <div className='sm:hidden pb-3'>
            {isOnline? <SearchBox onSearchComplete={closeMobileMenu} /> : <div className='bg-gray-700 text-gray-400 px-4 py-2 rounded flex items-center text-sm'><FaWifi className='mr-2' /> Search disabled</div>}
          </div>
        )}
      </nav>

      <Navbar />
      <MobileSidebar show={isMobileMenuOpen} setShow={setIsMobileMenuOpen} />
    </header>
  )
}

export default Header