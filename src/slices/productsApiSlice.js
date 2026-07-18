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
    getSearchSuggestions: builder.query({
      query: (keyword) => ({
        url: '/products',
        params: {
          keyword,
          pageSize: 6,
          suggestions: true,
        },
      }),
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
        url: `/products/${data._id}`, // V38.66 KEY: use _id not id
        method: 'PUT',
        body: data, // <-- V9.8: JSON only. Frontend already uploaded to Cloudinary
      }),
      invalidatesTags: (result, error, arg) => [
        'Products',
        { type: 'Product', id: arg._id }, // V38.66 KEY: use _id not id
        { type: 'Product', id: result?.slug },
      ],
    }),
    getBestSellerProducts: builder.query({
      query: () => '/products/bestsellers',
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getDealsProducts: builder.query({
      query: () => '/products/deals',
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getNewArrivalProducts: builder.query({
      query: () => '/products/new-arrivals',
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getCompareProducts: builder.query({
  query: (slugs) => ({
    url: "/products/compare",
    params: {
      slugs: Array.isArray(slugs)
        ? slugs.join(",")
        : slugs,
    },
  }),
  providesTags: ["Products"],
  keepUnusedDataFor: 5,
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
      query: ({
        productId,
        page = 1,
        limit = 10,
        color = '',
        storage = '',
        sort = '',
        keyword = '',
        rating = "",
      }) => ({
        url: `/products/${productId}/reviews`,
        params: {
          page,
          limit,
          ...(color && { color }),
          ...(storage && { storage }),
          ...(sort && { sort }),
          ...(keyword && { keyword }),
          ...(rating && { rating }),
        },
      }),
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
    markReviewNotHelpful: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}/not-helpful`,
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

    deleteCloudinaryImage: builder.mutation({ // V33.34A: V31.84 format
      query: (publicId) => ({
        url: '/upload', // V33.34 KEY: No param in URL
        method: 'DELETE',
        body: { publicId }, // V33.34 KEY: Send in body
        credentials: 'include',
      }),
    }),

    deleteCloudinaryImagesBatch: builder.mutation({ // V38.48 KEY: BATCH DELETE
      query: (data) => ({
        url: '/upload/delete', // V38.48 KEY: Matches new backend POST route
        method: 'POST',
        body: data, // { publicIds: ['id1', 'id2'] }
        credentials: 'include',
      })
    }),


  }),
});

export const {
  useGetProductsQuery,
  useGetSearchSuggestionsQuery,
  useGetProductDetailsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductSpecsMutation,
  useDeleteProductMutation,
  useGetProductReviewsQuery,
  useCreateProductReviewMutation,
  useUpdateReviewMutation,
  useGetBestSellerProductsQuery,
  useGetDealsProductsQuery,
  useGetNewArrivalProductsQuery,
  useGetCompareProductsQuery,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewNotHelpfulMutation,
  useAddAdminReplyMutation,
  useEditAdminReplyMutation,
  useDeleteAdminReplyMutation,
  useUploadProductImageMutation,
  useUploadReviewImageMutation,
  useDeleteCloudinaryImageMutation,
  useDeleteCloudinaryImagesBatchMutation,
} = productsApiSlice;