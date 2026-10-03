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

  const [createBlog, { isLoading }] = useCreateBlogMutation();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await createBlog({ title, excerpt, content, coverImage, category, tags: tagArray }).unwrap();
      toast.success('Blog created');
      navigate('/admin/bloglist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Link to="/admin/bloglist" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">← Go Back</Link>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Create Blog</h1>
        <form onSubmit={submitHandler} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. iPhone 16 vs Samsung S25" /></div>
          <div><label className="block text-sm font-medium mb-1">Excerpt</label><textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} required className="w-full border rounded-lg p-2.5 text-sm" placeholder="Short summary for listing" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm"><option>Mobile Guide</option><option>Phone Review</option><option>Accessories</option><option>Buying Tips</option><option>Comparison</option><option>News</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Tags (comma separated)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" placeholder="iPhone, Samsung, Tips" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Cover Image URL</label><input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" placeholder="https://..." /></div>
          <div><label className="block text-sm font-medium mb-1">Content (HTML allowed)</label><textarea rows={12} value={content} onChange={e => setContent(e.target.value)} required className="w-full border rounded-lg p-2.5 text-sm font-mono" placeholder="<h2>...</h2><p>..." /></div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium">{isLoading? 'Creating...' : 'Create Blog'}</button>
        </form>
      </div>
    </div>
  );
};

export default BlogCreateScreen;