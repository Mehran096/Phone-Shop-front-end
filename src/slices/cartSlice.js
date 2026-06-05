import { createSlice } from '@reduxjs/toolkit'

const cartFromStorage = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : null

const initialState = {
  cartItems: cartFromStorage?.cartItems || [],
  shippingAddress: cartFromStorage?.shippingAddress || {},
  paymentMethod: cartFromStorage?.paymentMethod || 'Stripe',
  itemsPrice: cartFromStorage?.itemsPrice || 0,
  shippingPrice: cartFromStorage?.shippingPrice || 0,
  taxPrice: cartFromStorage?.taxPrice || 0,
  totalPrice: cartFromStorage?.totalPrice || 0,
}

// const updateCartPrices = (state) => {
  
//   state.itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
//   state.shippingPrice = state.itemsPrice > 500 ? 0 : 10
//   state.taxPrice = Number((0.15 * state.itemsPrice).toFixed(2))
//   state.totalPrice = (
//     state.itemsPrice +
//     state.shippingPrice +
//     state.taxPrice
//   ).toFixed(2)
//   localStorage.setItem('cart', JSON.stringify(state))
// }

const updateCartPrices = (state) => {
  // Helper to avoid 0.1 + 0.2 = 0.30000004 bugs
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
  }

  // Calculate itemsPrice as number first
  state.itemsPrice = state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  
  // Free shipping over 500, else 10
  state.shippingPrice = state.itemsPrice > 500 ? 0 : 10
  
  // Tax is 15%
  state.taxPrice = Number((0.15 * state.itemsPrice).toFixed(2))
  
  // Now add as numbers, then format to string with 2 decimals
  state.totalPrice = (
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  ).toFixed(2)
  
  // Format itemsPrice and shippingPrice last so they don't break math above
  state.itemsPrice = addDecimals(state.itemsPrice)
  state.shippingPrice = addDecimals(state.shippingPrice)
  state.taxPrice = addDecimals(state.taxPrice)

  localStorage.setItem('cart', JSON.stringify(state))
  return state
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload
      
      // Key = product + color combination
      const existItem = state.cartItems.find(
        (x) => x.product === item.product && x.color === item.color
      )

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product && x.color === existItem.color ? item : x
        )
      } else {
        state.cartItems = [
        ...state.cartItems,
          {
            product: item.product, // _id
            name: item.name,
            image: item.image,
            price: item.price,
            color: item.color || '',
            hexCode: item.hexCode || '',
            countInStock: item.countInStock || 0,
            qty: item.qty,
          }
        ]
      }

      updateCartPrices(state)
    },

    removeFromCart: (state, action) => {
      // Now takes { product, color } instead of just product
      const { product, color } = action.payload
      state.cartItems = state.cartItems.filter(
        (x) => !(x.product === product && x.color === color)
      )
      updateCartPrices(state)
    },

    updateCartQty: (state, action) => {
      const { product, color, qty } = action.payload
      const existItem = state.cartItems.find(
        (x) => x.product === product && x.color === color
      )
      if (existItem) {
        existItem.qty = qty
      }
      updateCartPrices(state)
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload
      localStorage.setItem('cart', JSON.stringify(state))
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload
      localStorage.setItem('cart', JSON.stringify(state))
    },

    clearCartItems: (state) => {
      state.cartItems = []
      updateCartPrices(state)
    },
    setCartItems: (state, action) => { // <- Add this
  state.cartItems = action.payload
  updateCartPrices(state)
},
  },
})

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  setCartItems,
} = cartSlice.actions

export default cartSlice.reducer