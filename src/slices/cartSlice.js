import { createSlice } from '@reduxjs/toolkit';
//const API_URL = import.meta.env.VITE_API_URL

// const initialState = localStorage.getItem('cart')
//     ? JSON.parse(localStorage.getItem('cart'))
//     : { cartItems: [], shippingAddress: {}, paymentMethod: 'PayPal' };
const cartFromStorage = localStorage.getItem('cart')
    ? JSON.parse(localStorage.getItem('cart'))
    : null;

const initialState = {
    cartItems: cartFromStorage?.cartItems || cartFromStorage?.cart?.cartItems || [],
    shippingAddress: cartFromStorage?.shippingAddress || cartFromStorage?.cart?.shippingAddress || {},
    paymentMethod: cartFromStorage?.paymentMethod || cartFromStorage?.cart?.paymentMethod || 'Stripe',
};
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) =>
                    x.product === existItem.product ? item : x // replace with new qty
                );
            } else {
                state.cartItems = [
                    ...state.cartItems,
                    {
                        product: item._id,  // <-- this is the key
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        qty: item.qty,
                    }
                ]
            }

            // Recalculate prices
            state.itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
            state.shippingPrice = state.itemsPrice > 100 ? 0 : 10
            state.taxPrice = Number((0.15 * state.itemsPrice).toFixed(2))
            state.totalPrice = Number(state.itemsPrice) + Number(state.shippingPrice) + Number(state.taxPrice)


            localStorage.setItem('cart', JSON.stringify(state));
        },
        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
            localStorage.setItem('cart', JSON.stringify(state));
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
            localStorage.setItem('cart', JSON.stringify(state));
        },
        updateCartQty: (state, action) => {
            const { product, qty } = action.payload;
            const existItem = state.cartItems.find((x) => x.product === product);
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