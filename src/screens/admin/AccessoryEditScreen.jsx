import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaPlus, FaTimes, FaGripVertical } from 'react-icons/fa';
import {
  useGetAccessoryDetailsQuery,
  useUpdateAccessoryMutation,
  useUploadAccessoryImageMutation,
} from '../../slices/accessoriesApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { toast } from 'react-toastify';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AccessoryEditScreen = () => {
  const { id: accessoryId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [variants, setVariants] = useState([]);
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(accessoryId);
  const [updateAccessory, { isLoading: loadingUpdate }] = useUpdateAccessoryMutation();
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();

  useEffect(() => {
    if (accessory) {
      setName(accessory.name);
      setBrand(accessory.brand);
      setCategory(accessory.category);
      setKeywords(accessory.keywords?.join(', ') || '');
      setMetaTitle(accessory.metaTitle || '');
      setMetaDescription(accessory.metaDescription || '');
      
      const normalizedVariants = (accessory.variants?.length > 0? accessory.variants : []).map(v => ({
     ...v,
        specs: Array.isArray(v.specs)? v.specs : [],
        colorVariants: Array.isArray(v.colorVariants)? v.colorVariants.map(cv => ({
       ...cv,
          files: []
        })) : []
      }));
      setVariants(normalizedVariants.length > 0? normalizedVariants : [{ modelName: '', description: '', specs: [], colorVariants: [] }]);
    }
  }, [accessory]);

  const uploadImageHandler = (e, vIdx, cIdx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updated = [...variants];
    updated[vIdx].colorVariants[cIdx].files = [...(updated[vIdx].colorVariants[cIdx].files || []),...files];
    setVariants(updated);
    e.target.value = '';
  };

  const removeNewFileHandler = (vIdx, cIdx, idx) => {
    const updated = [...variants];
    updated[vIdx].colorVariants[cIdx].files = updated[vIdx].colorVariants[cIdx].files.filter((_, k) => k!== idx);
    setVariants(updated);
  };

  const removeImageHandler = (vIdx, cIdx, idx) => {
    const img = variants[vIdx].colorVariants[cIdx].images[idx];
    if (img.imagePublicId) setRemovedPublicIds(prev => [...prev, img.imagePublicId]);
    const updated = [...variants];
    updated[vIdx].colorVariants[cIdx].images = updated[vIdx].colorVariants[cIdx].images.filter((_, k) => k!== idx);
    setVariants(updated);
  };

  // SEPARATE DRAG FOR EXISTING
  const onExistingDragEnd = (result, vIdx, cIdx) => {
    if (!result.destination) return;
    const updated = [...variants];
    const images = [...updated[vIdx].colorVariants[cIdx].images];
    const [reordered] = images.splice(result.source.index, 1);
    images.splice(result.destination.index, 0, reordered);
    updated[vIdx].colorVariants[cIdx].images = images;
    setVariants(updated);
  };

  // SEPARATE DRAG FOR NEW
  const onNewDragEnd = (result, vIdx, cIdx) => {
    if (!result.destination) return;
    const updated = [...variants];
    const files = [...updated[vIdx].colorVariants[cIdx].files];
    const [reordered] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reordered);
    updated[vIdx].colorVariants[cIdx].files = files;
    setVariants(updated);
  };

  const addModel = () => setVariants([...variants, { modelName: '', description: '', specs: [], colorVariants: [] }]);
  const updateModel = (idx, field, value) => setVariants(prev => prev.map((v, i) => i === idx? {...v, [field]: value } : v));
  const removeModel = (idx) => setVariants(prev => prev.filter((_, i) => i!== idx));
  
  const addSpec = (vIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: [...(v.specs || []), { key: '', value: '' }] } : v));
  const updateSpec = (vIdx, sIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: v.specs.map((s, j) => j === sIdx? {...s, [field]: value } : s) } : v));
  const removeSpec = (vIdx, sIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: v.specs.filter((_, j) => j!== sIdx) } : v));

  const addColor = (vIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? { 
 ...v, 
    colorVariants: [...(v.colorVariants || []), { sku: '', color: '', colorHex: '#000', price: 0, countInStock: 0, images: [], files: [], discount: { type: null, value: 0, isActive: false } }] 
  } : v));
  const updateColor = (vIdx, cIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, colorVariants: v.colorVariants.map((cv, j) => j === cIdx? {...cv, [field]: value } : cv) } : v));
  const removeColor = (vIdx, cIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, colorVariants: v.colorVariants.filter((_, j) => j!== cIdx) } : v));
  const updateDiscount = (vIdx, cIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, colorVariants: v.colorVariants.map((cv, j) => j === cIdx? {...cv, discount: {...cv.discount, [field]: value }} : cv) } : v));

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      variants.forEach((v) => v.colorVariants.forEach((cv) => {
        (cv.files || []).forEach((file) => formData.append('images', file));
      }));

      let uploaded = [];
      if (formData.has('images')) {
        const data = await uploadAccessoryImage(formData).unwrap();
        uploaded = Array.isArray(data)? data : [data];
      }
      setUploading(false);

      let uploadIndex = 0;
      const finalVariants = variants.filter(v => v.modelName).map(v => ({
        modelName: v.modelName,
        description: v.description,
        specs: v.specs.filter(s => s.key && s.value),
        colorVariants: v.colorVariants.filter(cv => cv.color && cv.sku).map(cv => {
          const newImages = (cv.files || []).map(() => uploaded[uploadIndex++]);
          return {
            sku: cv.sku,
            color: cv.color,
            colorHex: cv.colorHex,
            price: Number(cv.price),
            countInStock: Number(cv.countInStock),
            images: [...(cv.images || []),...newImages],
            discount: {
              type: cv.discount.type || null,
              value: Number(cv.discount.value) || 0,
              startDate: cv.discount.startDate || null,
              endDate: cv.discount.endDate || null,
              isActive: cv.discount.isActive || false,
            }
          };
        })
      })).filter(v => v.colorVariants.length > 0);

      await updateAccessory({
        _id: accessoryId, name, brand, category,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        metaTitle, metaDescription,
        variants: finalVariants,
        removedPublicIds,
      }).unwrap();
      toast.success('Accessory Updated');
      navigate('/admin/accessorylist');
    } catch (err) {
      setUploading(false);
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      <Link to='/admin/accessorylist' className='inline-block mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm'>← Go Back</Link>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Edit Accessory V6.2</h1>
      <form onSubmit={submitHandler} className="space-y-6">
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            <input placeholder="Keywords: comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            <input placeholder="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            <input placeholder="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>
        </div>

        {/* MODELS */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Models</h2>
            <button type="button" onClick={addModel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <FaPlus /> Add Model
            </button>
          </div>

          {variants.map((v, vIdx) => (
            <div key={vIdx} className="border border-gray-200 p-3 sm:p-4 rounded-lg mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm sm:text-base">Model {vIdx + 1}</h3>
                <button type="button" onClick={() => removeModel(vIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
              </div>

              <input placeholder="Model Name: iPhone 17 Pro Max" value={v.modelName} onChange={(e) => updateModel(vIdx, 'modelName', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mb-3" required/>
              <textarea placeholder="Model Description" value={v.description} onChange={(e) => updateModel(vIdx, 'description', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mb-3" rows="2"/>

              {/* SPECS */}
              <div className="mb-4 p-3 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm">Specs</h4>
                {v.specs.map((s, sIdx) => (
                  <div key={sIdx} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input placeholder="Key: Material" value={s.key} onChange={(e) => updateSpec(vIdx, sIdx, 'key', e.target.value)} className="p-2 border rounded flex-1 text-sm"/>
                    <input placeholder="Value: Silicone" value={s.value} onChange={(e) => updateSpec(vIdx, sIdx, 'value', e.target.value)} className="p-2 border rounded flex-1 text-sm"/>
                    <button type="button" onClick={() => removeSpec(vIdx, sIdx)} className="px-3 py-2 bg-red-50 text-red-600 rounded flex items-center justify-center"><FaTrash size={12}/></button>
                  </div>
                ))}
                <button type="button" onClick={() => addSpec(vIdx)} className="text-sm text-blue-600"><FaPlus size={12}/> Add Spec</button>
              </div>

              {/* COLORS */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Colors</h3>
                {v.colorVariants.map((cv, cIdx) => (
                  <div key={cIdx} className="border p-3 rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-sm text-blue-600">Color {cIdx + 1}</h5>
                      <button type="button" onClick={() => removeColor(vIdx, cIdx)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm">Remove</button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                      <input placeholder="SKU" value={cv.sku} onChange={(e) => updateColor(vIdx, cIdx, 'sku', e.target.value)} className="p-2.5 border rounded-lg text-sm" required/>
                      <input placeholder="Color Name" value={cv.color} onChange={(e) => updateColor(vIdx, cIdx, 'color', e.target.value)} className="p-2.5 border rounded-lg text-sm" required/>
                      <input type="color" value={cv.colorHex} onChange={(e) => updateColor(vIdx, cIdx, 'colorHex', e.target.value)} className="p-1 border rounded h-10"/>
                      <input type="number" placeholder="Price" value={cv.price} onChange={(e) => updateColor(vIdx, cIdx, 'price', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                      <input type="number" placeholder="Stock" value={cv.countInStock} onChange={(e) => updateColor(vIdx, cIdx, 'countInStock', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                    </div>

                    {/* DISCOUNT */}
                    <div className="p-3 bg-yellow-50 rounded mb-3">
                      <h6 className="font-semibold text-xs mb-2">Discount</h6>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <select className="p-2 border rounded text-sm" value={cv.discount.type || ''} onChange={(e)=>updateDiscount(vIdx,cIdx,'type',e.target.value)}>
                          <option value="">No Discount</option>
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" placeholder="Value" value={cv.discount.value} onChange={(e)=>updateDiscount(vIdx,cIdx,'value',e.target.value)} className="p-2 border rounded text-sm"/>
                        <input type="date" value={cv.discount.startDate || ''} onChange={(e)=>updateDiscount(vIdx,cIdx,'startDate',e.target.value)} className="p-2 border rounded text-sm"/>
                        <input type="date" value={cv.discount.endDate || ''} onChange={(e)=>updateDiscount(vIdx,cIdx,'endDate',e.target.value)} className="p-2 border rounded text-sm"/>
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={cv.discount.isActive} onChange={(e)=>updateDiscount(vIdx,cIdx,'isActive',e.target.checked)}/> Active</label>
                    </div>

                    {/* EXISTING IMAGES - SEPARATE */}
                    {cv.images?.length > 0 && (
                      <div className="mb-4">
                        <label className="block font-semibold text-sm mb-2">Existing Images</label>
                        <DragDropContext onDragEnd={(result) => onExistingDragEnd(result, vIdx, cIdx)}>
                          <Droppable droppableId={`existing-${vIdx}-${cIdx}`} direction="horizontal">
                            {(provided) => (
                              <div 
                                className="flex gap-2 sm:gap-3 flex-wrap p-3 bg-gray-50 rounded-lg"
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                              >
                                {cv.images.map((img, idx) => (
                                  <Draggable key={`existing-${img.url}-${idx}`} draggableId={`existing-${img.url}-${idx}`} index={idx}>
                                    {(provided) => (
                                      <div 
                                        ref={provided.innerRef} 
                                        {...provided.draggableProps} 
                                        className="relative w-16 h-16 sm:w-20 sm:h-20 group"
                                      >
                                        <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded cursor-grab z-10'>
                                          <FaGripVertical className="text-white text-[10px]" />
                                        </div>
                                        <img src={img.url} className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                                        <button 
                                          type="button" 
                                          onClick={() => removeImageHandler(vIdx, cIdx, idx)} 
                                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg"
                                        >
                                          <FaTimes className="text-[10px]" />
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

                    {/* NEW IMAGES - SEPARATE */}
                    <label className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed cursor-pointer text-sm font-medium w-full sm:w-auto justify-center'>
                      <FaPlus /> Upload New Color Images
                      <input type='file' multiple accept="image/*" onChange={(e) => uploadImageHandler(e, vIdx, cIdx)} className='hidden' />
                    </label>
                    
                    {cv.files?.length > 0 && (
                      <div className="mt-3">
                        <label className="block font-semibold text-sm mb-2">New Uploads <span className="text-blue-500">({cv.files.length})</span></label>
                        <DragDropContext onDragEnd={(result) => onNewDragEnd(result, vIdx, cIdx)}>
                          <Droppable droppableId={`new-${vIdx}-${cIdx}`} direction="horizontal">
                            {(provided) => (
                              <div 
                                className="flex gap-2 sm:gap-3 flex-wrap p-3 bg-blue-50 rounded-lg"
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                              >
                                {cv.files.map((file, idx) => (
                                  <Draggable key={`new-${file.name}-${idx}`} draggableId={`new-${file.name}-${idx}`} index={idx}>
                                    {(provided) => (
                                      <div 
                                        ref={provided.innerRef} 
                                        {...provided.draggableProps} 
                                        className="relative w-16 h-16 sm:w-20 sm:h-20 group"
                                      >
                                        <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded cursor-grab z-10'>
                                          <FaGripVertical className="text-white text-[10px]" />
                                        </div>
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg border-2 border-blue-400" />
                                        <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                                          NEW
                                        </span>
                                        <button 
                                          type="button" 
                                          onClick={() => removeNewFileHandler(vIdx, cIdx, idx)} 
                                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg"
                                        >
                                          <FaTimes className="text-[10px]" />
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
                  </div>
                ))}
                
                <button type="button" onClick={() => addColor(vIdx)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border-dashed border-green-300 text-sm font-medium w-full justify-center">
                  <FaPlus /> Add Color
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={uploading || loadingUpdate} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-base">
          {uploading? 'Uploading Images...' : loadingUpdate? 'Updating...' : 'Update Accessory'}
        </button>
      </form>
    </div>
  );
};

export default AccessoryEditScreen;