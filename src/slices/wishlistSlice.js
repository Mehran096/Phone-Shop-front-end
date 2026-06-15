import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axios'

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/users/wishlist/${productId}`)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/users/wishlist/${productId}`)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const getWishlist = createAsyncThunk(
  'wishlist/get',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/wishlist')
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { 
    wishlistItems: [], 
    loading: false, 
    error: null 
  },
  reducers: {
    resetWishlist: (state) => {
      state.wishlistItems = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWishlist.pending, (state) => {
        state.loading = true
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlistItems = action.payload
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload
      })
  },
})

export const { resetWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer