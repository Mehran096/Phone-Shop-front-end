import { useParams, Link } from 'react-router-dom';
import { useGetBlogBySlugQuery } from '../slices/blogsApiSlice';

// Helper: auto-link phone-store.asia in content
const linkifyContent = (html) => {
  if (!html) return "";
  // Avoid double-linking if already inside <a> tag
  return html.replace(
    /phone-store\.asia/gi,
    (match) => {
      // If previous 6 chars contain href, skip (already linked)
      return `<a href="https://phone-store.asia" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold hover:underline">${match}</a>`;
    }
  ).replace(
    // Fix double link: <a...><a href...>phone-store.asia</a></a> -> single
    /<a[^>]*><a[^>]*>(phone-store\.asia)<\/a><\/a>/gi,
    '<a href="https://phone-store.asia" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold hover:underline">$1</a>'
  );
};

const BlogDetailScreen = () => {
  const { slug } = useParams();
  const { data: blog, isLoading, error } = useGetBlogBySlugQuery(slug);

  if (isLoading) return <div className="p-6 md:p-10 text-center text-sm md:text-base">Loading...</div>;
  if (error) return <div className="p-6 md:p-10 text-center text-sm">Blog not found - <Link to="/blogs" className="text-blue-600 underline">Go Back</Link></div>;

  const processedContent = linkifyContent(blog?.content);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 md:px-4 py-4 md:py-8 max-w-3xl">
        <Link to="/blogs" className="text-xs md:text-sm text-gray-600 hover:text-black mb-4 md:mb-6 inline-block">← All Blogs</Link>

        <div className="mt-1 md:mt-2">
          <span className="bg-blue-100 text-blue-700 px-2.5 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium">{blog.category}</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mt-2 md:mt-3 leading-snug md:leading-tight">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-3 md:mt-4 text-[11px] md:text-sm text-gray-500">
          <span>By {blog.author?.name || 'PhoneStore'}</span>
          <span className="hidden md:inline">•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          <span className="hidden md:inline">•</span>
          <span>{blog.views} views</span>
        </div>

        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt={blog.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80&sig=${blog._id}`;
            }}
            className="w-full h-[200px] sm:h-[280px] md:h-[380px] object-cover rounded-lg md:rounded-xl mt-4 md:mt-6 bg-gray-100"
          />
        )}

        <div className="mt-5 md:mt-8">
          <p className="text-sm md:text-lg text-gray-700 font-medium italic border-l-4 border-blue-600 pl-3 md:pl-4 mb-4 md:mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          <div
            className="prose prose-sm md:prose-lg max-w-none prose-blue
                       prose-p:text-[13px] md:prose-p:text-base prose-p:leading-6 md:prose-p:leading-7
                       prose-h2:text-base md:prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-5 md:prose-h2:mt-8
                       prose-h3:text-[15px] md:prose-h3:text-xl
                       prose-li:text-[13px] md:prose-li:text-base
                       prose-img:rounded-lg prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>

        <div className="mt-6 md:mt-8 flex gap-1.5 md:gap-2 flex-wrap">
          {blog.tags?.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 px-2.5 md:px-3 py-1 rounded-full text-[10px] md:text-xs">#{tag}</span>
          ))}
        </div>

        <div className="mt-8 md:mt-12 border-t pt-6 md:pt-8">
          <Link to="/blogs" className="w-full md:w-auto inline-flex justify-center bg-black text-white px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailScreen;