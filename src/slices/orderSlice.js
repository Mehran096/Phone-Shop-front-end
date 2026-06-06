import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
 
import { toast } from 'react-toastify'
import api from '../utils/axios'

const API_URL = import.meta.env.VITE_API_URL

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (order, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState() // ← Get token from Redux
            
            if (!userInfo) {
        return rejectWithValue('You need to be logged in to place an order')
      }


             

            // Map cartItems to match backend schema
      const orderItems = order.orderItems.map(item => ({
        product: item.product,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
         
      }))

            const { data } = await api.post(`/orders`, {...order, orderItems})
             
            return data
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            )
        }
    }
)


// 1. GET LOGGED IN USER ORDERS
export const listMyOrders = createAsyncThunk(
    'order/listMyOrders',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState()
            
            const { data } = await api.get(`/orders/myorders`)
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
        }
    }
)

// 2. GET ORDER DETAILS BY ID
export const getOrderDetails = createAsyncThunk(
    'order/getOrderDetails',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState()
            
            const { data } = await api.get(`/orders/${id}`)
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
        }
    }
)

// 3. PAY ORDER
export const payOrder = createAsyncThunk(
    'order/payOrder',
    async ({ orderId, paymentResult }, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState()
             
            const { data } = await api.put(`/orders/${orderId}/pay`, paymentResult)
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
        }
    }
)

// 4. GET ALL ORDERS - ADMIN ONLY - THIS IS THE ONE YOU'RE MISSING
export const listOrders = createAsyncThunk(
  'orders/listOrders',
  async ({ pageNumber = 1, keyword = '' }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState()
      
     
      
      const { data } = await api.get(
        `/orders?pageNumber=${pageNumber}&keyword=${keyword}`
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 5. MARK ORDER AS DELIVERED - ADMIN ONLY
export const deliverOrder = createAsyncThunk(
    'order/deliverOrder',
    async (orderId, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState()
            
            const { data } = await api.put(`/orders/${orderId}/deliver`, {})
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
        }
    }
)

// Delete order - admin only
export const deleteOrder = createAsyncThunk(
    'orders/deleteOrder',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState() 

            

            await api.delete(`/orders/${id}`)
            return id
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            )
        }
    }
)

// NEW: Stripe checkout session
export const createCheckoutSession = createAsyncThunk(
  'order/createCheckoutSession',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } }= getState()

      if (!userInfo) {
        return rejectWithValue('You need to be logged in')
      }

      

      const { data } = await api.post(
        `/orders/create-checkout-session`, 
        orderData
         
      )
      
      // Redirect to Stripe checkout
      window.location.href = data.url
      return data
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    }
  }
)

export const verifyStripeSession = createAsyncThunk(
  'order/verifyStripeSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/verify-session/${sessionId}`)
      return data
    } catch (error) {
      return rejectWithValue(error.response.data.message)
    }
  }
)


const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        myOrders: [],
        success: false,
        order: {},
        loading: false,
        error: null,
        successPay: false,
        successDeliver: false,
        successDelete: false,
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
            state.error = null
             state.order = {}
        },
        resetPay: (state) => {
            state.successPay = false
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
            .addCase(createOrder.pending, (state) => { state.loading = true, state.error = null })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.order = action.payload
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(listMyOrders.pending, (state) => { state.loading = true; state.error = null })
            .addCase(listMyOrders.fulfilled, (state, action) => { state.loading = false; state.myOrders = action.payload })
            .addCase(listMyOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(getOrderDetails.pending, (state) => { state.loading = true; state.error = null })
            .addCase(getOrderDetails.fulfilled, (state, action) => { state.loading = false; state.order = action.payload })
            .addCase(getOrderDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(payOrder.pending, (state) => { state.loading = true })
            .addCase(payOrder.fulfilled, (state, action) => { state.loading = false; state.successPay = true; state.order = action.payload })
            .addCase(payOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(listOrders.pending, (state) => { state.loading = true; state.error = null })
           .addCase(listOrders.fulfilled, (state, action) => {
  state.loading = false
  state.orders = action.payload.orders
  state.page = action.payload.page
  state.pages = action.payload.pages
})
            .addCase(listOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(deliverOrder.pending, (state) => { state.loading = true })
            .addCase(deliverOrder.fulfilled, (state, action) => { state.loading = false; state.successDeliver = true; state.order = action.payload })
            .addCase(deliverOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            // Delete order
            .addCase(deleteOrder.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false
                state.successDelete = true
                state.orders = state.orders.filter(order => order._id !== action.payload)
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
             // NEW: handle checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(verifyStripeSession.pending, (state) => {
        state.loading = true
      })
      .addCase(verifyStripeSession.fulfilled, (state, action) => {
        state.loading = false
        state.successPay = true
        state.order = action.payload // This gets the paid order from backend
        toast.success('Order paid successfully')
      })
      .addCase(verifyStripeSession.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
       
    },
})

export const { resetMyOrders, resetOrder, resetPay, resetDeliver, resetDelete } = orderSlice.actions
export default orderSlice.reducer