import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (order, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState() // ← Get token from Redux
            
            if (!userInfo) {
        return rejectWithValue('You need to be logged in to place an order')
      }


            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,  
                },
            }

            // Map cartItems to match backend schema
      const orderItems = order.orderItems.map(item => ({
        product: item.product,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
         
      }))

            const { data } = await axios.post(`${API_URL}/orders`, {...order, orderItems}, config)
             
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
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.get(`${API_URL}/orders/myorders`, config)
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
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.get(`${API_URL}/orders/${id}`, config)
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
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.put(`${API_URL}/orders/${orderId}/pay`, paymentResult, config)
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
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const { data } = await axios.get(
        `${API_URL}/orders?pageNumber=${pageNumber}&keyword=${keyword}`,
        config
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
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.put(`${API_URL}/orders/${orderId}/deliver`, {}, config)
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

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            }

            await axios.delete(`${API_URL}/orders/${id}`, config)
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

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      const { data } = await axios.post(
        `${API_URL}/orders/create-checkout-session`, 
        orderData, 
        config
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
       
    },
})

export const { resetMyOrders, resetOrder, resetPay, resetDeliver, resetDelete } = orderSlice.actions
export default orderSlice.reducer