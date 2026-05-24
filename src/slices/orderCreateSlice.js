 
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
                    Authorization: `Bearer ${userInfo.token}`, // ← This line is missing
                },
            }

            const { data } = await axios.post(`${API_URL}/orders`, order, config)
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

const orderCreateSlice = createSlice({
  name: 'orderCreate',
  initialState: {
     order: {},
      loading: false,
        error: null,
        success:false,
  },
  reducers: {
    resetOrder: (state) => {
      state.order = null
      state.success = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.order = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { resetOrder } = orderCreateSlice.actions
export default orderCreateSlice.reducer