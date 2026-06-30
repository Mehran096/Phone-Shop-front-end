import { apiSlice } from './apiSlice';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword, pageNumber, category, brand, minPrice, maxPrice, sort }) => ({
        url: '/products',
        params: { keyword, pageNumber, category, brand, minPrice, maxPrice, sort },
      }),
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
      keepUnusedDataFor: 5,
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `/products/${data.id}`, // <-- V9.8 FIX: data.id not data.productId
        method: 'PUT',
        body: data, // <-- V9.8: JSON only. Frontend already uploaded to Cloudinary
      }),
      invalidatesTags: (result, error, arg) => [
        'Products',
        { type: 'Product', id: arg.id }, // <-- V9.8 FIX: arg.id not arg.productId
        { type: 'Product', id: result?.slug },
      ],
    }),
    updateProductSpecs: builder.mutation({
      query: ({ productId, specs }) => ({
        url: `/products/${productId}/specs`,
        method: 'PUT',
        body: specs,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    getProductReviews: builder.query({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: ['Reviews'],
      keepUnusedDataFor: 5,
    }),
    createProductReview: builder.mutation({
      query: ({ productId, ...data }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Reviews', id: 'LIST' },
      ],
    }),
    updateReview: builder.mutation({
      query: (data) => ({
        url: `/products/${data.productId}/reviews/${data.reviewId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Product', id: arg.productId },
        { type: 'Reviews', id: 'LIST' },
      ],
    }),
    deleteReview: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Reviews', id: 'LIST' },
      ],
    }),
    markReviewHelpful: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}/helpful`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
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
      query: ({ productId, reviewId, reply }) => ({
        url: `/products/${productId}/reviews/${reviewId}/reply`,
        method: 'PUT',
        body: { reply },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Reviews', id: 'LIST' },
        { type: 'Reviews', id: productId },
      ],
    }),
    deleteAdminReply: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}/reply`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'Reviews', id: 'LIST' },
        { type: 'Reviews', id: productId },
      ],
    }),
    uploadProductImage: builder.mutation({ // V8.6 for Products -> Admin only
      query: (formData) => ({
        url: '/upload/products', // <-- hits :type = products
        method: 'POST',
        body: formData,
        credentials: 'include', // <-- send cookie
      }),
      invalidatesTags: ['Product'], // optional: refetch after upload
    }),

    uploadReviewImage: builder.mutation({ // V8.6 for Reviews -> Public
      query: (formData) => ({
        url: '/upload/reviews', // <-- hits :type = reviews
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
    }),

    removeProductImageMutation: builder.mutation({
      query: ({ public_id }) => ({
        url: `/upload/public_id/${encodeURIComponent(public_id)}`,
        method: 'DELETE',
      }),
    }),


  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetProductBySlugQuery,
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
  useUploadProductImageMutation,
  useUploadReviewImageMutation,
  useRemoveProductImageMutation
} = productsApiSlice;