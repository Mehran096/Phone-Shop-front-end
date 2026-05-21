import { apiSlice } from './apiSlice'
const API_URL = import.meta.env.VITE_API_URL

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductDetails: builder.query({
      query: (id) =>({ url:`${API_URL}/products/${id}`}),
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: () => ({
        url: `/api/products`,
        method: 'POST'
      }),
      invalidatesTags: ['Products']
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/api/products/${data.productId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Products']
    }),
    updateProductSpecs: builder.mutation({
      query: ({ id, specs }) => ({
        url: `${API_URL}/products/${id}/specs`,
        method: 'PUT',
        body: { specs },
      }),
      invalidatesTags: ['Product'],
    }),

    getProducts: builder.query({
  query: ({ keyword = '', pageNumber = 1 }) => ({
    url: `${API_URL}/products`,
    params: { keyword, pageNumber },
  }),
  providesTags: ['Product'],
  keepUnusedDataFor: 5,
}),

deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${API_URL}/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'], // this makes the list refetch after delete
    }),
  }),
})



export const { 
  useGetProductDetailsQuery,
  useCreateProductMutation, 
  useUpdateProductMutation,
   useUpdateProductSpecsMutation,
  useGetProductsQuery,
    useDeleteProductMutation,
    } = productsApiSlice