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
} = accessoriesApiSlice;