import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetAllBlogsAdminQuery, useDeleteBlogMutation } from '../../slices/blogsApiSlice';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

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

  if (isLoading) return <div className="p-6 text-center text-gray-300">Loading blogs...</div>;
  if (error) return <div className="p-6 text-red-500">{error?.data?.message || error.error}</div>;

  return (
    <div className="bg-white text-gray-900 p-4 md:p-6 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blogs ({blogs?.length || 0})</h1>
        <Link to="/admin/blog/create" className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium text-center">
          + Create Blog
        </Link>
      </div>

      {loadingDelete && <p className="text-sm text-gray-500 mb-3">Deleting...</p>}

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Views</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {blogs?.map((blog) => (
              <tr key={blog._id} className="hover:bg-gray-50 text-sm">
                <td className="p-4 font-semibold text-gray-900 max-w-[350px]">
                  <div className="truncate" title={blog.title}>{blog.title}</div>
                </td>
                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">{blog.category}</span></td>
                <td className="p-4"><span className="flex items-center gap-1 text-gray-700"><FaEye className="text-gray-400"/> {blog.views || 0}</span></td>
                <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${blog.status === 'published'? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{blog.status}</span></td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/blog/${blog._id}/edit`} className="bg-gray-100 hover:bg-black hover:text-white p-2 rounded-lg transition"><FaEdit/></Link>
                    <button onClick={() => deleteHandler(blog._id, blog.title)} className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 p-2 rounded-lg transition"><FaTrash/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden grid gap-3">
        {blogs?.map((blog) => (
          <div key={blog._id} className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-3">{blog.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs">{blog.category}</span>
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs flex items-center gap-1"><FaEye/> {blog.views || 0}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs ${blog.status === 'published'? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{blog.status}</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/blog/${blog._id}/edit`} className="flex-1 bg-black text-white text-center py-2.5 rounded-lg text-sm font-medium">Edit</Link>
              <button onClick={() => deleteHandler(blog._id, blog.title)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {blogs?.length === 0 && <p className="text-center py-10 text-gray-400">No blogs found. Create first blog.</p>}
    </div>
  );
};

export default BlogListScreen;