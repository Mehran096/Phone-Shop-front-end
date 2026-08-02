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
  const [variants, setVariants] = useState([]);
  const [compatibleWith, setCompatibleWith] = useState([]);
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
      
      const normalizedVariants = (accessory.variants?.length > 0? accessory.variants : []).map(v => ({
        type: v.type || 'Color',
        value: v.value || '',
        description: v.description || '',
        specs: Array.isArray(v.specs)? v.specs : [],
        options: Array.isArray(v.options)? v.options.map(opt => ({
       ...opt,
          files: [], // for new uploads
          discount: opt.discount || { type: 'percentage', value: 0, startDate: null, endDate: null, isActive: false }
        })) : []
      }));
      
      setVariants(normalizedVariants.length > 0? normalizedVariants : [{ type: 'Color', value: '', description: '', specs: [], options: [] }]);
      setCompatibleWith(accessory.compatibleWith || []);
    }
  }, [accessory]);

  // FIXED: UPLOAD IMAGE HANDLER - SAME AS YOUR SCREENSHOT
  const uploadImageHandler = (e, vIdx, oIdx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setVariants(prev => prev.map((v, i) => i === vIdx? {
     ...v,
      options: v.options.map((opt, j) => j === oIdx? {
       ...opt,
        files: [...(opt.files || []),...files] // store File objects only
      } : opt)
    } : v));
    e.target.value = ''; // reset input
  };

  const removeFileHandler = (vIdx, oIdx, fileIdx) => {
    setVariants(prev => prev.map((v, i) => i === vIdx? {
     ...v,
      options: v.options.map((opt, j) => j === oIdx? {
       ...opt,
        files: (opt.files || []).filter((_, idx) => idx!== fileIdx),
      } : opt)
    } : v));
    toast.info("New file removed");
  };

  // DRAG & DROP FOR EXISTING IMAGES
  const handleDragEnd = (vIdx, oIdx, result) => {
    if (!result.destination) return;
    setVariants(prev => prev.map((v, i) => 
      i === vIdx? {...v, options: v.options.map((opt, j) => 
        j === oIdx? {...opt, images: reorder(opt.images || [], result.source.index, result.destination.index)} : opt
      )} : v
    ));
  };
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const addVariant = () => setVariants([...variants, { type: 'Color', value: '', description: '', specs: [], options: [] }]);
  const updateVariant = (idx, field, value) => setVariants(prev => prev.map((v, i) => i === idx? {...v, [field]: value} : v));
  const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i!== idx));

  const addSpec = (vIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: [...(v.specs || []), { key: '', value: '' }]} : v));
  const updateSpec = (vIdx, sIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: v.specs.map((s, j) => j === sIdx? {...s, [field]: value} : s)} : v));
  const removeSpec = (vIdx, sIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, specs: v.specs.filter((_, j) => j!== sIdx)} : v));

  const addOption = (vIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: [...(v.options || []), { name: '', price: 0, countInStock: 0, sku: '', images: [], files: [], discount: { type: 'percentage', value: 0, startDate: null, endDate: null, isActive: false } }]} : v));
  const updateOption = (vIdx, oIdx, field, value) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => j === oIdx? {...opt, [field]: value} : opt)} : v));
  const removeOption = (vIdx, oIdx) => setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.filter((_, j) => j!== oIdx)} : v));
  
  const removeImageHandler = (vIdx, oIdx, imgIdx) => {
    const img = variants[vIdx].options[oIdx].images[imgIdx];
    if (img.imagePublicId) setRemovedPublicIds(prev => [...prev, img.imagePublicId]);
    setVariants(prev => prev.map((v, i) => i === vIdx? {...v, options: v.options.map((opt, j) => j === oIdx? {...opt, images: opt.images.filter((_, k) => k!== imgIdx)} : opt)} : v));
    toast.success("Removed");
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
          const { files,...rest } = opt;
          return {...rest, images: [...(opt.images || []),...newImages] };
        })
      }));

      const accessoryData = {
        _id: accessoryId, name, brand, category,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        variants: finalVariants,
        compatibleWith,
        removedPublicIds,
      };

      await updateAccessory(accessoryData).unwrap();
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
    <div className="max-w-6xl mx-auto p-6">
      <Link to='/admin/accessorylist' className='inline-block mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200'>← Go Back</Link>
      <h1 className="text-3xl font-bold mb-6">Edit Accessory</h1>
      
      <form onSubmit={submitHandler} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded-lg" required />
            <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="p-2 border rounded-lg" required />
            <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded-lg" />
            <input placeholder="Keywords: comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="p-2 border rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Variants</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><FaPlus /> Add Variant</button>
          </div>

          {variants.map((v, vIdx) => (
            <div key={vIdx} className="border border-gray-200 p-4 rounded-lg mb-4 space-y-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">Variant {vIdx + 1}</h3>
                <button type="button" onClick={() => removeVariant(vIdx)} className="text-red-500"><FaTrash /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Type" value={v.type} onChange={(e) => updateVariant(vIdx, 'type', e.target.value)} className="p-2 border rounded-lg"/>
                <input placeholder="Value" value={v.value} onChange={(e) => updateVariant(vIdx, 'value', e.target.value)} className="p-2 border rounded-lg"/>
              </div>
              <textarea placeholder="Description" value={v.description} onChange={(e) => updateVariant(vIdx, 'description', e.target.value)} className="w-full p-2 border rounded-lg h-20"></textarea>

              <div>
                <h4 className="font-medium mb-2">Specifications</h4>
                {(v.specs || []).map((s, sIdx) => (
                  <div key={sIdx} className="flex gap-2 mb-2">
                    <input placeholder="Key" value={s.key} onChange={(e) => updateSpec(vIdx, sIdx, 'key', e.target.value)} className="p-2 border rounded-lg flex-1"/>
                    <input placeholder="Value" value={s.value} onChange={(e) => updateSpec(vIdx, sIdx, 'value', e.target.value)} className="p-2 border rounded-lg flex-1"/>
                    <button type="button" onClick={() => removeSpec(vIdx, sIdx)} className="text-red-500"><FaTrash /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addSpec(vIdx)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
  <FaPlus size={14} /> Add Spec
</button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Options</h4>
                {(v.options || []).map((opt, oIdx) => (
                  <div key={oIdx} className="border p-3 rounded-lg mb-3 space-y-2 bg-gray-50">
                    <div className="grid grid-cols-4 gap-2">
                      <input placeholder="Name" value={opt.name} onChange={(e) => updateOption(vIdx, oIdx, 'name', e.target.value)} className="p-2 border rounded-lg"/>
                      <input type="number" placeholder="Price" value={opt.price} onChange={(e) => updateOption(vIdx, oIdx, 'price', e.target.value)} className="p-2 border rounded-lg"/>
                      <input type="number" placeholder="Stock" value={opt.countInStock} onChange={(e) => updateOption(vIdx, oIdx, 'countInStock', e.target.value)} className="p-2 border rounded-lg"/>
                      <input placeholder="SKU" value={opt.sku} onChange={(e) => updateOption(vIdx, oIdx, 'sku', e.target.value)} className="p-2 border rounded-lg"/>
                    </div>
                    
                    <input type="file" multiple onChange={(e) => uploadImageHandler(e, vIdx, oIdx)} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"/>

                    {/* PREVIEW: EXISTING IMAGES + NEW FILES */}
                    <div className="flex gap-2 flex-wrap">
                      {/* 1. Existing images from DB with DnD */}
                      <DragDropContext onDragEnd={(result) => handleDragEnd(vIdx, oIdx, result)}>
                        <Droppable droppableId={`images-${vIdx}-${oIdx}`} direction="horizontal">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-2">
                              {(opt.images || []).map((img, imgIdx) => (
                                <Draggable key={img.imagePublicId || imgIdx} draggableId={img.imagePublicId || `img-${imgIdx}`} index={imgIdx}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} className="relative">
                                      <div {...provided.dragHandleProps} className="absolute top-0 left-0 bg-black bg-opacity-50 text-white p-1 rounded cursor-grab"><FaGripVertical size={10}/></div>
                                      <img src={img.url} className="w-20 h-20 object-cover rounded border" />
                                      <button type="button" onClick={() => removeImageHandler(vIdx, oIdx, imgIdx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FaTimes size={10}/></button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      {/* 2. NEW files selected but not uploaded yet */}
                      {(opt.files || []).map((file, fileIdx) => (
                        <div key={fileIdx} className="relative">
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded border border-dashed border-blue-500" />
                          <span className="absolute -top-2 left-0 text-xs bg-blue-500 text-white px-1 rounded">New</span>
                          <button type="button" onClick={() => removeFileHandler(vIdx, oIdx, fileIdx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FaTimes size={10}/></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => removeOption(vIdx, oIdx)} className="text-red-600 text-sm">Remove Option</button>
                  </div>
                ))}
                <button type="button" onClick={() => addOption(vIdx)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
  <FaPlus size={14} /> Add Option
</button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={uploading || loadingUpdate} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400">
          {uploading? 'Uploading Images...' : loadingUpdate? 'Updating...' : 'Update Accessory'}
        </button>
      </form>
    </div>
  );
};

export default AccessoryEditScreen;