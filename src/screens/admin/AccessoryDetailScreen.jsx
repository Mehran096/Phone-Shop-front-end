import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { useGetAccessoryDetailsQuery, useDeleteAccessoryMutation } from '../../slices/accessoriesApiSlice';
import { toast } from 'react-toastify';

const ACCESSORY_TYPE_LABELS = {
  case: 'Case', charger: 'Charger', cable: 'Cable', glass: 'Glass', audio: 'Audio', holder: 'Holder', other: 'Other'
}
const getTypeColor = (type) => {
  const colors = { Charger: 'bg-blue-100 text-blue-700', Cable: 'bg-green-100 text-green-700', Audio: 'bg-purple-100 text-purple-700', Holder: 'bg-orange-100 text-orange-700', Case: 'bg-pink-100 text-pink-700', Glass: 'bg-gray-100 text-gray-700' };
  return colors[ACCESSORY_TYPE_LABELS[type]] || 'bg-gray-100 text-gray-700';
};

const AccessoryDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(id);
  const [deleteAccessory, { isLoading: loadingDelete }] = useDeleteAccessoryMutation();

  const deleteHandler = async () => {
    if (window.confirm('Delete this accessory?')) {
      try { await deleteAccessory(id).unwrap(); toast.success('Accessory deleted'); navigate('/admin/accessorylist'); }
      catch (err) { toast.error(err?.data?.message || err.error); }
    }
  };

  if (isLoading || loadingDelete) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center mx-3 mt-3">Loading accessory...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl mx-3 mt-3">{error?.data?.message || error.error}</div>

  const allImages = accessory.models?.flatMap(m => m.variants?.flatMap(v => v.images?.map(img => img.url) || [])).filter(Boolean) || ['/placeholder.jpg'];
  const totalStock = accessory.models?.reduce((acc, m) => acc + m.variants?.reduce((sum, v) => sum + Number(v.countInStock || 0), 0), 0) || 0;
  const allPrices = accessory.models?.flatMap(m => m.variants?.map(v => Number(v.price) || 0)) || [0];
  const minPrice = Math.min(...allPrices); const maxPrice = Math.max(...allPrices); const hasRange = minPrice!== maxPrice;

  const TabBtn = ({ tab, label }) => (
    <button onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${activeTab === tab? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>{label}</button>
  );

  return (
    <div className='space-y-4 max-w-5xl mx-auto pb-6'>
      <Link to='/admin/accessorylist' className='text-gray-400 hover:text-white text-sm inline-flex items-center gap-2 px-1'> <FaArrowLeft size={12}/> Back to Accessories </Link>

      {/* TOP CARD - MOBILE STACK */}
      <div className='bg-white text-gray-900 rounded-2xl shadow-sm overflow-hidden'>
        <div className='flex flex-col lg:flex-row'>
          {/* IMAGE - FULL WIDTH ON MOBILE */}
          <div className='w-full lg:w-[380px] p-3 lg:p-5 bg-gray-50 lg:bg-white border-b lg:border-b-0 lg:border-r'>
            <div className='bg-white rounded-2xl border p-2'><img src={allImages[selectedImage]} alt={accessory.name} className='w-full h-[260px] sm:h-[340px] object-contain rounded-xl'/></div>
            {allImages.length > 1 && (
              <div className='flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1'>
                {allImages.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className="flex-shrink-0">
                    <img src={img} className={`w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl border-2 bg-white p-1 ${selectedImage === idx? 'border-black' : 'border-gray-200'}`}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className='flex-1 p-4 sm:p-6'>
            <div className='flex justify-between items-start gap-3'>
              <div className='flex-1 min-w-0'>
                <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getTypeColor(accessory.accessoryType)}`}>{ACCESSORY_TYPE_LABELS[accessory.accessoryType]}</span>
                <h1 className='text-lg sm:text-2xl font-bold text-gray-900 mt-2 leading-tight line-clamp-2'>{accessory.name}</h1>
                <p className='text-gray-500 text-xs sm:text-sm mt-1'>Brand: <span className="text-gray-900 font-medium">{accessory.brand}</span></p>
              </div>
              <div className='flex gap-2 shrink-0'>
                <Link to={`/admin/accessory/${id}/edit`} className='w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800'><FaEdit size={14}/></Link>
                <button onClick={deleteHandler} className='w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white'><FaTrash size={14}/></button>
              </div>
            </div>

            {/* STATS - 3 COL DESKTOP, 1 ROW SCROLL ON MOBILE */}
            <div className='grid grid-cols-3 gap-2 sm:gap-3 mt-5'>
              <div className="bg-gray-50 p-3 rounded-2xl"><p className='text-[10px] sm:text-xs text-gray-500 uppercase font-semibold'>Price</p><p className='font-bold text-gray-900 text-sm sm:text-base mt-1'>${hasRange? `${minPrice.toFixed(0)}-${maxPrice.toFixed(0)}` : minPrice.toFixed(0)}</p></div>
              <div className="bg-gray-50 p-3 rounded-2xl"><p className='text-[10px] sm:text-xs text-gray-500 uppercase font-semibold'>Stock</p><p className='font-bold text-gray-900 text-sm sm:text-base mt-1'>{totalStock}</p></div>
              <div className="bg-gray-50 p-3 rounded-2xl"><p className='text-[10px] sm:text-xs text-gray-500 uppercase font-semibold'>Variants</p><p className='font-bold text-gray-900 text-sm sm:text-base mt-1'>{accessory.models?.reduce((acc, m) => acc + (m.variants?.length || 0), 0)}</p></div>
            </div>

            <div className="mt-5">
              <p className='text-xs font-bold text-gray-500 uppercase mb-2'>Description</p>
              <p className='text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl'>{accessory.description || 'No description'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS CARD */}
      <div className='bg-white text-gray-900 rounded-2xl shadow-sm overflow-hidden'>
        <div className='border-b flex overflow-x-auto scrollbar-hide sticky top-0 bg-white z-10 px-2'>
          <TabBtn tab='overview' label='Overview' /><TabBtn tab='variants' label={`Variants (${accessory.models?.reduce((acc, m) => acc + (m.variants?.length || 0), 0) || 0})`} /><TabBtn tab='seo' label='SEO' />
        </div>

        <div className='p-4 sm:p-6'>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {accessory.models?.map((model, i) => (
                <div key={i} className='border border-gray-200 rounded-2xl bg-gray-50 p-4'>
                  <h4 className='font-bold text-gray-900 text-sm sm:text-base'>{model.name}</h4>
                  <p className='text-gray-600 text-xs sm:text-sm mt-1 mb-3'>{model.description}</p>
                  <div className='grid grid-cols-1 gap-2'>
                    {model.specs?.map((spec, idx) => (
                      <div key={idx} className='flex justify-between items-center bg-white px-3 py-2.5 rounded-xl border text-xs sm:text-sm'><span className='text-gray-500'>{spec.key}</span><span className='font-semibold text-gray-900 text-right ml-3'>{spec.value}</span></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'variants' && (
            <>
              {/* DESKTOP TABLE */}
              <div className='hidden sm:block overflow-x-auto rounded-xl border'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-gray-50'><tr className="text-left text-xs text-gray-500 uppercase"><th className='p-3'>Model</th><th className='p-3'>Variant</th><th className='p-3'>SKU</th><th className='p-3'>Price</th><th className='p-3'>Stock</th></tr></thead>
                  <tbody className="divide-y">{accessory.models?.map(model => model.variants?.map((v, idx) => (
                    <tr key={idx} className='text-gray-900'><td className='p-3 font-medium'>{model.name}</td><td className='p-3'>{v.name}</td><td className='p-3 font-mono text-xs'>{v.sku}</td><td className='p-3 font-bold'>${v.price}</td><td className='p-3'><span className={`px-2 py-1 rounded-full text-xs ${v.countInStock>0?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{v.countInStock}</span></td></tr>
                  )))}</tbody>
                </table>
              </div>
              {/* MOBILE CARDS */}
              <div className="sm:hidden grid gap-3">
                {accessory.models?.flatMap(model => model.variants?.map((v, idx) => (
                  <div key={idx} className="border rounded-2xl p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2"><p className="font-bold text-gray-900 text-sm">{model.name} - {v.name}</p><span className="font-bold text-sm">${v.price}</span></div>
                    <p className="font-mono text-[11px] text-gray-500">SKU: {v.sku}</p>
                    <div className="flex justify-between items-center mt-3"><span className="text-xs text-gray-500">Stock</span><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${v.countInStock>0?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{v.countInStock} pcs</span></div>
                  </div>
                )))}
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <div className='space-y-3'>
              <div><label className='text-[11px] font-bold text-gray-500 uppercase'>Meta Title</label><p className='p-3 bg-gray-50 rounded-xl border text-sm text-gray-900 mt-1 break-words'>{accessory.metaTitle || 'Not set'}</p></div>
              <div><label className='text-[11px] font-bold text-gray-500 uppercase'>Meta Description</label><p className='p-3 bg-gray-50 rounded-xl border text-sm text-gray-900 mt-1 break-words'>{accessory.metaDescription || 'Not set'}</p></div>
              <div><label className='text-[11px] font-bold text-gray-500 uppercase'>Keywords</label><p className='p-3 bg-gray-50 rounded-xl border text-sm text-gray-900 mt-1 break-words'>{accessory.keywords || 'Not set'}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessoryDetailScreen;