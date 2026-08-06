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

const ACCESSORY_TYPES = [
  { value: "case", label: "Case" },
  { value: "charger", label: "Charger" },
  { value: "cable", label: "Cable" },
  { value: "glass", label: "Screen Protector" },
  { value: "audio", label: "Audio" },
  { value: "holder", label: "Holder / Stand" },
];

const AccessoryEditScreen = () => {
  const { id: accessoryId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [accessoryType, setAccessoryType] = useState('case');
  const [keywords, setKeywords] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [models, setModels] = useState([]);
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(accessoryId);
  const [updateAccessory, { isLoading: loadingUpdate }] = useUpdateAccessoryMutation();
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();

  useEffect(() => {
    if (accessory) {
      setName(accessory.name);
      setBrand(accessory.brand);
      setAccessoryType(accessory.accessoryType || accessory.category);
      setKeywords(accessory.keywords?.join(', ') || '');
      setMetaTitle(accessory.metaTitle || '');
      setMetaDescription(accessory.metaDescription || '');

      const normalizedModels = (accessory.models?.length > 0? accessory.models : []).map(m => ({
      ...m,
        specs: Array.isArray(m.specs)? m.specs : [],
        variants: Array.isArray(m.variants)? m.variants.map(v => ({
        ...v,
          files: [],
          bulkPricing: v.bulkPricing?.length > 0? v.bulkPricing : [{ qty: 1, price: v.price }]
        })) : []
      }));

      // Fallback for old DB
      const oldVariants = (accessory.variants?.length > 0? accessory.variants : []).map(v => ({
      ...v,
        specs: Array.isArray(v.specs)? v.specs : [],
        variants: Array.isArray(v.colorVariants)? v.colorVariants.map(cv => ({
        ...cv, name: cv.color, files: [], bulkPricing: [{ qty: 1, price: cv.price }]
        })) : []
      }));

      setModels(normalizedModels.length > 0? normalizedModels : oldVariants.length > 0? oldVariants : [{ modelName: 'Universal', description: '', specs: [], variants: [] }]);
    }
  }, [accessory]);

  const uploadImageHandler = (e, mIdx, vIdx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updated = [...models];
    updated[mIdx].variants[vIdx].files = [...(updated[mIdx].variants[vIdx].files || []),...files];
    setModels(updated);
    e.target.value = '';
  };

  const removeNewFileHandler = (mIdx, vIdx, idx) => {
    const updated = [...models];
    updated[mIdx].variants[vIdx].files = updated[mIdx].variants[vIdx].files.filter((_, k) => k!== idx);
    setModels(updated);
  };

  const removeImageHandler = (mIdx, vIdx, idx) => {
    const img = models[mIdx].variants[vIdx].images[idx];
    if (img.imagePublicId) setRemovedPublicIds(prev => [...prev, img.imagePublicId]);
    const updated = [...models];
    updated[mIdx].variants[vIdx].images = updated[mIdx].variants[vIdx].images.filter((_, k) => k!== idx);
    setModels(updated);
  };

  const onExistingDragEnd = (result, mIdx, vIdx) => {
    if (!result.destination) return;
    const updated = [...models];
    const images = [...updated[mIdx].variants[vIdx].images];
    const [reordered] = images.splice(result.source.index, 1);
    images.splice(result.destination.index, 0, reordered);
    updated[mIdx].variants[vIdx].images = images;
    setModels(updated);
  };

  const onNewDragEnd = (result, mIdx, vIdx) => {
    if (!result.destination) return;
    const updated = [...models];
    const files = [...updated[mIdx].variants[vIdx].files];
    const [reordered] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reordered);
    updated[mIdx].variants[vIdx].files = files;
    setModels(updated);
  };

  const addModel = () => setModels([...models, { modelName: '', description: '', specs: [], variants: [] }]);
  const updateModel = (idx, field, value) => setModels(prev => prev.map((m, i) => i === idx? {...m, [field]: value } : m));
  const removeModel = (idx) => setModels(prev => prev.filter((_, i) => i!== idx));

  const addSpec = (mIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, specs: [...(m.specs || []), { key: '', value: '' }] } : m));
  const updateSpec = (mIdx, sIdx, field, value) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, specs: m.specs.map((s, j) => j === sIdx? {...s, [field]: value } : s) } : m));
  const removeSpec = (mIdx, sIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, specs: m.specs.filter((_, j) => j!== sIdx) } : m));

  const addVariant = (mIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {
  ...m,
    variants: [...(m.variants || []), { sku: '', name: '', price: 0, countInStock: 0, images: [], files: [], bulkPricing: [{ qty: 1, price: 0 }], discount: { type: null, value: 0, isActive: false } }]
  } : m));
  const updateVariant = (mIdx, vIdx, field, value) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: m.variants.map((v, j) => j === vIdx? {...v, [field]: value } : v) } : m));
  const removeVariant = (mIdx, vIdx) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: m.variants.filter((_, j) => j!== vIdx) } : m));
  const updateDiscount = (mIdx, vIdx, field, value) => setModels(prev => prev.map((m, i) => i === mIdx? {...m, variants: m.variants.map((v, j) => j === vIdx? {...v, discount: {...v.discount, [field]: value }} : v) } : m));

  const addBulk = (mIdx, vIdx) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing.push({ qty: 2, price: 0 }); setModels(updated); };
  const updateBulk = (mIdx, vIdx, bIdx, field, value) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing[bIdx][field] = field === 'qty'? Number(value) : Number(value); setModels(updated); };
  const removeBulk = (mIdx, vIdx, bIdx) => { const updated = [...models]; updated[mIdx].variants[vIdx].bulkPricing = updated[mIdx].variants[vIdx].bulkPricing.filter((_, i) => i!== bIdx); setModels(updated); };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      models.forEach((m) => m.variants.forEach((v) => {
        (v.files || []).forEach((file) => formData.append('images', file));
      }));

      let uploaded = [];
      if (formData.has('images')) {
        const data = await uploadAccessoryImage(formData).unwrap();
        uploaded = Array.isArray(data)? data : [data];
      }
      setUploading(false);

      let uploadIndex = 0;
      const finalModels = models.filter(m => m.modelName).map(m => ({
        modelName: m.modelName,
        description: m.description,
        specs: m.specs.filter(s => s.key && s.value),
        variants: m.variants.filter(v => v.sku && v.name).map(v => {
          const newImages = (v.files || []).map(() => uploaded[uploadIndex++]);
          return {
            sku: v.sku,
            name: v.name,
            color: v.color,
            colorHex: v.colorHex,
            price: Number(v.price),
            countInStock: Number(v.countInStock),
            wattage: v.wattage || '', cableType: v.cableType || '', cableLength: v.cableLength || '',
            hardness: v.hardness || '', thickness: v.thickness || '', glassType: v.glassType || '',
            connectorType: v.connectorType || '', audioBits: v.audioBits || '',
            images: [...(v.images || []),...newImages],
            bulkPricing: (v.bulkPricing || []).filter(b => b.qty > 0),
            discount: {
              type: v.discount.type || null,
              value: Number(v.discount.value) || 0,
              startDate: v.discount.startDate || null,
              endDate: v.discount.endDate || null,
              isActive: v.discount.isActive || false,
            }
          };
        })
      })).filter(m => m.variants.length > 0);

      await updateAccessory({
        _id: accessoryId, name, brand, accessoryType, category: accessoryType,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        metaTitle, metaDescription,
        models: finalModels,
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Edit Accessory</h1>
      <form onSubmit={submitHandler} className="space-y-6">

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={accessoryType} onChange={(e) => setAccessoryType(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm">
              {ACCESSORY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
          </div>
          <input placeholder="Keywords: comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mt-4" />
          <input placeholder="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mt-4" />
          <input placeholder="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mt-4" />
        </div>

        {/* MODELS */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Models</h2>
            <button type="button" onClick={addModel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <FaPlus /> Add Model
            </button>
          </div>

          {models.map((m, mIdx) => (
            <div key={mIdx} className="border border-gray-200 p-3 sm:p-4 rounded-lg mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm sm:text-base">Model {mIdx + 1}</h3>
                <button type="button" onClick={() => removeModel(mIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
              </div>

              <input placeholder="Model Name: iPhone 17 Pro Max or Universal" value={m.modelName} onChange={(e) => updateModel(mIdx, 'modelName', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mb-3" required/>
              <textarea placeholder="Model Description" value={m.description} onChange={(e) => updateModel(mIdx, 'description', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm mb-3" rows="2"/>

              {/* VARIANTS */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Variants</h3>
                {m.variants.map((v, vIdx) => (
                  <div key={vIdx} className="border p-3 rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-sm text-blue-600">Variant {vIdx + 1}</h5>
                      <button type="button" onClick={() => removeVariant(mIdx, vIdx)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm">Remove</button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
  <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(mIdx, vIdx, 'sku', e.target.value)} className="p-2.5 border rounded-lg text-sm" required/>
  <input placeholder="Variant Name" value={v.name} onChange={(e) => updateVariant(mIdx, vIdx, 'name', e.target.value)} className="p-2.5 border rounded-lg text-sm" required/>
  <input type="number" placeholder="Price" value={v.price} onChange={(e) => updateVariant(mIdx, vIdx, 'price', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
  <input type="number" placeholder="Stock" value={v.countInStock} onChange={(e) => updateVariant(mIdx, vIdx, 'countInStock', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
</div>

{/* DYNAMIC FIELDS BASED ON TYPE */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
  {(accessoryType === 'charger' || accessoryType === 'cable') && (
    <>
      <input className="p-2 border rounded text-sm" placeholder="Wattage: 20W" value={v.wattage || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'wattage', e.target.value)} />
      <input className="p-2 border rounded text-sm" placeholder="Cable Type: USB-C" value={v.cableType || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'cableType', e.target.value)} />
      <input className="p-2 border rounded text-sm" placeholder="Cable Length: 1m" value={v.cableLength || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'cableLength', e.target.value)} />
    </>
  )}

  {accessoryType === 'glass' && (
    <>
      <input className="p-2 border rounded text-sm" placeholder="Hardness: 9H" value={v.hardness || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'hardness', e.target.value)} />
      <input className="p-2 border rounded text-sm" placeholder="Thickness: 0.3mm" value={v.thickness || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'thickness', e.target.value)} />
      <input className="p-2 border rounded text-sm" placeholder="Glass Type: Tempered Glass" value={v.glassType || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'glassType', e.target.value)} />
    </>
  )}

  {accessoryType === 'audio' && (
    <>
      <input className="p-2 border rounded text-sm" placeholder="Audio Bits: 32-Bit" value={v.audioBits || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'audioBits', e.target.value)} />
      <input className="p-2 border rounded text-sm" placeholder="Connector Type: USB-C" value={v.connectorType || ''} onChange={(e) => updateVariant(mIdx, vIdx, 'connectorType', e.target.value)} />
    </>
  )}
</div>

 

                    {/* BULK PRICING */}
                    <div className="p-3 bg-purple-50 rounded mb-3">
                      <h6 className="font-semibold text-xs mb-2">Bulk Pricing - Like Bol</h6>
                      {v.bulkPricing.map((b, bIdx) => (
                        <div key={bIdx} className="flex gap-2 mb-2 items-center">
                          <input type="number" className="p-2 border rounded text-sm w-24" placeholder="Qty" value={b.qty} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'qty', e.target.value)} />
                          <input type="number" className="p-2 border rounded text-sm flex-1" placeholder="Price" value={b.price} onChange={(e) => updateBulk(mIdx, vIdx, bIdx, 'price', e.target.value)} />
                          {v.bulkPricing.length > 1 && (
                            <button type="button" onClick={() => removeBulk(mIdx, vIdx, bIdx)} className="px-2 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><FaTrash size={12} /></button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addBulk(mIdx, vIdx)} className="text-sm text-purple-600"><FaPlus size={12} /> Add Tier</button>
                    </div>

                    
                    {/* IMAGES - EXISTING + NEW */}
<div className="mt-3">
  {/* EXISTING IMAGES */}
  {v.images?.length > 0 && (
    <div className="mb-4">
      <label className="block font-semibold text-xs mb-2 text-gray-600">Existing Images</label>
      <DragDropContext onDragEnd={(result) => onExistingDragEnd(result, mIdx, vIdx)}>
        <Droppable droppableId={`existing-${mIdx}-${vIdx}`} direction="horizontal">
          {(provided) => (
            <div 
              className="flex gap-3 overflow-x-auto pb-3 pt-1" 
              {...provided.droppableProps} 
              ref={provided.innerRef}
            >
              {v.images.map((img, idx) => (
                <Draggable key={`existing-${img.url}-${idx}`} draggableId={`existing-${img.url}-${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.draggableProps} 
                      className={`relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 group ${snapshot.isDragging? 'opacity-50 scale-105' : ''}`}
                    >
                      {/* DRAG HANDLE */}
                      <div 
                        {...provided.dragHandleProps} 
                        className='absolute top-1.5 left-1.5 bg-black/70 p-1.5 rounded-md cursor-grab z-10 hover:bg-black/90 transition'
                      >
                        <FaGripVertical className="text-white text-xs" />
                      </div>

                      <img 
                        src={img.url} 
                        className="w-full h-full object-contain rounded-lg border bg-white p-1" 
                        alt="existing"
                      />
                      {/* <img src={img.url} className="w-full h-full object-contain rounded-lg border bg-white p-1" /> */}

                      {/* DELETE BUTTON */}
                      <button 
                        type="button" 
                        onClick={() => removeImageHandler(mIdx, vIdx, idx)} 
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10 transition transform hover:scale-110"
                      >
                        <FaTimes size={12} />
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

  {/* NEW UPLOAD BUTTON */}
  <label className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer text-sm font-medium w-full justify-center sm:w-auto transition'>
    <FaPlus /> Upload New Images
    <input type='file' multiple accept="image/*" onChange={(e) => uploadImageHandler(e, mIdx, vIdx)} className='hidden' />
  </label>
  
  {/* NEW UPLOADS PREVIEW */}
  {v.files?.length > 0 && (
    <div className="mt-3">
      <p className="text-xs font-semibold text-gray-600 mb-2">New Uploads <span className="text-blue-500">({v.files.length})</span></p>
      <DragDropContext onDragEnd={(result) => onNewDragEnd(result, mIdx, vIdx)}>
        <Droppable droppableId={`new-${mIdx}-${vIdx}`} direction="horizontal">
          {(provided) => (
            <div 
              className="flex gap-3 overflow-x-auto pb-3 pt-1" 
              {...provided.droppableProps} 
              ref={provided.innerRef}
            >
              {v.files.map((file, idx) => (
                <Draggable key={`new-${file.name}-${idx}`} draggableId={`new-${file.name}-${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.draggableProps} 
                      className={`relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 group ${snapshot.isDragging? 'opacity-50 scale-105' : ''}`}
                    >
                      {/* DRAG HANDLE */}
                      <div 
                        {...provided.dragHandleProps} 
                        className='absolute top-1.5 left-1.5 bg-black/70 p-1.5 rounded-md cursor-grab z-10 hover:bg-black/90 transition'
                      >
                        <FaGripVertical className="text-white text-xs" />
                      </div>

                      <img 
                        src={URL.createObjectURL(file)} 
                        className="w-full h-full object-contain rounded-lg border bg-white p-1"  
                        alt="new upload"
                      />

                      {/* NEW BADGE */}
                      <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        NEW
                      </span>

                      {/* DELETE BUTTON */}
                      <button 
                        type="button" 
                        onClick={() => removeNewFileHandler(mIdx, vIdx, idx)} 
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-10 transition transform hover:scale-110"
                      >
                        <FaTimes size={12} />
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
                  </div>
                ))}
                <button type="button" onClick={() => addVariant(mIdx)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border-dashed border-green-300 text-sm font-medium w-full justify-center">
                  <FaPlus /> Add Variant
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