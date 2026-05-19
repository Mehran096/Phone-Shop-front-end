import { apiSlice } from './apiSlice'
const API_URL = import.meta.env.VITE_API_URL

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductDetails: builder.query({
      query: (id) => `${API_URL}/products/${id}`,
      keepUnusedDataFor: 5,
    }),
    updateProductSpecs: builder.mutation({
      query: ({ id, specs }) => ({
        url: `${API_URL}/products/${id}/specs`,
        method: 'PUT',
        body: { specs },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const { useGetProductDetailsQuery, useUpdateProductSpecsMutation } = productsApiSlice