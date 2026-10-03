import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaPlus, FaTimes, FaGripVertical, FaInfoCircle } from 'react-icons/fa';
import { useGetAccessoryDetailsQuery, useUpdateAccessoryMutation, useUploadAccessoryImageMutation } from '../../slices/accessoriesApiSlice';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ACCESSORY_TYPES = [
  { value: "case", label: "Case" }, { value: "charger", label: "Charger" },
  { value: "cable", label: "Cable" }, { value: "glass", label: "Screen Protector" },
  { value: "audio", label: "Audio" }, { value: "holder", label: "Holder / Stand" },
];
const ACCESSORY_CATEGORIES = [
  { value: "iPhone Cases", label: "iPhone Cases" }, { value: "Samsung Cases", label: "Samsung Cases" },
  { value: "Google Pixel Cases", label: "Google Pixel Cases" }, { value: "Realme Cases", label: "Realme Cases" },
  { value: "Chargers", label: "Chargers" }, { value: "Fast Chargers", label: "Fast Chargers 20W+" },
  { value: "Cables", label: "Cables" }, { value: "USB-C Cables", label: "USB-C Cables" },
  { value: "Lightning Cables", label: "Lightning Cables" }, { value: "Screen Protectors", label: "Screen Protectors" },
  { value: "Audio Adapters", label: "Audio Adapters" }, { value: "Adapters", label: "Adapters" },
  { value: "Holders", label: "Holders / Stands" }, { value: "Other", label: "Other" },
];

const AccessoryEditScreen = () => {
  const { id: accessoryId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [accessoryType, setAccessoryType] = useState('case');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [models, setModels] = useState([]);
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [featuredPriority, setFeaturedPriority] = useState(0);

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(accessoryId);
  const [updateAccessory, { isLoading: loadingUpdate }] = useUpdateAccessoryMutation();
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();

  useEffect(() => {
    if (accessory) {
      setName(accessory.name); setBrand(accessory.brand);
      setAccessoryType(accessory.accessoryType || accessory.category);
      setCategory(accessory.category || ''); setKeywords(accessory.keywords?.join(', ') || '');
      setFeatured(accessory.featured || false); setFeaturedPriority(accessory.featuredPriority || 0);
      setMetaTitle(accessory.metaTitle || ''); setMetaDescription(accessory.metaDescription || '');
      const normalizedModels = (accessory.models?.length > 0? accessory.models : []).map(m => ({
     ...m, specs: Array.isArray(m.specs)? m.specs : [],
        variants: Array.isArray(m.variants)? m.variants.map(v => ({
       ...v, files: [], colorHex: v.colorHex || '#000', price: Number(v.price) || 0, originalPrice: Number(v.originalPrice || v.price) || 0,
          bulkBase: v.bulkBase || 'discounted',
          bulkPricing: v.bulkPricing?.length > 0? v.bulkPricing.map(b => ({ qty: Number(b.qty) || 1, price: Number(b.price) || 0, discountLabel: b.discountLabel || '' })) : [{ qty: 1, price: Number(v.price) || 0, discountLabel: '' }],
          discount: { type: v.discount?.type || 'percentage', value: Number(v.discount?.value) || 0, startDate: v.discount?.startDate || '', endDate: v.discount?.endDate || '', isActive: v.discount?.isActive || false }
        })) : []
      }));
      setModels(normalizedModels.length > 0? normalizedModels : [{ modelName: 'Universal', description: '', specs: [], variants: [] }]);
    }
  }, [accessory]);

  const uploadImageHandler = (e, mIdx, vIdx) => { const files = Array.from(e.target.files); if (!files.length) return; const updated = [...models]; updated[mIdx].variants[vIdx].files = [...(updated[mIdx].variants[vIdx].files || []),...files]; setModels(updated); e.target.value = ''; };
  const removeNewFileHandler = (mIdx, vIdx, idx) => { const updated = [...models]; updated[mIdx].variants[vIdx].files = updated[mIdx].variants[vIdx].files.filter((_, k) => k!== idx); setModels(updated); };
  const removeImageHandler = (mIdx, vIdx, idx) => { const img = models[mIdx].variants[vIdx].images[idx]; if (img.imagePublicId) setRemovedPublicIds(prev => [...prev, img.imagePublicId]); const updated = [...models]; updated[mIdx].variants[vIdx].images = updated[mIdx].variants[vIdx].images.filter((_, k) => k!== idx); setModels(updated); };
  const onExistingDragEnd = (result, mIdx, vIdx) => { if (!result.destination) return; const updated = [...models]; const images = [...updated[mIdx].variants[vIdx].images]; const [reordered] = images.splice(result.source.index, 1); images.splice(result.destination.index, 0, reordered); updated[mIdx].variants[vIdx].images = images; setModels(updated); };
  const onNewDragEnd = (result, mIdx, vIdx) => { if (!result.destination) return; const updated = [...models]; const files = [...updated[mIdx].variants[vIdx].files]; const [reordered] = files.splice(result.source.index, 1); files.splice(result.destination.index, 0, reordered); updated[mIdx].variants[vIdx].files = files; setModels(updated); };

  const addModel = () => setModels([...models, { modelName: '', description: '', specs: [], variants: [] }]);
  const updateModel = (idx, field, value) => setModels(prev => prev.map((m, i) => i === idx? {...m, [field]: value } : m));
  const removeModel = (idx) => setModels(prev => prev.filter((_, i) => i!== idx));
  const addSpec = (mIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, specs: [...(m.specs || []), { key: '', value: '' }] } : m));
  const updateSpec = (mIdx, sIdx, field, value) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, specs: m.specs.map((s, j) => j === sIdx? {...s, [field]: value } : s) } : m));
  const removeSpec = (mIdx, sIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, specs: m.specs.filter((_, j) => j!== sIdx) } : m));
  const addVariant = (mIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: [...(m.variants || []), { sku: '', name: '', color: '', colorHex: '#000', originalPrice: 0, bulkBase: 'discounted', price: 0, countInStock: 0, images: [], files: [], bulkPricing: [{ qty: 1, price: 0, discountLabel: '' }], discount: { type: 'percentage', value: 0, isActive: false } }] } : m));
  const updateVariant = (mIdx, vIdx, field, value) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: m.variants.map((v, j) => j === vIdx? {...v, [field]: value } : v) } : m));
  const removeVariant = (mIdx, vIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: m.variants.filter((_, j) => j!== vIdx) } : m));
  const updateDiscount = (mIdx, vIdx, field, value) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: m.variants.map((v, j) => j === vIdx? {...v, discount: {...v.discount, [field]: field === 'value'? Number(value) : value }} : v) } : m));
  const addBulk = (mIdx, vIdx) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing.push({ qty: 2, price: 0, discountLabel: '' }); setModels(updated); };
  const updateBulk = (mIdx, vIdx, bIdx, field, value) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing[bIdx][field] = field === 'qty'? Number(value) : field === 'price'? Number(value) : value; setModels(updated); };
  const removeBulk = (mIdx, vIdx, bIdx) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing = updated[mIdx].variants[vIdx].bulkPricing.filter((_, i) => i!== bIdx); setModels(updated); };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      models.forEach((m) => m.variants.forEach((v) => { (v.files || []).forEach((file) => formData.append('images', file)); }));
      let uploaded = []; if (formData.has('images')) { const data = await uploadAccessoryImage(formData).unwrap(); uploaded = Array.isArray(data)? data : [data]; }
      setUploading(false);
      let uploadIndex = 0;
      const finalModels = models.filter(m => m.modelName).map(m => ({
        modelName: m.modelName, description: m.description, specs: m.specs.filter(s => s.key && s.value),
        variants: m.variants.filter(v => v.sku && v.name).map(v => {
          const newImages = (v.files || []).map(() => uploaded[uploadIndex++]);
          return { sku: v.sku, name: v.name, color: v.color, colorHex: v.colorHex, originalPrice: Number(v.originalPrice), price: Number(v.price), bulkBase: v.bulkBase || 'discounted', countInStock: Number(v.countInStock), wattage: v.wattage || '', cableType: v.cableType || '', cableLength: v.cableLength || '', hardness: v.hardness || '', thickness: v.thickness || '', glassType: v.glassType || '', connectorType: v.connectorType || '', audioBits: v.audioBits || '', images: [...(v.images || []),...newImages], bulkPricing: (v.bulkPricing || []).filter(b => b.qty > 0).map(b => ({ qty: Number(b.qty), price: Number(b.price), discountLabel: b.discountLabel || '' })), discount: { type: v.discount.type || null, value: Number(v.discount.value) || 0, startDate: v.discount.startDate || null, endDate: v.discount.endDate || null, isActive: v.discount.isActive || false, } };
        })
      })).filter(m => m.variants.length > 0);

      await updateAccessory({ _id: accessoryId, name, brand, accessoryType, category: category || accessoryType, keywords: keywords.split(',').map(k => k.trim()).filter(k => k), metaTitle, metaDescription, models: finalModels, featured, featuredPriority, removedPublicIds, }).unwrap();
      toast.success('Accessory Updated'); navigate('/admin/accessorylist');
    } catch (err) { setUploading(false); toast.error(err?.data?.message || err.error); }
  };

  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const inputClass = 'w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black outline-none';
  const cardClass = 'bg-white text-gray-900 p-5 rounded-2xl shadow-sm border';

  if (isLoading) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading accessory...</div>
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error?.data?.message || error.error}</div>

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Link to='/admin/accessorylist' className='text-gray-400 hover:text-white text-sm inline-flex items-center gap-1'>← Back to Accessories</Link>
      <h1 className="text-xl md:text-2xl font-bold text-white">Edit: <span className="text-gray-300 font-normal">{name}</span></h1>

      <form onSubmit={submitHandler} className="space-y-5">
        <div className={cardClass}>
          <h2 className="font-bold text-gray-900 mb-4">Basic Info</h2>
          {featured && <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl'>
            <label className='flex items-center gap-3 cursor-pointer'><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className='w-5 h-5'/><span className='font-semibold text-yellow-800 text-sm'>🔥 Featured for Navbar</span></label>
            <div className='mt-3'><label className='block text-xs text-yellow-700 mb-1'>Priority</label><input type="number" min="1" value={featuredPriority} onChange={(e) => setFeaturedPriority(Number(e.target.value))} className='border border-yellow-300 rounded-xl p-2 w-24 text-sm text-gray-900 bg-white'/></div>
          </div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Type *</label><select value={accessoryType} onChange={(e) => setAccessoryType(e.target.value)} className={inputClass}>{ACCESSORY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className={labelClass}>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}><option value="">Select Category</option>{ACCESSORY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div><label className={labelClass}>Name *</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Brand *</label><input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} required /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Keywords</label><input value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} placeholder="comma separated"/></div>
            <div className="sm:col-span-2"><label className={labelClass}>Meta Title</label><input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Meta Description</label><textarea rows="2" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-gray-900">Models</h2><button type="button" onClick={addModel} className="px-4 py-2 bg-black text-white rounded-xl text-sm flex items-center gap-2"><FaPlus size={10}/> Add Model</button></div>
          {models.map((m, mIdx) => (
            <div key={mIdx} className="border border-gray-200 p-4 rounded-2xl mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm text-gray-900">Model {mIdx + 1}</h3><button type="button" onClick={() => removeModel(mIdx)} className="text-red-500 text-xs">Remove Model</button></div>
              <input placeholder="Model Name: Universal / iPhone 17 Pro Max" value={m.modelName} onChange={(e) => updateModel(mIdx, 'modelName', e.target.value)} className={inputClass + " mb-3"} required/>
              <textarea placeholder="Model Description" value={m.description} onChange={(e) => updateModel(mIdx, 'description', e.target.value)} className={inputClass + " mb-3"} rows="2"/>

              <div className="mb-4 p-3 bg-white rounded-xl border">
                <div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-sm text-gray-900">Specs</h4><button type="button" onClick={() => addSpec(mIdx)} className="text-xs font-bold text-black"><FaPlus size={10}/> Add Spec</button></div>
                {m.specs?.length === 0 && <p className="text-xs text-gray-400">No specs</p>}
                {m.specs.map((s, sIdx) => (
                  <div key={sIdx} className="flex gap-2 mb-2"><input className={inputClass} placeholder="Key" value={s.key} onChange={(e) => updateSpec(mIdx, sIdx, 'key', e.target.value)} /><input className={inputClass} placeholder="Value" value={s.value} onChange={(e) => updateSpec(mIdx, sIdx, 'value', e.target.value)} /><button type="button" onClick={() => removeSpec(mIdx, sIdx)} className="px-3 bg-red-50 text-red-600 rounded-xl"><FaTrash size={12}/></button></div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase text-gray-700">Variants</h3>
                {m.variants.map((v, vIdx) => (
                  <div key={vIdx} className="border-l-4 border-black pl-3 bg-white p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3"><h5 className="font-semibold text-sm text-gray-900">Variant {vIdx + 1}</h5><button type="button" onClick={() => removeVariant(mIdx, vIdx)} className="text-red-500 text-xs">Remove</button></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                      <input placeholder="SKU *" value={v.sku} onChange={(e) => updateVariant(mIdx, vIdx, 'sku', e.target.value)} className={inputClass} required/>
                      <input placeholder="Variant Name *" value={v.name} onChange={(e) => updateVariant(mIdx, vIdx, 'name', e.target.value)} className={inputClass} required/>
                      <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(mIdx, vIdx, 'color', e.target.value)} className={inputClass}/>
                      <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3"><input type="color" value={v.colorHex} onChange={(e) => updateVariant(mIdx, vIdx, 'colorHex', e.target.value)} className="w-8 h-8"/><span className="text-xs text-gray-700">{v.colorHex}</span></div>
                      <div><label className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><FaInfoCircle/> Original Price</label><input type="number" step="0.01" value={v.originalPrice} onChange={(e) => updateVariant(mIdx, vIdx, 'originalPrice', e.target.value)} className={inputClass}/></div>
                      <div><label className="text-[10px] text-gray-500 font-bold flex items-center gap-1"><FaInfoCircle/> Selling Price</label><input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(mIdx, vIdx, 'price', e.target.value)} className={inputClass}/></div>
                      <input type="number" placeholder="Stock *" value={v.countInStock} onChange={(e) => updateVariant(mIdx, vIdx, 'countInStock', e.target.value)} className={inputClass}/>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-xl mb-3 border">
                      <h6 className="font-bold text-xs mb-2 text-yellow-800">Discount</h6>
                      <div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={v.discount.isActive} onChange={(e) => updateDiscount(mIdx, vIdx, 'isActive', e.target.checked)} /><label className="text-xs font-medium text-gray-700">Enable</label></div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <select className={inputClass} value={v.discount.type} onChange={(e) => updateDiscount(mIdx, vIdx, 'type', e.target.value)}><option value="percentage">% Percentage</option><option value="fixed">Fixed</option></select>
                        <input type="number" step="0.01" className={inputClass} placeholder="Value" value={v.discount.value} onChange={(e) => updateDiscount(mIdx, vIdx, 'value', e.target.value)} />
                        <input type="date" className={inputClass} value={v.discount.startDate?.split('T')[0] || ''} onChange={(e) => updateDiscount(mIdx, vIdx, 'startDate', e.target.value)} />
                        <input type="date" className={inputClass} value={v.discount.endDate?.split('T')[0] || ''} onChange={(e) => updateDiscount(mIdx, vIdx, 'endDate', e.target.value)} />
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl mb-3 border">
                      <h6 className="font-bold text-xs mb-2 text-purple-800">Bulk Pricing</h6>
                      {v.bulkPricing.map((b, bIdx) => (
                        <div key={bIdx} className="flex gap-2 mb-2">
                          <input type="number" className={inputClass} placeholder="Qty" value={b.qty} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'qty', e.target.value)} />
                          <input type="number" step="0.01" className={inputClass} placeholder="Price" value={b.price} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'price', e.target.value)} />
                          <input type="text" className={inputClass} placeholder="Label" value={b.discountLabel || ''} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'discountLabel', e.target.value)} />
                          {v.bulkPricing.length > 1 && <button type="button" onClick={() => removeBulk(mIdx, vIdx, bIdx)} className="px-3 bg-red-50 text-red-600 rounded-xl"><FaTrash size={12}/></button>}
                        </div>
                      ))}
                      <button type="button" onClick={() => addBulk(mIdx, vIdx)} className="text-xs font-bold text-purple-700"><FaPlus size={10}/> Add Tier</button>
                    </div>

                    {/* EXISTING IMAGES - FIXED X */}
                    {v.images?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Existing Images ({v.images.length})</p>
                        <DragDropContext onDragEnd={(result) => onExistingDragEnd(result, mIdx, vIdx)}>
                          <Droppable droppableId={`existing-${mIdx}-${vIdx}`} direction="horizontal">
                            {(provided) => (
                              <div className="flex gap-4 flex-wrap pt-3 px-2 pb-2 overflow-y-visible bg-gray-50 rounded-xl border" {...provided.droppableProps} ref={provided.innerRef}>
                                {v.images.map((img, idx) => (
                                  <Draggable key={`existing-${img.url}-${idx}`} draggableId={`existing-${img.url}-${idx}`} index={idx}>
                                    {(provided, snapshot) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-visible ${snapshot.isDragging? 'ring-2 ring-black rounded-xl' : ''}`}>
                                        <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/70 p-1.5 rounded-md cursor-grab z-10'><FaGripVertical className="text-white text-[10px]" /></div>
                                        <img src={img.url} className="w-full h-full object-contain rounded-xl border bg-white p-1" alt="existing" />
                                        <button type="button" onClick={() => removeImageHandler(mIdx, vIdx, idx)} className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-20 border-2 border-white"><FaTimes size={11}/></button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    )}

                    <label className='flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-dashed cursor-pointer text-sm font-medium text-gray-700 w-full mb-3'><FaPlus/> Upload New Images<input type='file' multiple accept="image/*" onChange={(e) => uploadImageHandler(e, mIdx, vIdx)} className='hidden' /></label>

                    {v.files?.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-xl border">
                        <p className="text-xs font-semibold text-blue-700 mb-2">New Uploads ({v.files.length}) - Drag to reorder</p>
                        <DragDropContext onDragEnd={(result) => onNewDragEnd(result, mIdx, vIdx)}>
                          <Droppable droppableId={`new-${mIdx}-${vIdx}`} direction="horizontal">
                            {(provided) => (
                              <div className="flex gap-4 flex-wrap pt-3 px-2 pb-2 overflow-y-visible" {...provided.droppableProps} ref={provided.innerRef}>
                                {v.files.map((file, idx) => (
                                  <Draggable key={`new-${file.name}-${idx}`} draggableId={`new-${file.name}-${idx}`} index={idx}>
                                    {(provided, snapshot) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-visible ${snapshot.isDragging? 'ring-2 ring-blue-500 rounded-xl' : ''}`}>
                                        <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/70 p-1.5 rounded-md cursor-grab z-10'><FaGripVertical className="text-white text-[10px]" /></div>
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-contain rounded-xl border bg-white p-1" alt="new" />
                                        <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">NEW</span>
                                        <button type="button" onClick={() => removeNewFileHandler(mIdx, vIdx, idx)} className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-20 border-2 border-white"><FaTimes size={11}/></button>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addVariant(mIdx)} className="w-full py-2.5 bg-green-50 text-green-700 rounded-xl border-2 border-dashed border-green-200 text-sm font-medium flex items-center justify-center gap-2"><FaPlus size={10}/> Add Variant</button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={uploading || loadingUpdate} className={`w-full py-3.5 rounded-2xl font-bold text-white ${uploading || loadingUpdate? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>
          {uploading? 'Uploading...' : loadingUpdate? 'Updating...' : 'Update Accessory'}
        </button>
      </form>
    </div>
  );
};

export default AccessoryEditScreen;