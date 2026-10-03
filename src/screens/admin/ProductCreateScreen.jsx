import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useCreateProductMutation, useUploadProductImageMutation } from '../../slices/productsApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';

const ProductCreateScreen = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [variants, setVariants] = useState([{
    storage: '', description: '', specs: {}, specsJson: '',
    colors: [{ name: '', hexCode: '#000000', files: [], images: [], price: '', discount: { type: "percentage", value: "", startDate: "", endDate: "", isActive: false }, countInStock: '', sku: '' }]
  }]);

  const [uploading, setUploading] = useState(false);

  const addVariantHandler = () => setVariants([...variants, { storage: '', description: '', specs: {}, specsJson: '', colors: [{ name: '', hexCode: '#000000', files: [], images: [], price: '', discount: { type: "percentage", value: "", startDate: "", endDate: "", isActive: false }, countInStock: '', sku: '' }] }]);
  const removeVariantHandler = (vIndex) => setVariants(variants.filter((_, i) => i!== vIndex));
  const updateVariant = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex? {...item, [field]: value } : item));
  const addColorHandler = (vIndex) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: [...item.colors, { name: '', hexCode: '#000000', files: [], images: [], price: '', discount: { type: "percentage", value: "", startDate: "", endDate: "", isActive: false }, countInStock: '', sku: '' }] } : item));
  const removeColorHandler = (vIndex, cIndex) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: item.colors.filter((_, ci) => ci!== cIndex) } : item));
  const updateColor = (vIndex, cIndex, field, value) => setVariants((v) => v.map((item, i) => i === vIndex? {...item, colors: item.colors.map((c, ci) => { if (ci!== cIndex) return c; if (field.startsWith("discount.")) { return {...c, discount: {...c.discount, [field.split(".")[1]]: value, }, }; } return {...c, [field]: value, }; }), } : item));

  const uploadFileHandler = (vIndex, cIndex, e) => {
    const files = Array.from(e.target.files); if (!files.length) return;
    setVariants(prev => prev.map((v, i) => i === vIndex? {...v, colors: v.colors.map((c, j) => j === cIndex? {...c, files: [...(c.files || []),...files], } : c) } : v));
    e.target.value = '';
  };

  const removeImageHandler = (vIndex, cIndex, fileIndex) => {
    setVariants(prev => prev.map((v, i) => i === vIndex? {...v, colors: v.colors.map((c, j) => j === cIndex? {...c, files: (c.files || []).filter((_, idx) => idx!== fileIndex), } : c) } : v));
    toast.success("Image removed")
  };

  const onDragEnd = (result, vIndex, cIndex) => {
    if (!result.destination) return;
    setVariants(prev => { const newVariants = structuredClone(prev); const files = [...(newVariants[vIndex].colors[cIndex].files || [])]; const [reordered] = files.splice(result.source.index, 1); files.splice(result.destination.index, 0, reordered); newVariants[vIndex].colors[cIndex].files = files; return newVariants; });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      variants.forEach(v => { v.colors.forEach(c => { c.files?.forEach(file => formData.append('images', file)); }) });
      let uploaded = []; if (formData.has('images')) { const data = await uploadProductImage(formData).unwrap(); uploaded = Array.isArray(data)? data : [data]; }
      setUploading(false);
      let uploadIndex = 0;
      const finalVariants = variants.filter(v => v.storage && v.colors.some(c => c.name && c.price)).map(v => ({
        storage: v.storage, description: v.description, specs: v.specs,
        colors: v.colors.filter(c => c.name && c.price).map(c => {
          const newImages = (c.files || []).map(() => { const img = uploaded[uploadIndex]; uploadIndex++; return img; }) || [];
          const oldImages = c.images.filter(i => typeof i === 'object' && i.url &&!i.url.startsWith('blob:'));
          return { name: c.name, hexCode: c.hexCode || '', images: [...oldImages,...newImages], price: Number(c.price), discount: { type: c.discount?.type || "percentage", value: Number(c.discount?.value) || 0, startDate: c.discount?.startDate || null, endDate: c.discount?.endDate || null, isActive: c.discount?.isActive?? false, }, countInStock: Number(c.countInStock), sku: c.sku }
        })
      }));
      await createProduct({ name, brand, category, keywords: keywords.split(',').map(k => k.trim()).filter(Boolean), variants: finalVariants, }).unwrap();
      toast.success('Product Created'); navigate('/admin/productlist');
    } catch (err) { setUploading(false); toast.error(err?.data?.message || err.error); }
  };

  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const inputClass = 'w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black outline-none';
  const cardClass = 'bg-white text-gray-900 p-5 md:p-6 rounded-2xl shadow-sm border';

  return (
    <div className='max-w-5xl mx-auto space-y-5'>
      <Link to='/admin/productlist' className='text-gray-400 hover:text-white text-sm inline-flex items-center gap-1'>← Back to Products</Link>
      <h1 className='text-xl md:text-2xl font-bold text-white'>Create Product</h1>

      <form onSubmit={submitHandler} className='space-y-5'>
        <div className={cardClass}>
          <h2 className='font-bold text-gray-900 mb-4'>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name *</label><input type='text' value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="iPhone 16 Pro Max"/></div>
            <div><label className={labelClass}>Brand *</label><input type='text' value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} required placeholder="Apple"/></div>
            <div><label className={labelClass}>Category *</label><input type='text' value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required placeholder="Smartphones"/></div>
            <div><label className={labelClass}>Keywords</label><input type='text' placeholder='iphone, apple, pro' value={keywords} onChange={e => setKeywords(e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className='font-bold text-gray-900 mb-4'>Variants</h2>
          {variants.map((variant, vIndex) => (
            <div key={vIndex} className='border border-gray-200 p-4 mb-4 rounded-2xl bg-gray-50'>
              <div className='flex justify-between items-center mb-3'><h3 className='font-semibold text-sm text-gray-900'>Variant {vIndex+1}</h3>{variants.length>1 && <button type='button' onClick={() => removeVariantHandler(vIndex)} className='text-red-500 text-xs'>Remove Variant</button>}</div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                <div><label className={labelClass}>Storage *</label><input type='text' placeholder='256GB' value={variant.storage} onChange={e => updateVariant(vIndex, 'storage', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Variant Description</label><input type='text' placeholder='256GB Variant' value={variant.description} onChange={e => updateVariant(vIndex, 'description', e.target.value)} className={inputClass} /></div>
              </div>
              <div className='mb-4'><label className={labelClass}>Specs JSON *</label><textarea rows={6} placeholder={`{\n "Display": "6.88 inch"\n}`} value={variant.specsJson} onChange={(e) => { const specsJson=e.target.value; let specs={}; try{ specs=JSON.parse(specsJson)}catch{} updateVariant(vIndex,'specsJson',specsJson); updateVariant(vIndex,'specs',specs); }} className={inputClass + ' font-mono text-xs'}/></div>

              {variant.colors.map((color, cIndex) => {
                const allPreviews = (color.files || []).map((f, i) => ({ type: 'file', id: `file-${vIndex}-${cIndex}-${i}-${f.name}`, file: f, preview: URL.createObjectURL(f) }));
                return (
                  <div key={cIndex} className="border-l-4 border-black pl-3 mb-4 bg-white p-4 rounded-xl">
                    <div className='flex justify-between items-center mb-3'><label className="text-sm font-semibold text-gray-900">Color {cIndex+1}</label>{variant.colors.length>1 && <button type='button' onClick={() => removeColorHandler(vIndex, cIndex)} className='text-red-500 text-xs'>Remove Color</button>}</div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
                      <div><label className={labelClass}>Color Name *</label><input type='text' placeholder='Black Titanium' value={color.name} onChange={e => updateColor(vIndex, cIndex, 'name', e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Hex Color</label><div className="flex gap-2 items-center border border-gray-300 rounded-xl px-3 py-2"><input type="color" value={color.hexCode||'#000000'} onChange={(e)=>updateColor(vIndex,cIndex,'hexCode',e.target.value)} className="w-8 h-8"/><span className="text-xs text-gray-700">{color.hexCode}</span></div></div>
                    </div>
                    <div className='grid grid-cols-2 gap-4 mb-3'>
                      <div><label className={labelClass}>Price *</label><input type='number' value={color.price} onChange={e => updateColor(vIndex, cIndex, 'price', e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Stock *</label><input type='number' value={color.countInStock} onChange={e => updateColor(vIndex, cIndex, 'countInStock', e.target.value)} className={inputClass} /></div>
                      <div><label className={labelClass}>Discount Type</label><select value={color.discount?.type||"percentage"} onChange={(e)=>updateColor(vIndex,cIndex,"discount.type",e.target.value)} className={inputClass}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option></select></div>
                      <div><label className={labelClass}>Discount Value</label><input type="number" value={color.discount?.value||""} onChange={(e)=>updateColor(vIndex,cIndex,"discount.value",e.target.value)} className={inputClass} placeholder="0"/></div>
                      <div><label className={labelClass}>Start Date</label><input type="date" value={color.discount?.startDate||""} onChange={(e)=>updateColor(vIndex,cIndex,"discount.startDate",e.target.value)} className={inputClass}/></div>
                      <div><label className={labelClass}>End Date</label><input type="date" value={color.discount?.endDate||""} onChange={(e)=>updateColor(vIndex,cIndex,"discount.endDate",e.target.value)} className={inputClass}/></div>
                      <div className="col-span-2"><label className={labelClass}>SKU</label><input type='text' placeholder='A17-256-BLK' value={color.sku} onChange={e => updateColor(vIndex, cIndex, 'sku', e.target.value)} className={inputClass} /></div>
                    </div>

                    <label className='flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl border-2 border-dashed cursor-pointer hover:bg-gray-200 text-sm font-medium text-gray-700 w-full mb-3'>
                      <FaPlus/> Add Images<input type='file' multiple accept="image/*" onChange={(e) => uploadFileHandler(vIndex, cIndex, e)} className='hidden'/>
                    </label>

                    {/* FIXED CROSS - NOT CUT */}
                    {allPreviews.length>0 && (
                      <div className="bg-gray-50 p-3 rounded-xl border">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Selected ({allPreviews.length}) - Drag to reorder</p>
                        <DragDropContext onDragEnd={(result) => onDragEnd(result, vIndex, cIndex)}>
                          <Droppable droppableId={`dnd-${vIndex}-${cIndex}`} direction="horizontal">
                            {(provided) => (
                              <div className="flex gap-4 flex-wrap overflow-y-visible pt-3 px-2 pb-2" {...provided.droppableProps} ref={provided.innerRef}>
                                {allPreviews.map((item, imgIndex) => (
                                  <Draggable key={item.id} draggableId={item.id} index={imgIndex}>
                                    {(provided, snapshot) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} className={`relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 overflow-visible ${snapshot.isDragging?'ring-2 ring-black rounded-xl':''}`}>
                                        <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded z-10 cursor-grab'><HiOutlineArrowsUpDown className="text-white text-[10px]" /></div>
                                        <img src={item.preview} alt={`img-${imgIndex}`} className="w-full h-full object-contain rounded-xl bg-white border p-1"/>
                                        <button type="button" onClick={() => removeImageHandler(vIndex, cIndex, imgIndex)}
                                          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-20 border-2 border-white">
                                          <FaTimes size={11}/>
                                        </button>
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

                    <button type='button' onClick={() => addColorHandler(vIndex)} className='mt-3 w-full py-2.5 text-sm bg-green-50 text-green-700 rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center gap-2 font-medium'><FaPlus size={10}/> Add Another Color</button>
                  </div>
                )
              })}
              <button type='button' onClick={addVariantHandler} className='mt-2 px-4 py-2 text-sm bg-black text-white rounded-xl flex items-center gap-2'><FaPlus size={10}/> Add Variant</button>
            </div>
          ))}
        </div>

        <button type='submit' disabled={loadingCreate || loadingUpload || uploading} className={`w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 ${loadingCreate||loadingUpload||uploading?'bg-gray-400':'bg-black hover:bg-gray-800'}`}>
          {loadingCreate||loadingUpload||uploading? 'Creating Product...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};
export default ProductCreateScreen;