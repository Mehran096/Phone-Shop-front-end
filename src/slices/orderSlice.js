import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (order, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState() // ← Get token from Redux

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`, // ← This line is missing
        },
      }

      const { data } = await axios.post('/api/orders', order, config)
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
            const { data } = await axios.get('/api/orders/myorders', config)
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
            const { data } = await axios.get(`/api/orders/${id}`, config)
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
            const { data } = await axios.put(`/api/orders/${orderId}/pay`, paymentResult, config)
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
        }
    }
)

// 4. GET ALL ORDERS - ADMIN ONLY - THIS IS THE ONE YOU'RE MISSING
export const listOrders = createAsyncThunk(
    'order/listOrders',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState()
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } }
            const { data } = await axios.get('/api/orders', config)
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
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
            const { data } = await axios.put(`/api/orders/${orderId}/deliver`, {}, config)
            return data
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message)
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
    },
    reducers: {
        resetMyOrders: (state) => {
            state.myOrders = []
            state.error = null
        },
        resetOrder: (state) => {
            state.success = false
            state.error = null
        },
        resetPay: (state) => {
            state.successPay = false
        },
        resetDeliver: (state) => {
            state.successDeliver = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => { state.loading = true })
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
            .addCase(listOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload })
            .addCase(listOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(deliverOrder.pending, (state) => { state.loading = true })
            .addCase(deliverOrder.fulfilled, (state, action) => { state.loading = false; state.successDeliver = true; state.order = action.payload })
            .addCase(deliverOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload })
    },
})

export const { resetMyOrders, resetOrder, resetPay, resetDeliver } = orderSlice.actions
export default orderSlice.reducer