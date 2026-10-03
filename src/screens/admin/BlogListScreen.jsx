import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetAllBlogsAdminQuery, useDeleteBlogMutation } from '../../slices/blogsApiSlice';

const BlogListScreen = () => {
  const { data: blogs, isLoading, error, refetch } = useGetAllBlogsAdminQuery();
  const [deleteBlog, { isLoading: loadingDelete }] = useDeleteBlogMutation();

  const deleteHandler = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('Blog deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error?.data?.message || error.error}</div>;

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        <Link to="/admin/blog/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Create Blog
        </Link>
      </div>

      {loadingDelete && <p className="text-sm text-gray-500 mb-2">Deleting...</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Views</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs?.map((blog) => (
              <tr key={blog._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="p-3 font-medium max-w-[250px] truncate">{blog.title}</td>
                <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{blog.category}</span></td>
                <td className="p-3">{blog.views}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${blog.status === 'published'? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{blog.status}</span></td>
                <td className="p-3 flex gap-2">
                  <Link to={`/admin/blog/${blog._id}/edit`} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs">Edit</Link>
                  <button onClick={() => deleteHandler(blog._id, blog.title)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blogs?.length === 0 && <p className="text-center py-6 text-gray-400">No blogs found</p>}
      </div>
    </div>
  );
};

export default BlogListScreen;