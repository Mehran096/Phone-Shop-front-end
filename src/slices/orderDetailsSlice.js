import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

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

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState: { loading: true },
  extraReducers: (builder) => {
    builder
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
  }
})

export default orderDetailsSlice.reducer