import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateAccessoryMutation, useUploadAccessoryImageMutation } from '../../slices/accessoriesApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import { FaPlus, FaTrash, FaGripVertical, FaTimes } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AccessoryCreateScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Case');
  const [keywords, setKeywords] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [variants, setVariants] = useState([
    {
      modelName: '',
      description: '',
      specs: [{ key: '', value: '' }],
      colorVariants: [
        {
          sku: '', color: '', colorHex: '#000000', price: 0, countInStock: 0,
          files: [], images: [],
          discount: { type: '', value: 0, startDate: '', endDate: '', isActive: false }
        }
      ]
    }
  ]);

  const [uploading, setUploading] = useState(false);
  const [uploadAccessoryImage] = useUploadAccessoryImageMutation();
  const [createAccessory, { isLoading }] = useCreateAccessoryMutation();
  const navigate = useNavigate();

  const uploadImageHandler = (e, vIdx, cIdx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updated = [...variants];
    updated[vIdx].colorVariants[cIdx].files = [...(updated[vIdx].colorVariants[cIdx].files || []),...files];
    setVariants(updated);
    e.target.value = '';
  };

  const removeImageHandler = (vIdx, cIdx, imgIndex) => {
    const updated = [...variants];
    updated[vIdx].colorVariants[cIdx].files = updated[vIdx].colorVariants[cIdx].files.filter((_, idx) => idx!== imgIndex);
    setVariants(updated);
  };

  const onDragEnd = (result, vIdx, cIdx) => {
    if (!result.destination) return;
    const updated = [...variants];
    const files = [...updated[vIdx].colorVariants[cIdx].files];
    const [reordered] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reordered);
    updated[vIdx].colorVariants[cIdx].files = files;
    setVariants(updated);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      variants.forEach(v => {
        v.colorVariants.forEach(cv => {
          (cv.files || []).forEach(file => formData.append('images', file));
        })
      });

      let uploaded = [];
      if (formData.has('images')) {
        const data = await uploadAccessoryImage(formData).unwrap();
        uploaded = Array.isArray(data)? data : [data];
      }
      setUploading(false);

      let uploadIndex = 0;
      const deduped = Array.from(new Map(variants.map(v => [v.modelName, v])).values()).map(v => ({
       ...v,
        colorVariants: Array.from(new Map(v.colorVariants.map(cv => [cv.color, cv])).values())
      }));

      const finalVariants = deduped
      .filter(v => v.modelName)
      .map(v => ({
          modelName: v.modelName,
          description: v.description,
          specs: (v.specs || []).filter(s => s.key && s.value),
          colorVariants: (v.colorVariants || []).filter(cv => cv.color && cv.sku).map(cv => {
            const colorImages = (cv.files || []).map(() => {
              const img = uploaded[uploadIndex];
              uploadIndex++;
              return img;
            });
            return {
              sku: cv.sku,
              color: cv.color,
              colorHex: cv.colorHex || '#000',
              price: Number(cv.price),
              countInStock: Number(cv.countInStock),
              images: colorImages,
              discount: {
                type: cv.discount.type || null,
                value: Number(cv.discount.value) || 0,
                startDate: cv.discount.startDate || null,
                endDate: cv.discount.endDate || null,
                isActive: cv.discount.isActive || false,
              }
            }
          })
        })).filter(v => v.colorVariants.length > 0);

      const accessoryData = {
        name, brand, category,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        metaTitle, metaDescription,
        variants: finalVariants,
      };

      await createAccessory(accessoryData).unwrap();
      toast.success('Accessory Created');
      navigate('/admin/accessorylist');

    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setUploading(false);
    }
  };

  const addModel = () => setVariants([...variants, { modelName: '', description: '', specs: [{key:'',value:''}], colorVariants: [{sku:'',color:'',colorHex:'#000000',price:0,countInStock:0,files:[],discount:{type:'',value:0,isActive:false}}] }]);
  const removeModel = (vIdx) => setVariants(variants.filter((_, i) => i!== vIdx));
  const handleModelChange = (vIdx, field, value) => { const updated = [...variants]; updated[vIdx][field] = value; setVariants(updated); };

  const addSpec = (vIdx) => { const updated = [...variants]; updated[vIdx].specs.push({key:'',value:''}); setVariants(updated); };
  const removeSpec = (vIdx, sIdx) => { const updated = [...variants]; updated[vIdx].specs = updated[vIdx].specs.filter((_, i) => i!== sIdx); setVariants(updated); };
  const handleSpecChange = (vIdx, sIdx, field, value) => { const updated = [...variants]; updated[vIdx].specs[sIdx][field] = value; setVariants(updated); };

  const addColor = (vIdx) => { const updated = [...variants]; updated[vIdx].colorVariants.push({sku:'',color:'',colorHex:'#000000',price:0,countInStock:0,files:[],discount:{type:'',value:0,isActive:false}}); setVariants(updated); };
  const removeColor = (vIdx, cIdx) => { const updated = [...variants]; updated[vIdx].colorVariants = updated[vIdx].colorVariants.filter((_, i) => i!== cIdx); setVariants(updated); };
  const updateColor = (vIdx, cIdx, field, value) => { const updated = [...variants]; updated[vIdx].colorVariants[cIdx][field] = value; setVariants(updated); };
  const updateDiscount = (vIdx, cIdx, field, value) => { const updated = [...variants]; updated[vIdx].colorVariants[cIdx].discount[field] = value; setVariants(updated); };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6">
      <Link to='/admin/accessorylist' className='inline-block mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm'>← Go Back</Link>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Create Accessory V6</h1>
      {isLoading && <Loader />}

      <form onSubmit={submitHandler} className="space-y-4">
        {/* BASIC INFO - STACK ON MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input className="p-2.5 border rounded-lg text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="p-2.5 border rounded-lg text-sm" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input className="p-2.5 border rounded-lg text-sm" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="p-2.5 border rounded-lg text-sm" placeholder="Keywords, comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </div>
        <input className="w-full p-2.5 border rounded-lg text-sm" placeholder="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
        <textarea className="w-full p-2.5 border rounded-lg text-sm" rows="2" placeholder="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />

        {/* MODELS */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base sm:text-lg">Models</h2>
            <button type="button" onClick={addModel} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
              <FaPlus /> <span className="hidden sm:inline">Add Model</span>
            </button>
          </div>

          {variants.map((v, vIdx) => (
            <div key={vIdx} className="mb-4 p-3 sm:p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm sm:text-base">Model {vIdx + 1}</h3>
                <button type="button" onClick={() => removeModel(vIdx)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
                  <FaTrash size={12}/> <span className="hidden sm:inline">Remove</span>
                </button>
              </div>

              <input className="w-full p-2.5 border rounded-lg mb-3 text-sm" placeholder="Model Name: iPhone 17 Pro Max" value={v.modelName} onChange={(e) => handleModelChange(vIdx, 'modelName', e.target.value)} required/>
              <textarea className="w-full p-2.5 border rounded-lg mb-3 text-sm" rows="2" placeholder="Model Description" value={v.description} onChange={(e) => handleModelChange(vIdx, 'description', e.target.value)} />

              {/* SPECS - STACK ON MOBILE */}
              <div className="mb-4 p-3 bg-white rounded-lg border">
                <h4 className="font-semibold mb-2 text-sm">Specs</h4>
                {v.specs.map((s, sIdx) => (
                  <div key={sIdx} className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input className="p-2 border rounded flex-1 text-sm" placeholder="Key: Material" value={s.key} onChange={(e) => handleSpecChange(vIdx, sIdx, 'key', e.target.value)} />
                    <div className="flex gap-2">
                      <input className="p-2 border rounded flex-1 text-sm" placeholder="Value: Silicone" value={s.value} onChange={(e) => handleSpecChange(vIdx, sIdx, 'value', e.target.value)} />
                      <button type="button" onClick={() => removeSpec(vIdx, sIdx)} className="px-3 bg-red-50 text-red-600 rounded"><FaTrash size={12}/></button>
                    </div>
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
                      <button type="button" onClick={() => removeColor(vIdx,cIdx)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm"><FaTrash size={12}/> <span className="hidden sm:inline">Remove</span></button>
                    </div>

                    {/* INPUTS - 1 COL ON MOBILE, 4 COL ON DESKTOP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                      <input className="p-2 border rounded text-sm" placeholder="SKU" value={cv.sku} onChange={(e)=>updateColor(vIdx,cIdx, 'sku',e.target.value)} required/>
                      <input className="p-2 border rounded text-sm" placeholder="Color Name" value={cv.color} onChange={(e)=>updateColor(vIdx,cIdx, 'color',e.target.value)} required/>
                      <div className="flex gap-2 items-center">
                        <label className="text-xs">Hex</label>
                        <input type="color" className="p-1 border rounded h-10 w-full" value={cv.colorHex} onChange={(e)=>updateColor(vIdx,cIdx, 'colorHex',e.target.value)}/>
                      </div>
                      <input type="number" className="p-2 border rounded text-sm" placeholder="Price" value={cv.price} onChange={(e)=>updateColor(vIdx,cIdx, 'price',e.target.value)}/>
                      <input type="number" className="p-2 border rounded text-sm sm:col-span-2 lg:col-span-1" placeholder="Stock" value={cv.countInStock} onChange={(e)=>updateColor(vIdx,cIdx, 'countInStock',e.target.value)}/>
                    </div>

                    {/* DISCOUNT - STACK ON MOBILE */}
                    <div className="p-3 bg-yellow-50 rounded mb-3">
                      <h6 className="font-semibold text-xs mb-2">Discount</h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <select className="p-2 border rounded text-sm" value={cv.discount.type} onChange={(e)=>updateDiscount(vIdx,cIdx,'type',e.target.value)}>
                          <option value="">No Discount</option>
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                        <input type="number" className="p-2 border rounded text-sm" placeholder="Value" value={cv.discount.value} onChange={(e)=>updateDiscount(vIdx,cIdx,'value',e.target.value)}/>
                        <input type="date" className="p-2 border rounded text-sm" value={cv.discount.startDate} onChange={(e)=>updateDiscount(vIdx,cIdx,'startDate',e.target.value)}/>
                        <input type="date" className="p-2 border rounded text-sm" value={cv.discount.endDate} onChange={(e)=>updateDiscount(vIdx,cIdx,'endDate',e.target.value)}/>
                      </div>
                      <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={cv.discount.isActive} onChange={(e)=>updateDiscount(vIdx,cIdx,'isActive',e.target.checked)}/> Active</label>
                    </div>

                    {/* IMAGES - HORIZONTAL SCROLL ON MOBILE */}
                    <label className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border-2 border-dashed cursor-pointer text-sm w-full justify-center sm:w-auto'>
                      <FaPlus /> Upload Color Images
                      <input type='file' multiple accept="image/*" onChange={(e) => uploadImageHandler(e, vIdx, cIdx)} className='hidden' />
                    </label>
                    {cv.files?.length > 0 && (
                      <DragDropContext onDragEnd={(result) => onDragEnd(result, vIdx, cIdx)}>
                        <Droppable droppableId={`dnd-${vIdx}-${cIdx}`} direction="horizontal">
                          {(provided) => (
                            <div className="flex gap-3 overflow-x-auto mt-2 pb-2" {...provided.droppableProps} ref={provided.innerRef}>
                              {cv.files.map((img, imgIndex) => (
                                <Draggable key={img.name + imgIndex} draggableId={img.name + imgIndex} index={imgIndex}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} className="relative w-20 h-20 flex-shrink-0">
                                      <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded cursor-grab'><FaGripVertical className="text-white text-[10px]" /></div>
                                      <img src={URL.createObjectURL(img)} className="w-full h-full object-cover rounded border"/>
                                      <button type="button" onClick={() => removeImageHandler(vIdx, cIdx, imgIndex)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"><FaTimes size={10} /></button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addColor(vIdx)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg border-2 border-dashed w-full text-sm">
                  <FaPlus /> Add Color
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isLoading || uploading} className={`w-full py-3 rounded-xl font-bold text-white ${isLoading || uploading? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
          {isLoading || uploading? 'Creating...' : 'Create Accessory'}
        </button>
      </form>
    </div>
  );
};

export default AccessoryCreateScreen;