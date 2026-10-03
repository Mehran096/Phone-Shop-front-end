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
        params.append('page', page);
        params.append('limit', limit);
        return { url: `/blogs?${params.toString()}` };
      },
      providesTags: (result) =>
        result?.blogs
          ? [...result.blogs.map(({ _id }) => ({ type: 'Blog', id: _id })), { type: 'Blog', id: 'LIST' }]
          : [{ type: 'Blog', id: 'LIST' }],
      keepUnusedDataFor: 5,
    }),

    getBlogBySlug: builder.query({
      query: (slug) => ({ url: `/blogs/${slug}` }),
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
      keepUnusedDataFor: 5,
    }),

    getAllBlogsAdmin: builder.query({
      query: () => ({ url: '/blogs/admin/all' }),
      providesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    createBlog: builder.mutation({
      query: (data) => ({ url: '/blogs', method: 'POST', body: data }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    updateBlog: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/blogs/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, { type: 'Blog', id: 'LIST' }],
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