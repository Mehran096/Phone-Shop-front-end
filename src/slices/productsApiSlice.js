import { apiSlice } from './apiSlice'
 
 

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = '', pageNumber = 1, category = '' }) => ({
        url: '/products',
        params: { keyword, pageNumber, category },
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

    createProductReview: builder.mutation({
      query: ({ productId, rating, comment, color, images }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: { rating, comment, color, images },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Product', id: arg.productId }],
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
  query: (data) => ({
    url: `/products/${data.productId}/reviews/helpful`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: ['Product'],
}),
addAdminReply: builder.mutation({
  query: (data) => ({
    url: `/products/${data.productId}/reviews/reply`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: ['Product'],
}),
editAdminReply: builder.mutation({
  query: (data) => ({
    url: `/products/${data.productId}/reviews/reply/edit`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: ['Product'],
}),
deleteAdminReply: builder.mutation({
  query: (data) => ({
    url: `/products/${data.productId}/reviews/reply`,
    method: 'DELETE',
    body: data,
  }),
  invalidatesTags: ['Product'],
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
  useCreateProductReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
   useDeleteAdminReplyMutation,
   useUploadProductImageMutation
} = productsApiSlice