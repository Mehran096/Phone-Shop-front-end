import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import { apiSlice } from './slices/apiSlice'
 

export default configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    products: productReducer, 
    cart: cartReducer,
    auth: authSliceReducer,
    order: orderReducer, 

  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});