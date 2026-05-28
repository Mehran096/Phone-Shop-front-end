import { Routes, Route } from 'react-router-dom';
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
import ContactScreen from './screens/ContactScreen'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'



function App() {
  return (
    <>
     <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
          <Routes><Route path="/" element={<HomeScreen />} />
          <Route path='/products' element={<AllProductsScreen />} />
          <Route path='/search/:keyword' element={<HomeScreen />} />
<Route path='/page/:pageNumber' element={<HomeScreen />} /> 
<Route path='/search/:keyword/page/:pageNumber' element={<HomeScreen />} />
<Route path='/faq' element={<FAQScreen />} />
<Route path='/returns' element={<ReturnRefundScreen />} />
<Route path='/contact' element={<ContactScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/shipping" element={<ShippingScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/order/:id" element={<OrderScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path='/myorders' element={<MyOrdersScreen />} />
          
          //admin route
          <Route path="/admin/orderlist" element={<OrderListScreen />} />
          <Route path="/admin/productlist" element={<ProductListScreen />} />
          <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
          <Route path="/admin/userlist" element={<UserListScreen />} />
          <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
          <Route path="/admin/product/create" element={<ProductCreateScreen />} />
         
          
        </Routes>
         <ToastContainer />
      </main>
       <Footer />
       </div>
    </>
  );
}

export default App;