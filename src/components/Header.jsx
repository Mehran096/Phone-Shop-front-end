import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams,} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../slices/authSlice'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown, FaSearch } from 'react-icons/fa'
//import { MdOutlineYoutubeSearchedFor } from "react-icons/md";
import { clearCartItems } from '../slices/cartSlice'
 import SearchBox from './SearchBox'
 

const Header = () => {
  //const [isOpen, setIsOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [adminDropdown, setAdminDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) 
    

  const dispatch = useDispatch()
  const navigate = useNavigate()
  
// const keyword = searchParams.get('keyword') || ''
// const pageNumber = Number(searchParams.get('pageNumber')) || 1

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth)

  const logoutHandler = () => {
    dispatch(logout())
    dispatch(clearCartItems())
    navigate('/login')
    setUserDropdown(false)
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  
    const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  return (
    <header className='bg-gray-900  shadow-md sticky top-0 z-50 text-white h-16'>
      <nav className='container mx-auto px-1'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}

          <Link to='/' className='hidden md:flex items-center  flex-shrink-0'>
            <img
              src='/assets/logo-horizontal.png'
              alt='PhoneStore'
              className='h-16 w-16'
            />
            <div className='flex flex-col'>
              <span className='text-xl font-bold text-white leading-none'>PhoneStore</span>
              <span className='text-xs text-gray-400 leading-none'>Your Phone, Our Passion</span>
            </div>
          </Link>
          {/* Mobile logo - hidden on desktop */}
          <Link to='/' className='flex items-center pr-7'>
            {/* Desktop logo - hidden on mobile */}
            {/* <img
              src='/assets/logo-horizontal.png'
              alt='PhoneStore'
              className='hidden md:block h-14 w-auto'
            /> */}
            {/* Mobile logo - hidden on desktop */}
            <img
              src='/assets/logo-horizontal.png'
              alt='PhoneStore'
              className='block md:hidden h-14 w-auto'
            />
          </Link>
          {/* search bar */}
          {/* Desktop Search Bar */}
           
          {/* Desktop Search - Hidden on mobile */}
          <div className='hidden md:flex flex-1 justify-center mx-8 max-w-md'>
            <SearchBox onSearchComplete={closeMobileMenu} />
          </div>
        
          {/* <form onSubmit={submitHandler} className='hidden md:flex flex-1 max-w-md mx-8'>
            <div className='relative w-full'>
              <input

                type='text'
                name='q'
                value={searchParams}
                onChange={(e) => setSearchParams(e.target.value)}
                placeholder='Search products...'
                className='w-full px-4 py-2 border-gray-300 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white'
              />
              <button
                type='submit'
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-white-600 px-3 py-1 text-bold rounded-md transition-colors'
              >
               <FaSearch className='text-gray-500 w-5 h-5' /> 
              </button>
            </div>
          </form> */}
           
          {/* <SearchBox/> */}
          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-6 pr-5'>
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
          to='/admin'
          className='block px-4 py-2 hover:bg-gray-100 font-semibold text-blue-600'
          onClick={() => setAdminDropdown(false)}
        >
          Dashboard
        </Link>
         <hr className="my-1" />
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
            className='md:hidden text-2xl pr-5'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden pl-5 fixed top-16 left-0 right-0 bottom-0 bg-gray-900 z-50 overflow-y-auto'> 
             {/* Mobile Search - Only one here */}
            <SearchBox onSearchComplete={closeMobileMenu} />
            <Link
              to='/cart'
              className='flex items-center gap-2 py-2 hover:text-blue-400'
              onClick={() => closeMobileMenu(false)}
            >
              <FaShoppingCart />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>


            {userInfo ? (
              <>
                <Link
                  to='/profile'
                  className='flex items-center gap-2 py-2 hover:text-blue-400'
                 onClick={closeMobileMenu}
                >
                  <FaUser />
                  Profile
                </Link>
                <button
                  onClick={() => { logoutHandler(); closeMobileMenu(false) }}
                  className='flex items-center gap-2 py-2 hover:text-blue-400'
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to='/login'
                className='flex items-center gap-2 py-2 hover:text-blue-400'
                onClick={closeMobileMenu}
              >
                <FaUser />
                Sign In
              </Link>
            )}

            {userInfo && userInfo.isAdmin && (
              <div className='border-t border-gray-700 pt-2 mt-2'>
                <div className='text-gray-400 text-sm mb-1'>Admin</div>
                <Link to='/admin/userlist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Users</Link>
                    <Link to='/admin/productlist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Products</Link>
                    <Link to='/admin/orderlist' onClick={closeMobileMenu} className='block py-2 pl-4 hover:text-blue-400'>Orders</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header