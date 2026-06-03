import { apiSlice } from './apiSlice'
const API_URL = import.meta.env.VITE_API_URL
const PRODUCTS_URL = `${API_URL}/products`

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = '', pageNumber = 1, category = '' }) => ({
        url: PRODUCTS_URL,
        params: { keyword, pageNumber, category },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Products'],
    }),

    getProductDetails: builder.query({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data, // FormData
      }),
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, arg) => [
        'Products',
        { type: 'Product', id: arg.productId },
      ],
    }),

    updateProductSpecs: builder.mutation({
      query: ({ id, specs }) => ({
        url: `${PRODUCTS_URL}/${id}/specs`,
        method: 'PUT',
        body: { specs },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.id }],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),

    createProductReview: builder.mutation({
      query: ({ productId, rating, comment, color }) => ({
        url: `${PRODUCTS_URL}/${productId}/reviews`,
        method: 'POST',
        body: { rating, comment, color },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.productId }],
    }),
    updateReview: builder.mutation({
  query: (data) => ({
    url: `${PRODUCTS_URL}/${data.productId}/reviews`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: ['Product'],
}),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductSpecsMutation,
  useDeleteProductMutation,
  useCreateProductReviewMutation, // <-- new
  useUpdateReviewMutation
} = productsApiSlice