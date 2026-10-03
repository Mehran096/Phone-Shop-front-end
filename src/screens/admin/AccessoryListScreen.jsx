import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaEye } from 'react-icons/fa';
import { useGetAccessoriesQuery, useDeleteAccessoryMutation } from '../../slices/accessoriesApiSlice';
import { toast } from 'react-toastify';

const ACCESSORY_TYPE_LABELS = {
  case: 'Case', charger: 'Charger', cable: 'Cable',
  glass: 'Glass', audio: 'Audio', holder: 'Holder', other: 'Other'
}

const getTypeColor = (type) => {
  const colors = { Charger: 'bg-blue-100 text-blue-700', Cable: 'bg-green-100 text-green-700', Audio: 'bg-purple-100 text-purple-700', Holder: 'bg-orange-100 text-orange-700', Case: 'bg-pink-100 text-pink-700', Glass: 'bg-gray-100 text-gray-700', Other: 'bg-gray-100 text-gray-700' };
  const label = ACCESSORY_TYPE_LABELS[type] || 'Other';
  return colors[label] || 'bg-gray-100 text-gray-700';
};

const getStockBadge = (stock) => {
  if (stock === 0) return <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Out of Stock</span>;
  if (stock < 50) return <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">{stock} Low</span>;
  return <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">{stock} In Stock</span>;
};

const AccessoryListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const accessoryType = searchParams.get('type') || '';
  const pageNumber = searchParams.get('pageNumber') || 1;

  const { data, isLoading, error, refetch } = useGetAccessoriesQuery({ keyword, type: accessoryType, pageNumber });
  const [deleteAccessory, { isLoading: loadingDelete }] = useDeleteAccessoryMutation();
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try { await deleteAccessory(id).unwrap(); toast.success('Accessory deleted'); refetch(); }
      catch (err) { toast.error(err?.data?.message || err.error); }
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams()
    if (searchKeyword.trim()) newParams.set('keyword', searchKeyword.trim())
    if (accessoryType) newParams.set('type', accessoryType)
    newParams.set('pageNumber', 1)
    setSearchParams(newParams)
  };

  const clearSearch = () => {
    setSearchKeyword('');
    const newParams = new URLSearchParams()
    if (accessoryType) newParams.set('type', accessoryType)
    setSearchParams(newParams)
  };

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams()
    if (keyword) newParams.set('keyword', keyword)
    if (accessoryType) newParams.set('type', accessoryType)
    newParams.set('pageNumber', pageNum)
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getAccessoryStats = (accessory) => {
    let totalStock = 0; let minPrice = Infinity; let maxPrice = 0;
    accessory.models?.forEach(model => {
      model.variants?.forEach(variant => {
        totalStock += Number(variant.countInStock) || 0;
        const price = Number(variant.price) || 0;
        minPrice = Math.min(minPrice, price); maxPrice = Math.max(maxPrice, price);
      })
    })
    return {
      totalStock, minPrice: minPrice === Infinity? 0 : minPrice, maxPrice,
      hasRange: minPrice!== maxPrice, modelCount: accessory.models?.length || 0,
      variantCount: accessory.models?.reduce((acc, m) => acc + (m.variants?.length || 0), 0) || 0,
      thumbnail: accessory.models?.[0]?.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg',
      typeLabel: ACCESSORY_TYPE_LABELS[accessory.accessoryType] || 'Other'
    }
  }

  if (isLoading || loadingDelete) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading accessories...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error?.data?.message || error.error}</div>

  return (
    <div className='space-y-5'>
      {/* HEADER */}
      <div className='bg-white text-gray-900 p-5 rounded-2xl shadow-sm'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
          <h1 className='text-2xl font-bold text-gray-900'>Accessories ({data?.totalAccessories || data?.accessories?.length || 0})</h1>
          <div className='flex flex-col sm:flex-row gap-2 w-full lg:w-auto'>
            <form onSubmit={submitHandler} className='flex flex-1 lg:w-80'>
              <div className='relative flex-1'>
                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs'/>
                <input type='text' placeholder='Search accessories...' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                  className='w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-l-xl text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none'/>
                {searchKeyword && <button type="button" onClick={clearSearch} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'><FaTimes/></button>}
              </div>
              <button type="submit" className='bg-black text-white px-4 rounded-r-xl text-sm hover:bg-gray-800'>Search</button>
            </form>
            <Link to='/admin/accessory/create' className='flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 text-sm font-medium whitespace-nowrap'><FaPlus/> Create</Link>
          </div>
        </div>
        <div className='mt-4'>
          <select value={accessoryType} onChange={(e) => {
              const newParams = new URLSearchParams(searchParams)
              if (e.target.value) newParams.set('type', e.target.value); else newParams.delete('type')
              newParams.set('pageNumber', 1); setSearchParams(newParams)
            }} className='border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white w-full sm:w-56'>
            <option value="">All Types</option>
            {Object.entries(ACCESSORY_TYPE_LABELS).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
          </select>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className='hidden md:block bg-white text-gray-900 rounded-2xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='bg-gray-50'><tr className='text-left text-xs text-gray-500 uppercase'>
              <th className='py-3 px-6'>Name</th><th className='py-3 px-4'>Type</th><th className='py-3 px-4 text-center'>Models</th><th className='py-3 px-4 text-center'>Variants</th><th className='py-3 px-4'>From Price</th><th className='py-3 px-4'>Stock</th><th className='py-3 px-6 text-right'>Actions</th>
            </tr></thead>
            <tbody className='divide-y'>
              {data?.accessories?.map((accessory) => {
                const stats = getAccessoryStats(accessory);
                return (
                  <tr key={accessory._id} className='hover:bg-gray-50 text-sm text-gray-900'>
                    <td className="p-4"><div className="flex items-center gap-3"><img src={stats.thumbnail} alt={accessory.name} className="w-11 h-11 rounded-xl object-cover border"/><div><p className="font-semibold text-gray-900 line-clamp-1">{accessory.name}</p><p className="text-xs text-gray-500">{accessory.brand}</p></div></div></td>
                    <td className="p-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(accessory.accessoryType)}`}>{stats.typeLabel}</span></td>
                    <td className="p-4 text-center">{stats.modelCount}</td>
                    <td className="p-4 text-center">{stats.variantCount}</td>
                    <td className="p-4 font-bold">${stats.hasRange? `${stats.minPrice.toFixed(0)}-${stats.maxPrice.toFixed(0)}` : stats.minPrice.toFixed(0)}</td>
                    <td className="p-4">{getStockBadge(stats.totalStock)}</td>
                    <td className="p-4 text-right space-x-2">
                      <Link to={`/admin/accessory/${accessory._id}`} className="inline-flex bg-gray-100 hover:bg-black hover:text-white p-2 rounded-lg transition"><FaEye/></Link>
                      <Link to={`/admin/accessory/${accessory._id}/edit`} className="inline-flex bg-gray-100 hover:bg-black hover:text-white p-2 rounded-lg transition"><FaEdit/></Link>
                      <button onClick={() => deleteHandler(accessory._id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white p-2 rounded-lg transition"><FaTrash/></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className='md:hidden grid gap-3'>
        {data?.accessories?.map((accessory) => {
          const stats = getAccessoryStats(accessory);
          return (
            <div key={accessory._id} className='bg-white text-gray-900 rounded-2xl shadow-sm p-4 border'>
              <div className='flex gap-3 mb-3'>
                <img src={stats.thumbnail} alt={accessory.name} className="w-14 h-14 rounded-xl object-cover border"/>
                <div className='flex-1'><h3 className='font-bold text-sm text-gray-900 line-clamp-2'>{accessory.name}</h3><p className='text-xs text-gray-500'>{accessory.brand}</p><span className={`inline-block mt-1.5 px-2.5 py-1 text-[10px] font-medium rounded-full ${getTypeColor(accessory.accessoryType)}`}>{stats.typeLabel}</span></div>
              </div>
              <div className='grid grid-cols-3 gap-2 text-xs mb-3'>
                <div className="bg-gray-50 p-2 rounded-xl"><p className='text-gray-500'>Models</p><p className='font-bold text-gray-900'>{stats.modelCount}</p></div>
                <div className="bg-gray-50 p-2 rounded-xl"><p className='text-gray-500'>Variants</p><p className='font-bold text-gray-900'>{stats.variantCount}</p></div>
                <div className="bg-gray-50 p-2 rounded-xl"><p className='text-gray-500'>From</p><p className='font-bold text-gray-900'>${stats.minPrice.toFixed(0)}</p></div>
              </div>
              <div className="mb-3">{getStockBadge(stats.totalStock)}</div>
              <div className='flex gap-2'><Link to={`/admin/accessory/${accessory._id}/edit`} className='flex-1 bg-black text-white text-center py-2.5 rounded-xl text-sm'>Edit</Link><button onClick={() => deleteHandler(accessory._id)} className='flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm'>Delete</button></div>
            </div>
          )
        })}
      </div>

      {data?.pages > 1 && (
        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-sm flex flex-wrap justify-center gap-2">
          {[...Array(data.pages).keys()].map(x=> (
            <button key={x+1} onClick={()=>handlePageChange(x+1)} className={`px-3 py-1.5 rounded-xl text-sm ${x+1===data.page? 'bg-black text-white' : 'bg-white border text-gray-700'}`}>{x+1}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessoryListScreen;