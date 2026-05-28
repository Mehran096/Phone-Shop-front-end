import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../slices/authSlice'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'
import { clearCartItems } from '../slices/cartSlice'
//import {SearchBox} from './SearchBox'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [adminDropdown, setAdminDropdown] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth)

  const logoutHandler = () => {
    dispatch(logout())
     dispatch(clearCartItems())
    navigate('/login')
    setUserDropdown(false)
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/search/${keyword}`)
      setKeyword('')
      setIsMenuOpen(false)
    } else {
      navigate('/')
    }
  }

  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  return (
    <header className='bg-white shadow-md sticky top-0 z-50'>
      <nav className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center'>
  {/* Desktop logo - hidden on mobile */}
  <img 
    src='/assets/logo-horizontal.png' 
    alt='PhoneStore'
    className='hidden md:block h-14 w-auto'
  />
  {/* Mobile logo - hidden on desktop */}
  <img 
    src='/assets/logo-stacked.png' 
    alt='PhoneStore'
    className='block md:hidden h-16 w-auto'
  />
</Link>
          {/* search bar */}
           {/* Desktop Search Bar */}
          <form onSubmit={submitHandler} className='hidden md:flex flex-1 max-w-md mx-8'>
            <div className='relative w-full'>
              <input
                 
                type='text'
                name='q'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='Search products...'
                className='w-full px-4 py-2 border-gray-300 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                type='submit'
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors'
              >
                Search
              </button>
            </div>
          </form>
          {/* <SearchBox/> */}
          {/* Desktop Menu */} 
          <div className='hidden md:flex items-center space-x-6'>
            <Link to='/cart' className='flex items-center gap-2 hover:text-blue-400 relative'>
              <FaShoppingCart />
              Cart
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-3 bg-blue-500 text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                  {cartCount}
                </span>
              )}
            </Link>

            {userInfo ? (
              <div className='relative'>
                <button 
                  onClick={() => setUserDropdown(!userDropdown)}
                  className='flex items-center gap-2 hover:text-blue-400'
                >
                  <FaUser />
                  {userInfo.name}
                  <FaChevronDown className='text-xs' />
                </button>
                {userDropdown && (
                  <div className='absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg py-1 z-50'>
                    <Link 
                      to='/profile' 
                      className='block px-4 py-2 hover:bg-gray-100'
                      onClick={() => setUserDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={logoutHandler}
                      className='block w-full text-left px-4 py-2 hover:bg-gray-100'
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to='/login' className='flex items-center gap-2 hover:text-blue-400'>
                <FaUser />
                Sign In
              </Link>
            )}

            {userInfo && userInfo.isAdmin && (
              <div className='relative'>
                <button 
                  onClick={() => setAdminDropdown(!adminDropdown)}
                  className='flex items-center gap-2 hover:text-blue-400'
                >
                  Admin
                  <FaChevronDown className='text-xs' />
                </button>
                {adminDropdown && (
                  <div className='absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg py-1 z-50'>
                    <Link 
                      to='/admin/userlist' 
                      className='block px-4 py-2 hover:bg-gray-100'
                      onClick={() => setAdminDropdown(false)}
                    >
                      Users
                    </Link>
                    <Link 
                      to='/admin/productlist' 
                      className='block px-4 py-2 hover:bg-gray-100'
                      onClick={() => setAdminDropdown(false)}
                    >
                      Products
                    </Link>
                    <Link 
                      to='/admin/orderlist' 
                      className='block px-4 py-2 hover:bg-gray-100'
                      onClick={() => setAdminDropdown(false)}
                    >
                      Orders
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className='md:hidden text-2xl'
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className='md:hidden pb-4 space-y-2'>
            {/* Mobile Search */}
            <form onSubmit={submitHandler}>
              <div className='relative'>
                <input
                  type='text'
                  name='q'
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder='Search products...'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <button
                  type='submit'
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700'
                >
                  Search
                </button>
              </div>
            </form>
            <Link 
              to='/cart' 
              className='flex items-center gap-2 py-2 hover:text-blue-400'
              onClick={() => setIsOpen(false)}
            >
              <FaShoppingCart />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>


            {userInfo ? (
              <>
                <Link 
                  to='/profile' 
                  className='flex items-center gap-2 py-2 hover:text-blue-400'
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser />
                  Profile
                </Link>
                <button 
                  onClick={() => {logoutHandler(); setIsOpen(false)}}
                  className='flex items-center gap-2 py-2 hover:text-blue-400'
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to='/login' 
                className='flex items-center gap-2 py-2 hover:text-blue-400'
                onClick={() => setIsOpen(false)}
              >
                <FaUser />
                Sign In
              </Link>
            )}

            {userInfo && userInfo.isAdmin && (
              <div className='border-t border-gray-700 pt-2 mt-2'>
                <div className='text-gray-400 text-sm mb-1'>Admin</div>
                <Link to='/admin/userlist' className='block py-2 hover:text-blue-400' onClick={() => setIsOpen(false)}>Users</Link>
                <Link to='/admin/productlist' className='block py-2 hover:text-blue-400' onClick={() => setIsOpen(false)}>Products</Link>
                <Link to='/admin/orderlist' className='block py-2 hover:text-blue-400' onClick={() => setIsOpen(false)}>Orders</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header