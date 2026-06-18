import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import api from '../utils/axios'

// 1. CREATE ORDER - COD ONLY 
// 1. CREATE ORDER - COD ONLY
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const orderItems = orderData.orderItems.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
        color: item.color || '',
        hexCode: item.hexCode || '',
      }))

      const payload = {
        orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod, // USE THE REAL ONE, NOT 'COD'
        itemsPrice: orderData.itemsPrice,
        taxPrice: orderData.taxPrice,
        shippingPrice: orderData.shippingPrice,
        totalPrice: orderData.totalPrice,
      }

      const { data } = await api.post('/orders', payload)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

 
// 2. CREATE STRIPE CHECKOUT SESSION
export const createCheckoutSession = createAsyncThunk(
  'order/createCheckoutSession',
  async (orderData, { rejectWithValue }) => {
    try {
      const orderItems = orderData.orderItems.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
        color: item.color || '',
        hexCode: item.hexCode || '',
      }))

      const payload = {
        orderItems,
        shippingAddress: orderData.shippingAddress,
         paymentMethod: orderData.paymentMethod,
        itemsPrice: orderData.itemsPrice,
        shippingPrice: orderData.shippingPrice,
        taxPrice: orderData.taxPrice,
        totalPrice: orderData.totalPrice,
      }

      const { data } = await api.post('/orders/create-checkout-session', payload)
      window.location.href = data.url
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 3. VERIFY STRIPE SESSION
export const verifyStripeSession = createAsyncThunk(
  'order/verifyStripeSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/verify-session/${sessionId}`)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 4. GET LOGGED IN USER ORDERS
export const listMyOrders = createAsyncThunk(
  'order/listMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders/myorders')
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 5. GET ORDER DETAILS BY ID
export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${id}`)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 6. GET ALL ORDERS - ADMIN ONLY
export const listOrders = createAsyncThunk(
  'order/listOrders',
  async ({ pageNumber = 1, keyword = '' }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/orders?pageNumber=${pageNumber}&keyword=${keyword}`
      )
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 7. SHIP ORDER - ADMIN ONLY - ADDS TRACKING
export const shipOrder = createAsyncThunk(
  'order/shipOrder',
  async ({ orderId, trackingNumber, carrier }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/deliver`, {
        trackingNumber,
        carrier
      })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 8. MARK ORDER AS DELIVERED - ADMIN ONLY
export const deliverOrder = createAsyncThunk(
  'order/deliverOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/markasdelivered`, {})
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 9. DELETE ORDER - ADMIN ONLY
export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/orders/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    myOrders: [],
    order: null,
    success: false,
    successVerify: false,
    successShip: false,
    successDeliver: false,
    successDelete: false,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
  },
  reducers: {
    resetMyOrders: (state) => {
      state.myOrders = []
      state.error = null
    },
    resetOrder: (state) => {
      state.loading = false
      state.success = false
      state.successVerify = false
      state.error = null
      state.order = null
    },
    resetShip: (state) => {
      state.successShip = false
    },
    resetDeliver: (state) => {
      state.successDeliver = false
    },
    resetDelete: (state) => {
      state.successDelete = false
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE ORDER - COD
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload
        state.success = true
        toast.success('Order placed successfully')
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // CREATE CHECKOUT SESSION - STRIPE
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // VERIFY STRIPE SESSION
      .addCase(verifyStripeSession.pending, (state) => {
        state.loading = true
        state.successVerify = false
      })
      .addCase(verifyStripeSession.fulfilled, (state, action) => {
        state.loading = false
        state.successVerify = true
        state.order = action.payload
        toast.success('Payment confirmed!')
      })
      .addCase(verifyStripeSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // LIST MY ORDERS
      .addCase(listMyOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(listMyOrders.fulfilled, (state, action) => {
        state.loading = false
        state.myOrders = action.payload
      })
      .addCase(listMyOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // GET ORDER DETAILS
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // LIST ALL ORDERS - ADMIN
      .addCase(listOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // SHIP ORDER
      .addCase(shipOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(shipOrder.fulfilled, (state, action) => {
        state.loading = false
        state.successShip = true
        state.order = action.payload
        toast.success('Order marked as shipped')
      })
      .addCase(shipOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // DELIVER ORDER
      .addCase(deliverOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(deliverOrder.fulfilled, (state, action) => {
        state.loading = false
        state.successDeliver = true
        state.order = action.payload
        toast.success('Order marked as delivered')
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // DELETE ORDER
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false
        state.successDelete = true
        state.orders = state.orders.filter((o) => o._id !== action.payload)
        toast.success('Order deleted')
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
  },
})

export const { resetMyOrders, resetOrder, resetShip, resetDeliver, resetDelete } = orderSlice.actions
export default orderSlice.reducer