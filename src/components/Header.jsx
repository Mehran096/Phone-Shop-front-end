import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation, } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { logout } from '../slices/authSlice'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown, FaHeart, FaBox, FaOutdent, } from 'react-icons/fa'
import { IoLogOutOutline } from "react-icons/io5";
import { clearCartItems } from '../slices/cartSlice'
import { getWishlist, resetWishlist } from '../slices/wishlistSlice'
import SearchBox from './SearchBox'
import { FaWifi } from 'react-icons/fa'
import CollapsibleMenu from './CollapsibleMenu';
import api from '../utils/axios'
import CompareBar from './CompareBar'
import Navbar from './Navbar' 

const Header = ({ isOnline, isMobileMenuOpen, setIsMobileMenuOpen, }) => {
  const location = useLocation();

  const hideSearchPages = [
    "/login", "/register", "/forgot-password", "/cart", "/shipping",
    "/payment", "/placeorder", "/order-success",
  ]

  const hideSearch =
    hideSearchPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/") ||
    location.pathname.startsWith("/order/") ||
    (location.pathname.startsWith("/products/") && location.pathname.endsWith("/reviews"));

  const [userDropdown, setUserDropdown] = useState(false)
  const [adminDropdown, setAdminDropdown] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const currentBrand = searchParams.get('brand')

  const { wishlist } = useSelector((state) => state.wishlist)
  const { cartItems } = useSelector((state) => state.cart)
  const { userInfo } = useSelector((state) => state.auth)

  const wishlistCount = wishlist.items.length

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo']
  
  // V38.04: ADD ACCESSORY CATEGORIES
  const accessoryCategories = [
    { name: 'iPhone Cases', slug: 'iphone-cases' },
    { name: 'Samsung Cases', slug: 'samsung-cases' },
    { name: 'Chargers', slug: 'chargers' },
    { name: 'USB-C Cables', slug: 'usb-cables' },
    { name: 'Screen Protectors', slug: 'screen-protectors' },
    { name: 'Accessories', slug: 'all' }
  ]
  
  const activeBrand = searchParams.get('brand')
 const activeCategory = location.pathname.startsWith('/category/')
 ? location.pathname.split('/')[2] 
  : location.pathname === '/accessories' 
 ? 'all' // key for "All Accessories"
  : null

  const logoutHandler = async () => {
    if (userInfo?._id) {
      localStorage.removeItem(`cartMerged_${userInfo._id}`)
    }
    try {
      await api.post('/users/logout', {}, { withCredentials: true })
    } catch (err) {
      console.error('Logout API error:', err.message)
    }
    dispatch(logout())
    dispatch(clearCartItems())
    dispatch(resetWishlist())
    navigate('/login')
    setUserDropdown(false)
    setIsMobileMenuOpen(false)
  }

  const handleBrandClick = (brand) => {
    navigate(`/products?brand=${brand}`)
    setIsMobileMenuOpen(false)
  }

  // V38.04: NEW HANDLER FOR ACCESSORIES
  const handleCategoryClick = (slug) => {
    if(slug === 'all') navigate('/accessories')
    else navigate(`/category/${slug}`)
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (userInfo) {
      dispatch(getWishlist())
    }
  }, [dispatch, userInfo])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0

  return (
    <header className='bg-gray-900 shadow-md sticky top-0 z-50 text-white'>
      <nav className='container mx-auto px-2'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='hidden md:flex items-center flex-shrink-0 px-1 py-0.5 border border-transparent hover:border-white rounded-sm transition-all duration-100'>
            <img src='/assets/logo-horizontal.png' alt='PhoneStore' className='h-12 w-auto' />
            <div className='flex flex-col'>
              <span className='text-xl font-bold text-white leading-none'>PhoneStore</span>
              <span className='text-xs text-gray-400 leading-none'>Your Phone, Our Passion</span>
            </div>
          </Link>

          <Link to='/' className='flex md:hidden items-center p-1 border border-transparent hover:border-white rounded-sm duration-100'>
            <img src='/assets/logo-horizontal.png' alt='PhoneStore' className='h-12 w-auto' />
          </Link>

          {/* Desktop Search */}
          {!hideSearch && (
            <div className='hidden md:flex flex-1 justify-center mx-8 max-w-md'>
              {isOnline? (
                <SearchBox onSearchComplete={closeMobileMenu} />
              ) : (
                <div className='bg-gray-700 text-gray-400 px-4 py-2 rounded flex items-center w-full'>
                  <FaWifi className='mr-2' /> Search disabled
                </div>
              )}
            </div>
          )}

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-6 pr-5'>
            {/* Cart */}
            <Link to='/cart' className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100 text-white relative'>
              <FaShoppingCart className='text-xl' />
              <div className='flex flex-col leading-tight'>
                <span className='text-xs text-gray-300'>Cart</span>
                <span className='text-sm font-bold'>{cartCount > 0? cartCount : '0'}</span>
              </div>
              {cartCount > 0 && (
                <span className='absolute -top-1 left-6 bg-orange-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* WISHLIST - FIXED */}
            {userInfo && (
              <Link to='/wishlist' className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100'>
                <FaHeart className='text-xl' />
                <div className='flex flex-col leading-tight relative'>
                  <span className='text-xs text-gray-300'>
                    {wishlistCount > 0? `${wishlistCount} Items` : 'Your'}
                  </span>
                  <span className='text-sm font-bold'>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className='absolute -top-1 -right-6 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center'>
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* User Dropdown */}
            {userInfo? (
              <div className='relative group'>
                <button className='flex items-center gap-2 px-2 py-1 border border-transparent group-hover:border-white rounded-sm transition-all duration-100 text-white'>
                  <FaUser />
                  {userInfo.name}
                  <FaChevronDown className='text-xs' />
                </button>
                <div className='absolute right-0 mt-0 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-100'>
                  <Link to='/my-account' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>My Account</Link>
                  <Link to='/myorders' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>My Orders</Link>
                  <button onClick={logoutHandler} className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600'>Logout</button>
                </div>
              </div>
            ) : (
              <Link to='/login' className='flex items-center gap-2 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all duration-100 text-white'>
                <FaUser /> Sign In
              </Link>
            )}

            {/* Admin Dropdown */}
            {userInfo && userInfo.isAdmin && (
              <div className='relative group'>
                <button className='flex items-center gap-2 px-2 py-1 border border-transparent group-hover:border-white rounded-sm transition-all duration-100 text-white'>
                  Admin <FaChevronDown className='text-xs' />
                </button>
                <div className='absolute right-0 mt-0 w-48 bg-white text-gray-900 rounded-sm shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-100'>
                  <Link to='/admin' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Dashboard</Link>
                  <hr className='my-1 border-gray-200' />
                  <Link to='/admin/userlist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Users</Link>
                  <Link to='/admin/productlist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Products</Link>
                  <Link to='/admin/accessorylist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Accessories</Link>
                  <Link to='/admin/orderlist' className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600'>Orders</Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Icons */}
          <div className='md:hidden lg:hidden gap-4 flex pr-5'>
            {/* wishlist mobile */}
            {userInfo && (
              <Link to='/wishlist' className="relative" onClick={closeMobileMenu}>
                <FaHeart className="text-white text-2xl" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            {/* Cart mobile */}
            <Link to="/cart" className="relative">
              <FaShoppingCart className="text-white text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {/* Mobile Hamburger */}
            <button className='md:hidden text-2xl' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Brand Navbar - Desktop */}
    <Navbar />
      {/* Mobile Menu */}
      <div onClick={closeMobileMenu} className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-out ${isMobileMenuOpen? "opacity-100" : "opacity-0 pointer-events-none"}`} />
      <div className={`md:hidden fixed top-16 left-0 bottom-0 w-[85%] max-w-sm bg-gray-900 z-50 overflow-y-auto transition-all duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-6 pb-6 space-y-6">

          {/* wishlist mobile menu */}
          {userInfo && (
            <Link to='/wishlist' className='flex items-center gap-2 py-2 hover:text-red-400 border-gray-700 pt-7' onClick={closeMobileMenu}>
              <FaHeart />
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
          )}

          {/* Brands - Mobile */}
          <div className='border-t border-gray-700 pt-4 mt-2'>
            <h3 className="text-gray-400 uppercase text-xs tracking-widest">Shop by Brand</h3>
            {brands.map((brand) => (
              <button key={brand} onClick={() => handleBrandClick(brand)} className={`block w-full text-left py-2 text-lg hover:text-blue-400 ${activeBrand === brand? 'text-blue-400' : 'text-white'}`}>
                {brand}
              </button>
            ))}
          </div>

          {/* V38.04: ACCESSORIES - MOBILE */}
          <div className='border-t border-gray-700 pt-4 mt-2'>
            <h3 className="text-gray-400 uppercase text-xs tracking-widest">Shop by Accessory</h3>
            {accessoryCategories.map((cat) => (
              <button key={cat.slug} onClick={() => handleCategoryClick(cat.slug)} className={`block w-full text-left py-2 text-lg hover:text-blue-400 ${activeCategory === cat.slug? 'text-blue-400' : 'text-white'}`}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* User Links Mobile */}
          {userInfo? (
            <div className='border-t border-gray-700 pt-4 mt-2'>
              <Link to='/my-account' className='flex items-center gap-2 py-2 hover:text-blue-400' onClick={closeMobileMenu}><FaUser />My Account</Link>
              <Link to='/myOrders' className='flex items-center gap-2 py-2 hover:text-blue-400' onClick={closeMobileMenu}><FaBox />My Orders</Link>
              <button onClick={() => { logoutHandler(); closeMobileMenu() }} className='flex items-center gap-2 py-2 hover:text-red-400'><IoLogOutOutline className="text-xl" />Logout</button>
            </div>
          ) : (
            <Link to='/login' className='flex items-center gap-2 py-2 hover:text-blue-400 mt-2' onClick={closeMobileMenu}><FaUser />Sign In</Link>
          )}

          {/* Admin Mobile */}
          {userInfo && userInfo.isAdmin && (
            <div className='border-t border-gray-700 pt-2 mt-2'>
              <div className='text-gray-400 text-sm mb-1'>Admin</div>
              <Link to='/admin' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400 text-blue-400 font-semibold'>Dashboard</Link>
              <Link to='/admin/userlist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Users</Link>
              <Link to='/admin/productlist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Products</Link>
              <Link to='/admin/orderlist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Orders</Link>
              <Link to='/admin/accessorylist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Accessories</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header