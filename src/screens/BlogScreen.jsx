import { Link, useSearchParams } from 'react-router-dom';
import { useGetBlogsQuery } from '../slices/blogsApiSlice';
import { useState, useEffect } from 'react';

const BlogScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "All";

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState([]);
  const limit = 9;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed!== search) {
        setSearch(trimmed);
        setPage(1);
        setAllBlogs([]);
        const params = new URLSearchParams(searchParams);
        if (trimmed) {
          params.set("search", trimmed);
          params.delete("category");
        } else {
          params.delete("search");
        }
        setSearchParams(params, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset on category change
  useEffect(() => {
    setPage(1);
    setAllBlogs([]);
  }, [category, search]);

  const { data, isLoading, isFetching, error } = useGetBlogsQuery({ category, search, page, limit });

  // Accumulate for Load More
  useEffect(() => {
    if (data?.blogs) {
      if (page === 1) setAllBlogs(data.blogs);
      else setAllBlogs(prev => [...prev,...data.blogs]);
    }
  }, [data]);

  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;
  const categories = ['All','Mobile Guide','Phone Review','Comparison','Buying Tips','News','Accessories'];

  const handleCategoryClick = (cat) => {
    setSearchInput("");
    setSearch("");
    setAllBlogs([]);
    setPage(1);
    setSearchParams(cat === "All"? {} : { category: cat });
  };

  const showSkeleton = (isLoading || isFetching) && page === 1;

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="mb-4 md:mb-8 text-center">
        <h1 className="text-xl md:text-4xl font-bold text-gray-900">PhoneStore Blog</h1>
        <p className="text-[12px] md:text-base text-gray-500 mt-1">Guides, Reviews, Comparisons & Buying Tips</p>
      </div>

      <div className="max-w-md mx-auto mb-4 md:mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search blogs... e.g. Infinix, PTA, battery"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border text-[12px] md:text-sm focus:outline-none focus:border-black"
          />
          <span className="absolute left-3 top-2 text-gray-400 text-xs">🔍</span>
          {searchInput && (
            <button onClick={() => setSearchInput("")} className="absolute right-3 top-2 text-gray-400 text-[11px]">✕</button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 md:gap-2 justify-start md:justify-center mb-4 flex-nowrap overflow-x-auto pb-2 px-1">
        {categories.map(cat => {
          const isActive = category === cat &&!search;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] md:text-sm border transition ${isActive? 'bg-black text-white border-black' : 'bg-white text-gray-600'}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="text-[11px] md:text-sm text-gray-400 mb-3">
        {search? `Found ${total} for "${search}"` : category!== 'All'? `${total} in ${category}` : `${total} blogs`}
      </div>

      {showSkeleton? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-gray-100 h-[90px] sm:h-[240px] rounded-lg animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {allBlogs.map(blog => (
            <Link key={blog._id} to={`/blogs/${blog.slug}`} className="bg-white rounded-lg shadow-sm border flex flex-row sm:flex-col overflow-hidden">
              <img
                src={blog.coverImage || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80'}
                alt={blog.title}
                loading="lazy"
                className="h-[90px] w-[110px] sm:h-48 sm:w-full object-cover flex-shrink-0 bg-gray-100"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80&${blog._id}`;
                }}
              />
              <div className="p-2.5 md:p-4 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{blog.category}</span>
                  <h3 className="font-bold text-[13px] md:text-lg mt-1 line-clamp-2">{blog.title}</h3>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 hidden sm:block">{blog.excerpt}</p>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span>{blog.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!showSkeleton && allBlogs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-xs">No blogs found</p>
          <button onClick={() => { setSearchParams({}); setSearchInput(""); setSearch(""); }} className="text-blue-600 text-xs mt-2">Clear filters</button>
        </div>
      )}

      {hasMore &&!showSkeleton && (
        <div className="text-center mt-6">
          <button onClick={() => setPage(p => p+1)} disabled={isFetching} className="px-6 py-2 rounded-full bg-black text-white text-[11px] disabled:bg-gray-400">
            {isFetching? "Loading..." : `Load More (${total - allBlogs.length} left)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogScreen;