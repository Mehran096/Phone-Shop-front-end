import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaPlus, FaTimes, FaGripVertical } from 'react-icons/fa';
import Select from 'react-select'; // <-- ADDED
import {
  useGetAccessoryDetailsQuery,
  useUpdateAccessoryMutation,
  useUploadAccessoryImageMutation,
} from '../../slices/accessoriesApiSlice';
import { useGetProductsForDropdownQuery } from '../../slices/productsApiSlice';
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
  const [variants, setVariants] = useState([]);
  const [compatibleWith, setCompatibleWith] = useState([]);
  const [compatibleInput, setCompatibleInput] = useState('');
  //const [compatibleSearch, setCompatibleSearch] = useState(''); // <-- ADDED for search
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(accessoryId);
  const [updateAccessory, { isLoading: loadingUpdate }] = useUpdateAccessoryMutation();
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();
  //const { data: productOptions, isLoading: loadingProducts } = useGetProductsForDropdownQuery(compatibleSearch); // <-- SEARCHABLE

  useEffect(() => {
    if (accessory) {
      setName(accessory.name);
      setBrand(accessory.brand);
      setCategory(accessory.category);
      setKeywords(accessory.keywords?.join(', ') || '');
      const normalizedVariants = (accessory.variants?.length > 0? accessory.variants : []).map(v => ({
     ...v,
        specs: Array.isArray(v.specs)? v.specs : [],
        options: Array.isArray(v.options)? v.options.map(opt => ({...opt, files: []})) : []
      }));
      setVariants(normalizedVariants.length > 0? normalizedVariants : [{ type: 'Color', value: '', description: '', specs: [], options: [] }]);
      setCompatibleWith(accessory.compatibleWith || []);
    }
  }, [accessory]);

   

  const uploadImageHandler = (e, vIdx, oIdx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => j === oIdx? {...opt, files: [...(opt.files || []),...files]} : opt)} : v));
    e.target.value = '';
  };

  const handleDragExisting = (vIdx, oIdx, result) => {
    if (!result.destination) return;
    setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => {
      if (j!== oIdx) return opt;
      const items = Array.from(opt.images || []);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      return {...opt, images: items};
    })} : v));
  };

  const handleDragNew = (vIdx, oIdx, result) => {
    if (!result.destination) return;
    setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => {
      if (j!== oIdx) return opt;
      const items = Array.from(opt.files || []);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      return {...opt, files: items};
    })} : v));
  };

  const removeImageHandler = (vIdx, oIdx, idx) => {
    const img = variants[vIdx].options[oIdx].images[idx];
    if (img.imagePublicId) setRemovedPublicIds(prev => [...prev, img.imagePublicId]);
    setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => j === oIdx? {...opt, images: opt.images.filter((_, k) => k!== idx)} : opt)} : v));
  };
  
  const removeFileHandler = (vIdx, oIdx, idx) => {
    setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => j === oIdx? {...opt, files: opt.files.filter((_, k) => k!== idx)} : opt)} : v));
  };

  const addVariant = () => setVariants([...variants, { type: 'Color', value: '', description: '', specs: [], options: [] }]);
  const updateVariant = (idx, field, value) => setVariants(prev => prev.map((v, i) => i === idx? {...v, [field]: value} : v));
  const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i!== idx));
  const addSpec = (vIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: [...(v.specs || []), { key: '', value: '' }]} : v));
  const updateSpec = (vIdx, sIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: v.specs.map((s, j) => j === sIdx? {...s, [field]: value} : s)} : v));
  const removeSpec = (vIdx, sIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: v.specs.filter((_, j) => j!== sIdx)} : v));
  const addOption = (vIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: [...(v.options || []), { name: '', price: 0, compatibleModel: [], countInStock: 0, sku: '', images: [], files: [] }]} : v));
  const updateOption = (vIdx, oIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => j === oIdx? {...opt, [field]: value} : opt)} : v));
  const removeOption = (vIdx, oIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.filter((_, j) => j!== oIdx)} : v));

const modelOptions = compatibleWith.map(m => ({ value: m, label: m }));

const handleCompatibleChange = (selectedOptions, vIdx, oIdx) => {
  const selectedValues = selectedOptions? selectedOptions.map(opt => opt.value) : [];
  updateOption(vIdx, oIdx, 'compatibleModel', selectedValues); // reuse your existing updateOption
};


  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      variants.forEach((v) => v.options.forEach((opt) => (opt.files || []).forEach((file) => formData.append('images', file))));

      let uploaded = [];
      if (formData.has('images')) {
        const data = await uploadAccessoryImage(formData).unwrap();
        uploaded = Array.isArray(data)? data : [data];
      }
      setUploading(false);

      let uploadIndex = 0;
      const finalVariants = variants.filter(v => v.type && v.value).map(v => ({
 ...v,
        specs: v.specs.filter(s => s.key && s.value),
        options: v.options.filter(opt => opt.name && opt.price).map(opt => {
          const newImages = (opt.files || []).map(() => uploaded[uploadIndex++]);
          return {...opt, images: [...(opt.images || []),...newImages], files: [] };
        })
      }));

      await updateAccessory({
        _id: accessoryId, name, brand, category,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        variants: finalVariants,
        compatibleWith: compatibleWith,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" required />
            <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
            <input placeholder="Keywords: comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
          </div>
        </div>
 
{/* COMPATIBLE */}
<div className="border p-4 rounded mt-4">
  <h2 className="font-bold mb-2">Compatible With *</h2>
  <p className="text-sm text-gray-500 mb-2">Type model name and press Enter</p>
  
  <div className="flex flex-wrap gap-2 mb-3">
    {compatibleWith.map((model, index) => (
      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
        {model}
        <button 
          type="button"
          onClick={() => setCompatibleWith(compatibleWith.filter((_, i) => i!== index))}
          className="text-red-500 font-bold hover:text-red-700"
        >
          <FaTimes size={12}/>
        </button>
      </span>
    ))}
  </div>

  <input
    type="text"
    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. Apple iPhone 17 Pro Max"
    value={compatibleInput}
    onChange={(e) => setCompatibleInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && compatibleInput.trim()!== '') {
        e.preventDefault();
        if (!compatibleWith.includes(compatibleInput.trim())) {
          setCompatibleWith([...compatibleWith, compatibleInput.trim()]);
        }
        setCompatibleInput('');
      }
    }}
  />
</div>

        {/* VARIANTS */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Variants</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <FaPlus /> Add Variant
            </button>
          </div>

          {variants.map((v, vIdx) => (
            <div key={vIdx} className="border border-gray-200 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm sm:text-base">Variant {vIdx + 1}</h3>
                <button type="button" onClick={() => removeVariant(vIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><FaTrash /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <input placeholder="Variant Type e.g Color" value={v.type} onChange={(e) => updateVariant(vIdx, 'type', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                <input placeholder="Variant Value e.g Red" value={v.value} onChange={(e) => updateVariant(vIdx, 'value', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
              </div>
              <textarea placeholder="Variant Description" value={v.description} onChange={(e) => updateVariant(vIdx, 'description', e.target.value)} className="w-full p-2.5 border rounded-lg h-20 text-sm mb-4"></textarea>

              {/* SPECS */}
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-sm">Specifications</h4>
                {(v.specs || []).map((s, sIdx) => (
                  <div key={sIdx} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input placeholder="Key e.g Material" value={s.key} onChange={(e) => updateSpec(vIdx, sIdx, 'key', e.target.value)} className="p-2.5 border rounded-lg flex-1 text-sm"/>
                    <input placeholder="Value e.g Silicone" value={s.value} onChange={(e) => updateSpec(vIdx, sIdx, 'value', e.target.value)} className="p-2.5 border rounded-lg flex-1 text-sm"/>
                    <button type="button" onClick={() => removeSpec(vIdx, sIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded self-start"><FaTrash /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addSpec(vIdx)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                  <FaPlus /> Add Spec
                </button>
              </div>

              {/* OPTIONS */}
              {v.options.map((opt, oIdx) => (
                <div key={oIdx} className="border p-4 rounded-lg mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-sm">Option {oIdx + 1}</h5>
                    <button type="button" onClick={() => removeOption(vIdx, oIdx)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">Remove Option</button>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <input placeholder="Option Name" value={opt.name} onChange={(e) => updateOption(vIdx, oIdx, 'name', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                    <input type="number" placeholder="Price" value={opt.price} onChange={(e) => updateOption(vIdx, oIdx, 'price', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                    <input type="number" placeholder="Stock" value={opt.countInStock} onChange={(e) => updateOption(vIdx, oIdx, 'countInStock', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                    <input placeholder="SKU" value={opt.sku} onChange={(e) => updateOption(vIdx, oIdx, 'sku', e.target.value)} className="p-2.5 border rounded-lg text-sm"/>
                  </div>

                  {/*  COMPATIBLE MODEL DROPDOWN */}
                  <div className="grid grid-cols-1 mb-3">
                    <label className="text-xs font-semibold mb-1">Compatible Models</label>
                    <Select
                      isMulti
                      options={modelOptions}
                      value={modelOptions.filter(m => opt.compatibleModel?.includes(m.value))}
                      onChange={(selected) => handleCompatibleChange(selected, vIdx, oIdx)}
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select models... Leave empty = works for all"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Select multiple models. Leave empty if this color works for all phones</p>
                  </div>
                  
                  <input type="file" multiple accept="image/*" onChange={(e) => uploadImageHandler(e, vIdx, oIdx)} className="block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"/>

                  {/* EXISTING IMAGES */}
                  {(opt.images?.length > 0) && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1"><FaGripVertical size={10}/> Existing Images - Drag to Reorder</p>
                      <DragDropContext onDragEnd={(res) => handleDragExisting(vIdx, oIdx, res)}>
                        <Droppable droppableId={`existing-${vIdx}-${oIdx}`} direction="horizontal">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-3 flex-wrap">
                              {(opt.images || []).map((img, idx) => (
                                <Draggable key={img.imagePublicId || idx} draggableId={img.imagePublicId || `old-${idx}`} index={idx}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                                      <div {...provided.dragHandleProps} className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded cursor-grab z-10"><FaGripVertical size={10}/></div>
                                      <img src={img.url} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border shadow-sm" />
                                      <button type="button" onClick={() => removeImageHandler(vIdx, oIdx, idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><FaTimes size={10}/></button>
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

                  {/* NEW UPLOADS */}
                  {opt.files?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2 text-blue-600 flex items-center gap-1"><FaGripVertical size={10}/> New Uploads - Drag to Reorder</p>
                      <DragDropContext onDragEnd={(res) => handleDragNew(vIdx, oIdx, res)}>
                        <Droppable droppableId={`new-${vIdx}-${oIdx}`} direction="horizontal">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-3 flex-wrap">
                              {(opt.files || []).map((file, idx) => (
                                <Draggable key={`new-${idx}-${file.name}`} draggableId={`new-${idx}-${file.name}`} index={idx}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} className="relative group">
                                      <div {...provided.dragHandleProps} className="absolute top-1 left-1 bg-blue-600 text-white p-1 rounded cursor-grab z-10"><FaGripVertical size={10}/></div>
                                      <img src={URL.createObjectURL(file)} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-dashed border-blue-500 shadow-sm" />
                                      <span className="absolute -top-2 left-0 text-[10px] bg-blue-500 text-white px-1.5 rounded">New</span>
                                      <button type="button" onClick={() => removeFileHandler(vIdx, oIdx, idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><FaTimes size={10}/></button>
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
              
              <button type="button" onClick={() => addOption(vIdx)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border-dashed border-green-300 text-sm font-medium w-full justify-center">
                <FaPlus /> Add Option
              </button>
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