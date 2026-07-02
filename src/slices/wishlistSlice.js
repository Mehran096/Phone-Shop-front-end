import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axios'

// Get wishlist
export const getWishlist = createAsyncThunk(
  'wishlist/get',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        withCredentials: true,
      }
      const { data } = await api.get('/users/wishlist', config)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Add to wishlist - UPDATED: added countInStock
export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async ({ product, color, storage, image, price, name, countInStock, slug, qty }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
      const { data } = await api.post('/users/wishlist', {
        product,
        slug,
        color,
        storage,
        image,
        price,
        name,
        countInStock, // <-- Added this
        qty: qty || 1,
      }, config)
      return data // returns updated wishlist array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Remove from wishlist - uses wishlist item _id
export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (wishlistItemId, { rejectWithValue }) => {
    try {
      const config = {
        withCredentials: true,
      }
      const { data } = await api.delete(`/users/wishlist/${wishlistItemId}`, config)
      return data // returns updated wishlist array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Update wishlist item qty - NEW THUNK
export const updateWishlistQty = createAsyncThunk(
  'wishlist/updateQty',
  async ({ id, qty }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
      const { data } = await api.put(`/users/wishlist/${id}`, { qty }, config)
      return data // returns updated wishlist item
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
    error: null,
    success: false,
  },
  reducers: {
    resetWishlist: (state) => {
      state.wishlistItems = []
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Get wishlist
     .addCase(getWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
     .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlistItems = action.payload
      })
     .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add to wishlist
     .addCase(addToWishlist.pending, (state) => {
        state.loading = true
        state.success = false
        state.error = null
      })
     .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.wishlistItems = action.payload
      })
     .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Remove from wishlist
     .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
     .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.wishlistItems = action.payload
      })
     .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update wishlist qty - NEW CASES
     .addCase(updateWishlistQty.pending, (state) => {
        state.loading = true
        state.error = null
      })
     .addCase(updateWishlistQty.fulfilled, (state, action) => {
        state.loading = false
        const updatedItem = action.payload
        const index = state.wishlistItems.findIndex((x) => x._id === updatedItem._id)
        if (index!== -1) {
          state.wishlistItems[index] = updatedItem
        }
      })
     .addCase(updateWishlistQty.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer