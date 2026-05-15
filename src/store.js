import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';

export default configureStore({
  reducer: {
    products: productReducer, 
    cart: cartReducer,
    auth: authSliceReducer,
    order: orderReducer,
  },
});