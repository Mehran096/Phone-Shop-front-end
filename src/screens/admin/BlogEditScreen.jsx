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
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  const [updateBlog, { isLoading }] = useUpdateBlogMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (blog) {
      setTitle(blog.title); setExcerpt(blog.excerpt); setContent(blog.content);
      setCoverImage(blog.coverImage || ''); setCategory(blog.category);
      setTags(blog.tags?.join(', ') || '');
    }
  }, [blog]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      await updateBlog({ id, title, excerpt, content, coverImage, category, tags: tagArray }).unwrap();
      toast.success('Blog updated');
      navigate('/admin/bloglist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (!blog) return <div className="p-6 text-center">Loading blog...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Link to="/admin/bloglist" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">← Go Back</Link>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Edit Blog</h1>
        <form onSubmit={submitHandler} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Excerpt</label><textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm"><option>Mobile Guide</option><option>Phone Review</option><option>Accessories</option><option>Buying Tips</option><option>Comparison</option><option>News</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Tags</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Cover Image URL</label><input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Content</label><textarea rows={14} value={content} onChange={e => setContent(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm font-mono" /></div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium">{isLoading? 'Updating...' : 'Update Blog'}</button>
        </form>
      </div>
    </div>
  );
};

export default BlogEditScreen;