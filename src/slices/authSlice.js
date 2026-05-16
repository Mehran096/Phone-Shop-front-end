import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
//import { clearCartItems } from './cartSlice'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL
//const  API = 'api'

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } }
      const { data } = await axios.post(`${API_URL}/users/auth`, { email, password }, config)
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } }
      const { data } = await axios.post(`${API_URL}/users`, { name, email, password }, config)
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

//logout
// export const logoutUser = createAsyncThunk(
//   'auth/logout',
//   async (_, { dispatch }) => {
//     await fetch(`${API_URL}/users/logout`, {
//       method: 'POST',
//       credentials: 'include',
//     })
//     dispatch(clearCartItems()) // clear cart on logout
//     return null
//   }
// )

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (user, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState()
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      const { data } = await axios.put(`${API_URL}/users/profile`, user, config)
      localStorage.setItem('userInfo', JSON.stringify(data))
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)
// GET ALL USERS - Admin only
export const listUsers = createAsyncThunk(
  'user/listUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`, // ← Must send token
        },
      }

      const { data } = await axios.get('/api/users', config)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// DELETE USER - Admin only
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }

      await axios.delete(`/api/users/${id}`, config)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 1. Define the thunks FIRST
export const getUserDetails = createAsyncThunk(
  'auth/getUserDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo }
    }= getState()
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      }
    
      const { data } = await axios.get(`/api/users/${id}`, config)
      return data
    
    
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  
})
//update user
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, name, email, isAdmin }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo }} = getState()
      const config = { 
        headers: { Authorization: `Bearer ${userInfo.token}` } 
      }
      const { data } = await axios.put(`/api/users/${id}`, { name, email, isAdmin }, config)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)
//createSlice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: userInfoFromStorage,
    users: [],
    loading: false,
    error: null,
    successDelete: false,
    success: false,
    userDetails: null,
    successUpdate: false
  },
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
    logout: (state) => {
      localStorage.removeItem('userInfo')
      state.userInfo = null
      state.loading = false
      state.error = null
      state.success = false
    },
    resetUpdate: (state) => {
      state.success = false
      state.error = null
    },
    resetUserList: (state) => {
      state.users = []
      state.error = null
    },
    resetUserUpdate: (state) => {
    state.successUpdate = false
  },
  },
  extraReducers: (builder) => {
    builder
    
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false
        state.userDetails = action.payload
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.successUpdate = true
      })
      .addCase(listUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // DELETE USER
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.successDelete = true
        state.users = state.users.filter((user) => user._id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.userInfo = action.payload })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(updateUserProfile.pending, (state) => { state.loading = true; state.success = false })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload
        state.success = true
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // .addCase(logoutUser.fulfilled, (state) => {
      //   state.userInfo = null
      //   state.loading = false
      //   state.error = null
      //   state.success = false
      // })
  },
})

export const { setCredentials, logout, resetUpdate, resetUserUpdate } = authSlice.actions
export default authSlice.reducer