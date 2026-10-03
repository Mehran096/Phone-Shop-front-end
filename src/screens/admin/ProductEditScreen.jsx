import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useGetProductDetailsQuery, useUpdateProductMutation, useUploadProductImageMutation } from '../../slices/productsApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [variants, setVariants] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  useEffect(() => {
    if (product) {
      setName(product.name); setBrand(product.brand); setCategory(product.category);
      setKeywords(product.keywords?.join(', ') || '');
      setVariants(product.variants.map(v => ({
      ...v, specsJson: JSON.stringify(v.specs, null, 2),
        colors: v.colors.map(c => ({
        ...c, files: [], images: c.images || [],
          discount: { type: c.discount?.type || "percentage", value: c.discount?.value || "", startDate: formatDateForInput(c.discount?.startDate), endDate: formatDateForInput(c.discount?.endDate), isActive: c.discount?.isActive || false }
        }))
      })));
    }
  }, [product]);

  const addVariantHandler = () => setVariants([...variants, { storage: '', description: '', specs: {}, specsJson: '', colors: [{ name: '', hexCode: '#000', files: [], images: [], price: '', discount: { type: "percentage", value: "", startDate: "", endDate: "", isActive: false }, countInStock: '', sku: '' }] }]);
  const removeVariantHandler = (vIndex) => setVariants(variants.filter((_, i) => i!== vIndex));
  const updateVariant = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex? {...item, [field]: value } : item));
  const addColorHandler = (vIndex) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: [...item.colors, { name: '', hexCode: '#000', files: [], images: [], price: '', discount: { type: "percentage", value: "", startDate: "", endDate: "", isActive: false }, countInStock: '', sku: '' }] } : item));
  const removeColorHandler = (vIndex, cIndex) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: item.colors.filter((_, ci) => ci!== cIndex) } : item));
  const updateColor = (vIndex, cIndex, field, value) => setVariants((v) => v.map((item, i) => i === vIndex? {...item, colors: item.colors.map((c, ci) => { if (ci!== cIndex) return c; if (field.startsWith("discount.")) { return {...c, discount: {...c.discount, [field.split(".")[1]]: value } }; } return {...c, [field]: value }; }), } : item));
  const uploadFileHandler = (vIndex, cIndex, e) => { const files = Array.from(e.target.files); if (!files.length) return; setVariants(prev => prev.map((v, i) => i === vIndex? {...v, colors: v.colors.map((c, j) => j === cIndex? {...c, files: [...(c.files||[]),...files] } : c) } : v)); e.target.value = ''; };
  const removeImageHandler = (vIndex, cIndex, imgIndex, type) => { const item = variants[vIndex].colors[cIndex][type][imgIndex]; if (type === 'images' && item?.imagePublicId) setImagesToDelete(prev => [...prev, item.imagePublicId]); setVariants(prev => prev.map((v, i) => i === vIndex? {...v, colors: v.colors.map((c, j) => j === cIndex? {...c, [type]: c[type].filter((_, idx) => idx!== imgIndex), } : c) } : v)); toast.success("Image removed") };
  const onDragEnd = (result, vIndex, cIndex, type) => { if (!result.destination) return; setVariants(prev => { const newVariants = structuredClone(prev); const arr = [...newVariants[vIndex].colors[cIndex][type]]; const [reordered] = arr.splice(result.source.index, 1); arr.splice(result.destination.index, 0, reordered); newVariants[vIndex].colors[cIndex][type] = arr; return newVariants; }); };

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
          const newImages = (c.files||[]).map(()=>{ const img=uploaded[uploadIndex]; uploadIndex++; return img; })||[];
          const oldImages = c.images.filter(i=>i.url&&!i.url.startsWith('blob:'));
          return { name: c.name, hexCode: c.hexCode||'', images: [...oldImages,...newImages], price: Number(c.price), discount: { type: c.discount?.type||"percentage", value: Number(c.discount?.value)||0, startDate: c.discount?.startDate? new Date(c.discount.startDate).toISOString():null, endDate: c.discount?.endDate? new Date(c.discount.endDate).toISOString():null, isActive: c.discount?.isActive??false }, countInStock: Number(c.countInStock), sku: c.sku }
        })
      }));
      await updateProduct({ _id: productId, name, brand, category, keywords: keywords.split(',').map(k=>k.trim()).filter(Boolean), variants: finalVariants, imagesToDelete }).unwrap();
      toast.success('Product Updated'); navigate('/admin/productlist');
    } catch (err) { setUploading(false); toast.error(err?.data?.message || err.error); }
  };

  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const inputClass = 'w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:ring-2 focus:ring-black outline-none';
  const cardClass = 'bg-white text-gray-900 p-5 md:p-6 rounded-2xl shadow-sm border';

  if (isLoading) return <div className="bg-white text-gray-900 p-10 rounded-2xl text-center">Loading product...</div>;
  if (error) return <div className="bg-white text-red-600 p-6 rounded-2xl">{error?.data?.message || error.error}</div>;

  return (
    <div className='max-w-5xl mx-auto space-y-5'>
      <Link to='/admin/productlist' className='text-gray-400 hover:text-white text-sm inline-flex items-center gap-1'>← Back to Products</Link>
      <h1 className='text-xl md:text-2xl font-bold text-white'>Edit: <span className="text-gray-300 font-normal">{name}</span></h1>

      <form onSubmit={submitHandler} className='space-y-5'>
        <div className={cardClass}>
          <h2 className='font-bold text-gray-900 mb-4'>Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name *</label><input type='text' value={name} onChange={e=>setName(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Brand *</label><input type='text' value={brand} onChange={e=>setBrand(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Category *</label><input type='text' value={category} onChange={e=>setCategory(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Keywords</label><input type='text' value={keywords} onChange={e=>setKeywords(e.target.value)} className={inputClass} placeholder="comma, separated" /></div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-center mb-4"><h2 className='font-bold text-gray-900'>Variants</h2><button type='button' onClick={addVariantHandler} className='px-4 py-2 text-sm bg-black text-white rounded-xl flex items-center gap-2'><FaPlus size={10}/> Add Variant</button></div>
          {variants.map((variant, vIndex) => (
            <div key={vIndex} className='border border-gray-200 p-4 mb-4 rounded-2xl bg-gray-50'>
              <div className='flex justify-between items-center mb-3'><h3 className='font-semibold text-sm text-gray-900'>Variant {vIndex+1}</h3>{variants.length>1 && <button type='button' onClick={()=>removeVariantHandler(vIndex)} className='text-red-500 text-xs'>Remove Variant</button>}</div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3'><div><label className={labelClass}>Storage *</label><input type='text' value={variant.storage} onChange={e=>updateVariant(vIndex,'storage',e.target.value)} className={inputClass}/></div><div><label className={labelClass}>Description</label><input type='text' value={variant.description} onChange={e=>updateVariant(vIndex,'description',e.target.value)} className={inputClass}/></div></div>
              <div className='mb-3'><label className={labelClass}>Specs JSON *</label><textarea rows={6} value={variant.specsJson} onChange={(e)=>{ const specsJson=e.target.value; let specs={}; try{ specs=JSON.parse(specsJson)}catch{} updateVariant(vIndex,'specsJson',specsJson); updateVariant(vIndex,'specs',specs); }} className={inputClass + ' font-mono text-xs'}/></div>
              <h4 className='font-bold text-xs text-gray-700 mb-2 uppercase'>Colors / SKUs</h4>
              {variant.colors.map((color, cIndex) => (
                <div key={cIndex} className="border-l-4 border-black pl-3 mb-4 bg-white p-4 rounded-xl">
                  <div className='flex justify-between items-center mb-3'><label className="text-sm font-semibold text-gray-900">Color {cIndex+1}</label>{variant.colors.length>1 && <button type='button' onClick={()=>removeColorHandler(vIndex,cIndex)} className='text-red-500 text-xs'>Remove</button>}</div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3'>
                    <input placeholder="Color Name *" value={color.name} onChange={e=>updateColor(vIndex,cIndex,'name',e.target.value)} className={inputClass}/>
                    <div className="flex gap-2 items-center border border-gray-300 rounded-xl px-3"><input type="color" value={color.hexCode} onChange={e=>updateColor(vIndex,cIndex,'hexCode',e.target.value)} className="w-8 h-8"/><span className="text-xs text-gray-700">{color.hexCode}</span></div>
                    <input type='number' placeholder="Price *" value={color.price} onChange={e=>updateColor(vIndex,cIndex,'price',e.target.value)} className={inputClass}/>
                    <input type='number' placeholder="Stock *" value={color.countInStock} onChange={e=>updateColor(vIndex,cIndex,'countInStock',e.target.value)} className={inputClass}/>
                    <input placeholder="SKU" value={color.sku} onChange={e=>updateColor(vIndex,cIndex,'sku',e.target.value)} className={inputClass}/>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 p-3 bg-yellow-50 rounded-xl">
                    <select value={color.discount?.type} onChange={e=>updateColor(vIndex,cIndex,"discount.type",e.target.value)} className={inputClass}><option value="percentage">% Percentage</option><option value="fixed">Fixed</option></select>
                    <input type="number" placeholder="Discount Value" value={color.discount?.value} onChange={e=>updateColor(vIndex,cIndex,"discount.value",e.target.value)} className={inputClass}/>
                    <input type="date" value={color.discount?.startDate||""} onChange={e=>updateColor(vIndex,cIndex,"discount.startDate",e.target.value)} className={inputClass}/>
                    <input type="date" value={color.discount?.endDate||""} onChange={e=>updateColor(vIndex,cIndex,"discount.endDate",e.target.value)} className={inputClass}/>
                    <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2 lg:col-span-4"><input type="checkbox" checked={color.discount?.isActive} onChange={e=>updateColor(vIndex,cIndex,"discount.isActive",e.target.checked)}/> Active Discount</label>
                  </div>
                  <label className='flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 rounded-xl border-2 border-dashed cursor-pointer text-sm w-full mb-3 text-gray-700'><FaPlus/> Add Images<input type='file' multiple accept="image/*" onChange={(e)=>uploadFileHandler(vIndex,cIndex,e)} className='hidden'/></label>

                  {/* EXISTING - FIXED CROSS */}
                  {color.images?.length>0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Existing Images ({color.images.length})</p>
                      <DragDropContext onDragEnd={(r)=>onDragEnd(r,vIndex,cIndex,'images')}>
                        <Droppable droppableId={`old-${vIndex}-${cIndex}`} direction="horizontal">
                          {(provided)=>(
                            <div className="flex gap-4 overflow-x-auto overflow-y-visible pt-3 pb-3 px-2" {...provided.droppableProps} ref={provided.innerRef}>
                              {color.images.map((img,i)=>(<Draggable key={img.imagePublicId+i} draggableId={img.imagePublicId+i} index={i}>{(provided,snapshot)=>(
                                <div ref={provided.innerRef} {...provided.draggableProps} className={`relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 overflow-visible ${snapshot.isDragging?'ring-2 ring-black rounded-xl':''}`}>
                                  <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded z-10'><HiOutlineArrowsUpDown className="text-white text-[10px]"/></div>
                                  <img src={img.url} className="w-full h-full object-contain rounded-xl border bg-white p-1"/>
                                  <button type="button" onClick={()=>removeImageHandler(vIndex,cIndex,i,'images')}
                                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-20 border-2 border-white">
                                    <FaTimes size={11}/>
                                  </button>
                                </div>
                              )}</Draggable>))}{provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}

                  {/* NEW - FIXED CROSS */}
                  {color.files?.length>0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-green-600 mb-2">New Images ({color.files.length})</p>
                      <DragDropContext onDragEnd={(r)=>onDragEnd(r,vIndex,cIndex,'files')}>
                        <Droppable droppableId={`new-${vIndex}-${cIndex}`} direction="horizontal">
                          {(provided)=>(
                            <div className="flex gap-4 overflow-x-auto overflow-y-visible pt-3 pb-3 px-2" {...provided.droppableProps} ref={provided.innerRef}>
                              {color.files.map((file,i)=>(<Draggable key={file.name+i} draggableId={file.name+i} index={i}>{(provided,snapshot)=>(
                                <div ref={provided.innerRef} {...provided.draggableProps} className={`relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 overflow-visible ${snapshot.isDragging?'ring-2 ring-green-500 rounded-xl':''}`}>
                                  <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded z-10'><HiOutlineArrowsUpDown className="text-white text-[10px]"/></div>
                                  <img src={URL.createObjectURL(file)} className="w-full h-full object-contain rounded-xl border bg-white p-1"/>
                                  <span className='absolute top-1 right-1 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold z-10'>NEW</span>
                                  <button type="button" onClick={()=>removeImageHandler(vIndex,cIndex,i,'files')}
                                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg z-20 border-2 border-white">
                                    <FaTimes size={11}/>
                                  </button>
                                </div>
                              )}</Draggable>))}{provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  )}

                  <button type='button' onClick={()=>addColorHandler(vIndex)} className='mt-3 w-full py-2.5 text-sm bg-green-50 text-green-700 rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center gap-2 font-medium'><FaPlus size={10}/> Add Another Color</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button type='submit' disabled={loadingUpdate||uploading} className={`w-full py-3.5 rounded-2xl font-bold text-white ${loadingUpdate||uploading?'bg-gray-400':'bg-black hover:bg-gray-800'}`}>
          {loadingUpdate||uploading? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};
export default ProductEditScreen;