import { apiSlice } from './apiSlice';

export const accessoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/accessories?keyword=&pageNumber=&type=
    getAccessories: builder.query({
      query: ({ keyword = '', pageNumber = '', type = '' }) => ({
        url: '/accessories',
        params: { keyword, pageNumber, type },
      }),
      providesTags: ['Accessories'],
      keepUnusedDataFor: 5,
    }),

    // GET /api/accessories/:id
    getAccessoryDetails: builder.query({
      query: (id) => `/accessories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Accessory', id }],
      keepUnusedDataFor: 5,
    }),

    // GET /api/accessories/slug/:slug
    getAccessoryBySlug: builder.query({
      query: (slug) => `/accessories/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Accessory', id: slug }],
      keepUnusedDataFor: 5,
    }),

    // POST /api/accessories
    createAccessory: builder.mutation({
      query: (data) => ({
        url: '/accessories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Accessories'],
    }),

    // PUT /api/accessories/:id
    updateAccessory: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `/accessories/${_id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Accessory', id: _id },
        'Accessories',
      ],
    }),

    // DELETE /api/accessories/:id
    deleteAccessory: builder.mutation({
      query: (id) => ({
        url: `/accessories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Accessories'],
    }),

    // POST /api/upload/accessories
    uploadAccessoryImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/accessories',
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
    }),

    // ===== V33.80 KEY: ACCESSORY REVIEW ENDPOINTS =====
    // POST /api/accessories/:id/reviews
    createAccessoryReview: builder.mutation({
      query: ({ slug, review }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews`, // CHANGED
        method: 'POST',
        body: review,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { slug }) => [ // CHANGED
        { type: 'Accessory', id: slug },
        'Accessories'
      ],
    }),

    // PUT /api/accessories/slug/:slug/reviews/:reviewId
    updateAccessoryReview: builder.mutation({
      query: ({ slug, reviewId, review }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}`, // CHANGED
        method: 'PUT',
        body: review,
        credentials: 'include',
      }),
      invalidatesTags: ['Reviews', 'Accessory'],
    }),


    // GET /api/accessories/slug/:slug/reviews?page=&limit=&sort=&model=&variant=&rating=&keyword=
    getAccessoryReviews: builder.query({
      query: ({
        slug,
        page = 1,
        limit = 10,
        sort = 'newest',
        model = '',
        variant = '',
        rating = '',
        keyword = ''
      }) =>
        `/accessories/slug/${slug}/reviews?page=${page}&limit=${limit}&sort=${sort}&model=${model}&variant=${variant}&rating=${rating}&keyword=${keyword}`, // CHANGED
      providesTags: (result, error, { slug }) => [ // CHANGED
        { type: 'AccessoryReviews', id: slug }
      ],
      keepUnusedDataFor: 60,
    }),


    // DELETE /api/accessories/slug/:slug/reviews/:reviewId
    deleteAccessoryReview: builder.mutation({
      query: ({ slug, reviewId }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}`, // CHANGED
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { slug }) => [ // CHANGED
        { type: 'Accessory', id: slug },
        { type: 'AccessoryReviews', id: slug },
        'Accessories'
      ],
    }),


    // PUT /api/accessories/slug/:slug/reviews/:reviewId/vote
    voteReview: builder.mutation({
      query: ({ slug, reviewId, type }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/vote`, // CHANGED
        method: 'PUT',
        body: { type },
      }),
      invalidatesTags: (result, error, { slug }) => [ // CHANGED
        { type: 'Accessories', id: slug },
        { type: 'AccessoryReviews', id: slug },
      ],
    }),

    // POST /api/upload/accessory-reviews - for review images
    uploadAccessoryReviewImage: builder.mutation({
      query: (formData) => ({
        url: '/upload/accessory-reviews',
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
      transformResponse: (response) => {
        // V33.80 KEY: Always return array no matter what backend sends
        return Array.isArray(response) ? response : response.images || []
      }
    }),

    // POST /api/accessories/slug/:slug/reviews/:reviewId/reply - Add reply
    replyToReview: builder.mutation({
      query: ({ slug, reviewId, comment }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply`, // CHANGED
        method: 'POST',
        body: { comment }
      }),
      invalidatesTags: (result, error, { slug }) => [ // CHANGED
        { type: 'Accessories', id: slug },
        { type: 'AccessoryReviews', id: slug }
      ]
    }),

    // GET /api/accessories/slug/:slug/reviews/:reviewId/replies - Get all replies
    getReplies: builder.query({
      query: ({ slug, reviewId }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/replies`, // CHANGED
        method: 'GET'
      }),
      providesTags: (result, error, { reviewId }) => [
        { type: 'Replies', id: reviewId }
      ]
    }),

    // GET /api/accessories/slug/:slug/reviews/:reviewId/reply/:replyId - Get single reply
    getReply: builder.query({
      query: ({ slug, reviewId, replyId }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply/${replyId}`, // CHANGED
        method: 'GET'
      })
    }),

    // PUT /api/accessories/slug/:slug/reviews/:reviewId/reply/:replyId - Update reply
    updateReply: builder.mutation({
      query: ({ slug, reviewId, replyId, comment }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply/${replyId}`, // CHANGED
        method: 'PUT',
        body: { comment }
      }),
      invalidatesTags: (result, error, { slug, reviewId }) => [ // CHANGED
        { type: 'Accessories', id: slug },
        { type: 'AccessoryReviews', id: slug },
        { type: 'Replies', id: reviewId }
      ]
    }),
    // DELETE /api/accessories/slug/:slug/reviews/:reviewId/reply/:replyId - Delete reply
    deleteReply: builder.mutation({
      query: ({ slug, reviewId, replyId }) => ({ // CHANGED
        url: `/accessories/slug/${slug}/reviews/${reviewId}/reply/${replyId}`, // CHANGED
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { slug, reviewId }) => [ // CHANGED
        { type: 'Accessories', id: slug },
        { type: 'AccessoryReviews', id: slug },
        { type: 'Replies', id: reviewId }
      ]
    }),

  }),
});

// Export hooks
export const {
  useGetAccessoriesQuery,
  useGetAccessoryDetailsQuery,
  useGetAccessoryBySlugQuery,
  useCreateAccessoryMutation,
  useUpdateAccessoryMutation,
  useDeleteAccessoryMutation,
  useUploadAccessoryImageMutation,
  useCreateAccessoryReviewMutation,
  useUpdateAccessoryReviewMutation,
  useGetAccessoryReviewsQuery,
  useDeleteAccessoryReviewMutation,
  useVoteReviewMutation,
  useUploadAccessoryReviewImageMutation,
  useReplyToReviewMutation,
  useGetRepliesQuery,
  useGetReplyQuery,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
} = accessoriesApiSlice;