import { createSlice } from '@reduxjs/toolkit'

// Read from separate localStorage keys - NOT 'cart'
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : []

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {}

const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
  ? localStorage.getItem('paymentMethod')
  : 'Stripe'

const initialState = {
  cartItems: cartItemsFromStorage,
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
}

const updateCartPrices = (state) => {
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
  }

  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  )

  state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10)
   

  state.totalPrice = addDecimals(
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  )

  localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload

      const existItem = state.cartItems.find(
        (x) => x.product === item.product && x.color === item.color && x.storage === item.storage
      )

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product && x.color === existItem.color && x.storage === existItem.storage ? item : x
        )
      } else {
        state.cartItems = [
          ...state.cartItems,
          { ...item },
           
        ]
      }

      updateCartPrices(state)
    },

    removeFromCart: (state, action) => {
      const { product, color, storage } = action.payload
      state.cartItems = state.cartItems.filter(
        (x) => !(x.product === product && x.color === color && x.storage === storage)
      )
      updateCartPrices(state)
    },

    updateCartQty: (state, action) => {
      const { product, color, storage, qty } = action.payload
      const existItem = state.cartItems.find(
        (x) => x.product === product && x.color === color && x.storage === storage
      )
      if (existItem) {
        existItem.qty = qty
      }
      updateCartPrices(state)
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload
      localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress))
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload
      localStorage.setItem('paymentMethod', action.payload)
    },

    setCartItems: (state, action) => {
      state.cartItems = action.payload
      updateCartPrices(state)
    },

    clearCartItems: (state) => {
      state.cartItems = []
      state.itemsPrice = 0
      state.shippingPrice = 0
      state.taxPrice = 0
      state.totalPrice = 0
      localStorage.removeItem('cartItems')
    },

    resetCart: (state) => {
      state.cartItems = []
      state.shippingAddress = {}
      state.paymentMethod = ''
      state.itemsPrice = 0
      state.shippingPrice = 0
      state.taxPrice = 0
      state.totalPrice = 0
      localStorage.removeItem('cartItems')
      localStorage.removeItem('shippingAddress')
      localStorage.removeItem('paymentMethod')
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
  resetCart,
} = cartSlice.actions

export default cartSlice.reducer