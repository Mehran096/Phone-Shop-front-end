import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import { apiSlice } from './slices/apiSlice'
import wishlistReducer from './slices/wishlistSlice'
import compareReducer from './slices/compareSlice';

export default configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    products: productReducer, 
    cart: cartReducer,
    auth: authSliceReducer,
    order: orderReducer, 
    wishlist: wishlistReducer,
    compare: compareReducer,

  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});