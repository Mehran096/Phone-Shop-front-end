import { Routes, Route, useLocation } from 'react-router-dom';
 
import { useDispatch, useSelector } from 'react-redux'
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Header from './components/Header';
import Footer from './components/Footer'
import CartScreen from './screens/CartScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import AdminDashboard from './screens/admin/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
// import MyOrdersScreen from './screens/MyOrdersScree'
import ProductCreateScreen from './screens/admin/ProductCreateScreen'
import AllProductsScreen from './screens/AllProductsScreen'
import FAQScreen from './screens/FAQScreen'
import ReturnRefundScreen from './screens/ReturnRefundScreen'
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import ContactScreen from './screens/ContactScreen'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import WishlistScreen from './screens/WishlistScreen'
import ShippingPolicyScreen from './screens/ShippingPolicyScreen';
import MyAccountScreen from './screens/MyAccountScreen';
import ProductReviewsScreen from './screens/ProductReviewsScreen';
import DealsScreen from './screens/DealsScreen';


import { FaExclamationTriangle } from 'react-icons/fa'
import { setCartItems } from './slices/cartSlice'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import api from './utils/axios';
 


 



function App() {
  const { pathname, search } = useLocation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

 useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}, [pathname, search])

 // Sync guest cart to DB on login
 useEffect(() => {
  const syncCartOnLogin = async () => {
    if (!userInfo) return

    const hasMerged = localStorage.getItem(`cartMerged_${userInfo._id}`)
    if (hasMerged) return

    try {
      const { data: dbCart } = await api.get('/users/cart', {
        withCredentials: true
      })

      // If guest cart has items, merge via backend
      if (cartItems?.length > 0) {
        const { data: mergedCart } = await api.post(
          '/users/cart',
          { cartItems },
          { withCredentials: true }
        )
        dispatch(setCartItems(mergedCart.cartItems))
        localStorage.removeItem('cart') // Clear guest cart silently
      } else {
        // Just load DB cart
        dispatch(setCartItems(dbCart.cartItems || []))
      }

      localStorage.setItem(`cartMerged_${userInfo._id}`, 'true')
    } catch (err) {
      console.error('Cart sync error:', err.message)
      // Fail silently - no toast
    }
  }

  syncCartOnLogin()
}, [userInfo, dispatch]) // Removed cartItems from deps to prevent loops


  useEffect(() => {
    const setOnline = () => setIsOnline(true)
    const setOffline = () => setIsOnline(false)
    
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header isOnline={isOnline} />

        {!isOnline && (
        <div className='alert alert-warning text-center mb-0 rounded-0'>
          <FaExclamationTriangle className='me-2' style={{ display: 'inline-block' }} />
          No internet connection. Some features may not work.
        </div>
      )}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeScreen isOnline={isOnline} />} />
            <Route path='/products' element={<HomeScreen isOnline={isOnline}/>} />
            <Route path='/deals' element={<DealsScreen isOnline={isOnline}/>} />
            
            <Route path='/faq' element={<FAQScreen />} />
            <Route path='/shipping-policy' element={<ShippingPolicyScreen />} />
            <Route path='/returns' element={<ReturnRefundScreen />} />
            <Route path='/contact' element={<ContactScreen />} />
            <Route path="/product/:slug" element={<ProductScreen isOnline={isOnline}/>} />
            <Route path="/products/:slug/reviews" element={<ProductReviewsScreen />}/>
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path='/order-success' element={<OrderSuccessScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/myorders" element={<MyOrdersScreen />} />
            <Route path="/my-account" element={<MyAccountScreen />} />
            {/* <Route path='/myorders' element={<MyOrdersScreen />} /> */}
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />

            {/* Admin Routes */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/productlist" element={<ProductListScreen />} />
              <Route path="/admin/product/create" element={<ProductCreateScreen />} />
              <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
              <Route path="/admin/orderlist" element={<OrderListScreen />} />
              <Route path="/admin/userlist" element={<UserListScreen />} />
              <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
            </Route>


          </Routes>
          <ToastContainer />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;