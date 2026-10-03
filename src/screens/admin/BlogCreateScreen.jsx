import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateBlogMutation } from '../../slices/blogsApiSlice';

const BlogCreateScreen = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('Mobile Guide');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');

  const [createBlog, { isLoading }] = useCreateBlogMutation();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await createBlog({ title, excerpt, content, coverImage, category, tags: tagArray, status }).unwrap();
      toast.success('Blog created');
      navigate('/admin/bloglist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/admin/bloglist" className="text-sm text-gray-400 hover:text-white mb-4 inline-flex items-center gap-1">← Back to Blogs</Link>

      <div className="bg-white text-gray-900 p-5 md:p-8 rounded-2xl shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Create New Blog</h1>
        <p className="text-sm text-gray-500 mb-6">Write and publish blog for your store</p>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none"
              placeholder="e.g. iPhone 16 vs Samsung S25 - Full Comparison" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt *</label>
            <textarea rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none"
              placeholder="Short summary that shows on blog list page..." />
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none"
                placeholder="iPhone, Samsung, Tips" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
            <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none"
              placeholder="https://example.com/image.jpg" />
            {coverImage && (
              <img src={coverImage} alt="preview" className="mt-3 h-40 w-full object-cover rounded-xl border" />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content (HTML allowed) *</label>
            <textarea rows={16} value={content} onChange={e => setContent(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 font-mono leading-relaxed focus:ring-2 focus:ring-black outline-none"
              placeholder="<h2>Introduction</h2><p>Your content here...</p>" />
            <p className="text-xs text-gray-400 mt-1">You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={()=>navigate('/admin/bloglist')} className="sm:w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-60">
              {isLoading? 'Creating...' : 'Create Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogCreateScreen;