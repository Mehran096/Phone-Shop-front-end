import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth slice
    const token = getState().auth.userInfo?.token
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    
    return headers
  },
})

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: () => ({}),
})