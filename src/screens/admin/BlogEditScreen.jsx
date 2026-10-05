import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetAllBlogsAdminQuery, useUpdateBlogMutation } from '../../slices/blogsApiSlice';

const BlogEditScreen = () => {
  const { id } = useParams();
  const { data: allBlogs } = useGetAllBlogsAdminQuery();
  const blog = allBlogs?.find(b => b._id === id);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Mobile Guide');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');

  const [updateBlog, { isLoading }] = useUpdateBlogMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setExcerpt(blog.excerpt || '');
      setContent(blog.content);
      // FIXED: extract URL from object
      const imgUrl = typeof blog.coverImage === 'string'? blog.coverImage : blog.coverImage?.url || '';
      setCoverImage(imgUrl);
      setCategory(blog.category || 'Mobile Guide');
      setTags(blog.tags?.join(', ') || '');
      setStatus(blog.status || 'published');
    }
  }, [blog]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      // FIXED: always send as object
      const coverImageObj = coverImage? { url: coverImage, publicId: blog?.coverImage?.publicId || "" } : { url: "", publicId: "" };

      await updateBlog({
        id,
        title,
        excerpt,
        content,
        coverImage: coverImageObj,
        category,
        tags: tagArray,
        status
      }).unwrap();
      toast.success('Blog updated');
      navigate('/admin/bloglist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (!blog) return <div className="p-6 text-center text-gray-900">Loading blog...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/admin/bloglist" className="text-sm text-gray-400 hover:text-white mb-4 inline-flex items-center gap-1">← Back to Blogs</Link>

      <div className="bg-white text-gray-900 p-5 md:p-8 rounded-2xl shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Edit Blog</h1>
        <p className="text-sm text-gray-500 mb-6">Update blog content, image and SEO</p>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black focus:border-black outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt</label>
            <textarea rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary for listing..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white">
                <option>Mobile Guide</option><option>Phone Review</option><option>Accessories</option>
                <option>Buying Tips</option><option>Comparison</option><option>News</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="iPhone, Samsung, Tips"
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
            <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none" />
            {coverImage && (
              <img
                src={coverImage}
                alt="preview"
                className="mt-3 h-40 w-full object-cover rounded-xl border bg-gray-100"
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/seed/edit-${id}/800/400`;
                }}
              />
            )}
            <p className="text-[10px] text-gray-400 mt-1">Tip: Use unique URL like https://picsum.photos/seed/YOUR-TITLE/800/600 for unique image</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content *</label>
            <textarea rows={16} value={content} onChange={e => setContent(e.target.value)} required
              placeholder="Write full blog content here (supports HTML/Markdown)..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-mono leading-relaxed focus:ring-2 focus:ring-black outline-none" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={()=>navigate('/admin/bloglist')} className="sm:w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-60">
              {isLoading? 'Updating...' : 'Update Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditScreen;