import { apiSlice } from './apiSlice'

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductDetails: builder.query({
      query: (id) => `/api/products/${id}`,
      keepUnusedDataFor: 5,
    }),
    updateProductSpecs: builder.mutation({
      query: ({ id, specs }) => ({
        url: `/api/products/${id}/specs`,
        method: 'PUT',
        body: { specs },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const { useGetProductDetailsQuery, useUpdateProductSpecsMutation } = productsApiSlice