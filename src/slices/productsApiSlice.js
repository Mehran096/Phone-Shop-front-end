import { apiSlice } from './apiSlice'
 
 

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = '', pageNumber = 1, category = '', brand = '' }) => ({
        url: '/products',
        params: { keyword, pageNumber, category, brand }, // add brand here
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Products'],
    }),

    getProductDetails: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data, // FormData
      }),
      invalidatesTags: ['Products'],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `/products/${productId}`,
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
        url: `/products/${id}/specs`,
        method: 'PUT',
        body: { specs },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.id }],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),

   getProductReviews: builder.query({
  query: ({ productId, page = 1, limit = 10, color, sort }) => ({
    url: `/products/${productId}/reviews`,
    params: { page, limit, color, sort },
  }),
  providesTags: (result, error, arg) => [
    { type: 'Product', id: arg.productId },
    { type: 'Reviews', id: 'LIST' }, // <-- Change Review to Reviews
  ],
}),

    createProductReview: builder.mutation({
  query: ({ productId, rating, comment, color, images }) => ({
    url: `/products/${productId}/reviews`,
    method: 'POST',
    body: { rating, comment, color, images },
  }),
  invalidatesTags: (result, error, { productId }) => [
    { type: 'Product', id: productId },
    { type: 'Reviews', id: 'LIST' }, // <-- Add this or modal won't update
  ],
}),
    updateReview: builder.mutation({
  query: (data) => ({
    url: `/products/${data.productId}/reviews/${data.reviewId}`, // <-- Add /${data.reviewId}
    method: 'PUT',
    body: data, // Send rating, comment, images
  }),
  invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.productId }],
}),
deleteReview: builder.mutation({
  query: ({ productId, reviewId }) => ({
    url: `/products/${productId}/reviews/${reviewId}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Product'],
}),
markReviewHelpful: builder.mutation({
  query: ({ productId, reviewId }) => ({
    url: `/products/${productId}/reviews/${reviewId}/helpful`,
    method: 'PUT',
  }),
  invalidatesTags: (result, error, { productId }) => [
    { type: 'Product', id: productId }, // <-- This updates ProductScreen + modal
  ],
}),
addAdminReply: builder.mutation({
  query: ({ productId, reviewId, reply }) => ({
    url: `/products/${productId}/reviews/${reviewId}/reply`,
    method: 'POST',
    body: { reply },
  }),
  invalidatesTags: (result, error, { productId }) => [
    { type: 'Product', id: productId },
    { type: 'Reviews', id: 'LIST' },
    { type: 'Reviews', id: productId },
  ],
}),
editAdminReply: builder.mutation({
  query: ({ productId, reviewId, reply }) => ({ // <-- Destructure properly
    url: `/products/${productId}/reviews/${reviewId}/reply`, // <-- Add reviewId
    method: 'PUT',
    body: { reply }, // <-- Only send reply, not whole data object
  }),
  invalidatesTags: (result, error, { productId }) => [ // <-- Add Reviews tags
    { type: 'Product', id: productId },
    { type: 'Reviews', id: 'LIST' },
    { type: 'Reviews', id: productId },
  ],
}),

deleteAdminReply: builder.mutation({
  query: ({ productId, reviewId }) => ({ // <-- Destructure properly
    url: `/products/${productId}/reviews/${reviewId}/reply`, // <-- Add reviewId
    method: 'DELETE',
  }),
  invalidatesTags: (result, error, { productId }) => [ // <-- Add Reviews tags
    { type: 'Product', id: productId },
    { type: 'Reviews', id: 'LIST' },
    { type: 'Reviews', id: productId },
  ],
}),
uploadProductImage: builder.mutation({
  query: (data) => ({
    url: '/upload',
    method: 'POST',
    body: data,
  }),
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
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
   useDeleteAdminReplyMutation,
   useUploadProductImageMutation
} = productsApiSlice