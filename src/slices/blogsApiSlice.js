import { apiSlice } from './apiSlice';

export const blogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: ({ category, search, page = 1, limit = 9 } = {}) => {
        const params = new URLSearchParams();
        if (category && category !== "All" && category.toLowerCase() !== "all") {
          params.append('category', category.trim());
        }
        if (search && search.trim() !== "") {
          params.append('search', search.trim());
        }
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return { url: `/blogs?${params.toString()}` };
      },
      providesTags: (result) =>
        result?.blogs
          ? [
              ...result.blogs.map(({ _id }) => ({ type: 'Blog', id: _id })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
      keepUnusedDataFor: 300, // FIXED: was 5 sec, now 5 min - prevents flicker but you can still refetch
    }),

    getBlogBySlug: builder.query({
      query: (slug) => ({ url: `/blogs/${slug}` }),
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),

    getAllBlogsAdmin: builder.query({
      query: () => ({ url: '/blogs/admin/all' }),
      providesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    createBlog: builder.mutation({
      query: (data) => {
        // FIX: ensure coverImage is always object {url, publicId}
        const payload = { ...data };
        if (typeof payload.coverImage === 'string') {
          payload.coverImage = { url: payload.coverImage, publicId: "" };
        }
        return { url: '/blogs', method: 'POST', body: payload };
      },
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    updateBlog: builder.mutation({
      query: ({ id, ...data }) => {
        const payload = { ...data };
        if (typeof payload.coverImage === 'string') {
          payload.coverImage = { url: payload.coverImage, publicId: "" };
        }
        return { url: `/blogs/${id}`, method: 'PUT', body: payload };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' },
      ],
    }),

    deleteBlog: builder.mutation({
      query: (id) => ({ url: `/blogs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
  useGetAllBlogsAdminQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogsApiSlice;