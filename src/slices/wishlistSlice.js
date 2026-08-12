import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axios'

// Get wishlist
export const getWishlist = createAsyncThunk(
  'wishlist/get',
  async (_, { rejectWithValue }) => {
    try {
      const config = { withCredentials: true }
      const { data } = await api.get('/wishlist', config)
      return data // returns { user, items: [], _id, createdAt }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Toggle wishlist - handles both add + remove for product + accessory
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async ({ 
    type, 
    productId, 
    accessoryId, 
    modelIndex = 0, 
    accessoryVariantIndex = 0,
    productVariantIndex = 0,
    productColorIndex = 0
  }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
      const { data } = await api.post('/wishlist/toggle', { 
        type, 
        productId, 
        accessoryId, 
        modelIndex, 
        accessoryVariantIndex,
        productVariantIndex,
        productColorIndex
      }, config)
      return data.wishlist // backend returns { message, wishlist }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Remove by item._id
export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeItem',
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      const config = { withCredentials: true }
      await api.delete(`/wishlist/${itemId}`, config)
      // Refetch to get updated prices/discounts from backend
      dispatch(getWishlist())
      return itemId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Clear all
export const clearWishlist = createAsyncThunk(
  'wishlist/clear',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const config = { withCredentials: true }
      await api.delete('/wishlist', config)
      dispatch(getWishlist())
      return { items: [] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlist: { items: [] },
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetWishlist: (state) => {
      state.wishlist = { items: [] }
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Get
      .addCase(getWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlist = action.payload
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Toggle
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true
        state.success = false
        state.error = null
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.wishlist = action.payload
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Remove - FIXED: just refetch
      .addCase(removeWishlistItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeWishlistItem.fulfilled, (state) => {
        state.loading = false
        // state updated by getWishlist dispatch
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Clear
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false
        // state updated by getWishlist dispatch
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer