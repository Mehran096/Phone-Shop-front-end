import { createSlice } from '@reduxjs/toolkit';

// const initialState = localStorage.getItem('cart')
//     ? JSON.parse(localStorage.getItem('cart'))
//     : { cartItems: [], shippingAddress: {}, paymentMethod: 'PayPal' };
const initialState = {
  cartItems: localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [],
  shippingAddress: localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : {},
  paymentMethod: 'PayPal',
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x._id === item._id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x._id === existItem._id ? item : x // replace with new qty
                );
            } else {
                state.cartItems = [...state.cartItems, item];
            }

            localStorage.setItem('cart', JSON.stringify(state));
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
            localStorage.setItem('cart', JSON.stringify(state));
        },
        // Add this new reducer
        updateCartQty: (state, action) => {
            const { _id, qty } = action.payload;
            const existItem = state.cartItems.find((x) => x._id === _id);

            if (existItem) {
                existItem.qty = qty;
            }

            localStorage.setItem('cart', JSON.stringify(state));
        },
        // Add this
        saveShippingAddress: (state, action) => {
            state.shippingAddress = action.payload;
            localStorage.setItem('cart', JSON.stringify(state));
        },
        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
            localStorage.setItem('cart', JSON.stringify(state));
        },
        clearCartItems: (state) => {
            state.cartItems = [];
            localStorage.setItem('cart', JSON.stringify(state));
        },
    },
});

export const {
    addToCart,
    removeFromCart,
    updateCartQty,
    saveShippingAddress,
    savePaymentMethod,
    clearCartItems
} = cartSlice.actions;
export default cartSlice.reducer;