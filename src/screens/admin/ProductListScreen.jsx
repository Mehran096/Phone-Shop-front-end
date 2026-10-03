import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { useGetProductsQuery, useDeleteProductMutation, useCreateProductMutation } from '../../slices/productsApiSlice';
import { toast } from 'react-toastify';

const ProductListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const pageNumber = searchParams.get('pageNumber') || 1;

  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber });

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();

  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) setSearchParams({ keyword: searchKeyword, pageNumber: 1 });
    else setSearchParams({});
  };

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams()
    if (keyword) newParams.set('keyword', keyword)
    newParams.set('pageNumber', pageNum)
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearSearch = () => {
    setSearchKeyword('');
    setSearchParams({});
  };

  if (isLoading) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading products...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error?.data?.message || error.error}</div>

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-white text-gray-900 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Products ({data?.totalProducts || data?.products?.length || 0})</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <form onSubmit={submitHandler} className="flex flex-1 lg:w-80">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="text" placeholder="Search products..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-l-xl text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none" />
                {searchKeyword && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FaTimes /></button>
                )}
              </div>
              <button type="submit" className="bg-black text-white px-4 rounded-r-xl text-sm hover:bg-gray-800">Search</button>
            </form>
            <button onClick={()=>navigate('/admin/product/create')} disabled={loadingCreate}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 text-sm font-medium whitespace-nowrap">
              <FaPlus /> Create
            </button>
          </div>
        </div>
        {(loadingCreate || loadingDelete) && <p className="text-xs text-gray-500 mt-3">Processing...</p>}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white text-gray-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr className="text-left text-xs text-gray-500 uppercase">
              <th className="px-6 py-3">ID</th><th className="px-6 py-3">Name</th><th className="px-6 py-3">Price</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Brand</th><th className="px-6 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 text-sm text-gray-900">
                  <td className="px-6 py-4 font-mono text-xs">{product._id.substring(18,24)}...</td>
                  <td className="px-6 py-4 font-semibold max-w-[250px] truncate" title={product.name}>{product.name}</td>
                  <td className="px-6 py-4 font-bold">${product.variants?.[0]?.colors?.[0]?.price?.toLocaleString()?? 'N/A'}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs">{product.category}</span></td>
                  <td className="px-6 py-4">{product.brand}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/admin/product/${product._id}/edit`} className="inline-flex bg-gray-100 hover:bg-black hover:text-white p-2 rounded-lg transition"><FaEdit/></Link>
                    <button onClick={()=>deleteHandler(product._id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-lg transition"><FaTrash/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden grid gap-3">
        {data.products.map((product) => (
          <div key={product._id} className="bg-white text-gray-900 p-4 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-start gap-3 mb-2">
              <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{product.name}</h3>
              <span className="font-bold text-black shrink-0">${product.variants?.[0]?.colors?.[0]?.price?.toLocaleString()?? 'N/A'}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">{product.brand}</span>
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">{product.category}</span>
              <span className="font-mono text-[10px] text-gray-400">#{product._id.substring(18,24)}</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/product/${product._id}/edit`} className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm text-center">Edit</Link>
              <button onClick={()=>deleteHandler(product._id)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {data.pages > 1 && (
        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-sm flex flex-wrap justify-center gap-2">
          {[...Array(data.pages).keys()].map(x=> (
            <button key={x+1} onClick={()=>handlePageChange(x+1)} className={`px-3 py-1.5 rounded-xl text-sm ${x+1===data.page? 'bg-black text-white' : 'bg-white border text-gray-700'}`}>{x+1}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListScreen;