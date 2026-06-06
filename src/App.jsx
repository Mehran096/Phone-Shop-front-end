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
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboard from './screens/admin/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import UserListScreen from './screens/admin/UserListScreen';
import UserEditScreen from './screens/admin/UserEditScreen';
import MyOrdersScreen from './screens/MyOrdersScreen'
import ProductCreateScreen from './screens/admin/ProductCreateScreen'
import AllProductsScreen from './screens/AllProductsScreen'
import FAQScreen from './screens/FAQScreen'
import ReturnRefundScreen from './screens/ReturnRefundScreen'
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import ContactScreen from './screens/ContactScreen'
import { setCartItems } from './slices/cartSlice'
import axios from 'axios'
import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import api from './utils/axios';


 



function App() {
  const { pathname, search } = useLocation()
const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)

 useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}, [pathname, search])

useEffect(() => {
  const mergeCartOnLogin = async () => {
    if (!userInfo) return // Not logged in
    
    // Use localStorage instead of sessionStorage so it persists
    const hasMerged = localStorage.getItem(`cartMerged_${userInfo._id}`)
    if (hasMerged) return
    
    try {
      const { data: userCart } = await api.get('/api/users/cart')
      
      if (userCart?.cartItems?.length > 0) {
        // Returning user - load DB cart
        dispatch(setCartItems(userCart.cartItems))
        // REMOVED: toast.success('Loaded your saved cart') 
      } else if (cartItems?.length > 0) {
        // New user - save guest cart to DB
        await api.post('/api/users/cart', { cartItems } )
        localStorage.removeItem('cart')
        toast.success('Guest cart saved to your account')
      }
      
      // Mark as merged for this user ID
      localStorage.setItem(`cartMerged_${userInfo._id}`, 'true')
    } catch (err) {
      console.error('Cart merge error:', err.message)
      // REMOVED: toast.error('Cart merge failed') - too noisy on login
    }
  }
  
  mergeCartOnLogin()
}, [userInfo, dispatch]) // Removed cartItems from deps to prevent loop

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes><Route path="/" element={<HomeScreen />} />
            <Route path='/products' element={<AllProductsScreen />} />
            {/* <Route path='/search/:keyword' element={<HomeScreen />} />
            <Route path='/page/:pageNumber' element={<HomeScreen />} />
            <Route path='/search/:keyword/page/:pageNumber' element={<HomeScreen />} /> */}
            <Route path='/faq' element={<FAQScreen />} />
            <Route path='/returns' element={<ReturnRefundScreen />} />
            <Route path='/contact' element={<ContactScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path='/order-success' element={<OrderSuccessScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path='/myorders' element={<MyOrdersScreen />} />

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