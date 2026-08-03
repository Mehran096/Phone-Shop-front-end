import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateAccessoryMutation } from '../../slices/accessoriesApiSlice';
//import { useGetProductsForDropdownQuery } from '../../slices/productsApiSlice'; // import from products
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import Select from 'react-select';
import { useUploadAccessoryImageMutation } from '../../slices/accessoriesApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaTrash, FaGripVertical, FaTimes } from 'react-icons/fa';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';

const AccessoryCreateScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Case');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [compatibleSearch, setCompatibleSearch] = useState('');
  const [compatibleInput, setCompatibleInput] = useState('');

  const [compatibleWith, setCompatibleWith] = useState([]);

  const [uploading, setUploading] = useState(false);
const [loadingCreate, setLoadingCreate] = useState(false);

   

const [uploadAccessoryImage, { isLoading: loadingUpload }] = useUploadAccessoryImageMutation();

  const [variants, setVariants] = useState([
    {
      type: 'Color',
      value: '',
      specs: [{key: '', value: ''}],
      description: '',
      options: [
        { 
          name: '', 
          hexCode: '',
          compatibleModel: [],
          price: 0, 
          countInStock: 0, 
          sku: '', 
          files: [], 
          images: [],
          discount: { type: 'percentage', value: 0, startDate: null, endDate: null }, 
        }
      ]
    }
  ]);

  const [createAccessory, { isLoading }] = useCreateAccessoryMutation();
  const navigate = useNavigate();

  // HANDLE COMPATIBLE CHANGE - ADD THIS
// const handleCompatibleChange = (selected) => {
//   const mapped = selected.map(s => ({
//     product: s.value, // only send ID to backend
//     countInStock: 0,
//     imagePublicId: ''
//   }));
//   setCompatibleWith(mapped);
// };

  // IMAGE UPLOAD HANDLER - NEW
 // IMAGE UPLOAD HANDLER - PREVIEW ONLY, NO UPLOAD
const uploadImageHandler = (e, vIdx, oIdx) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  // 1. Only add to files[] for preview. Don't upload yet
  setVariants(prev => prev.map((v, i) => i === vIdx? {
    ...v,
    options: v.options.map((opt, j) => j === oIdx? {
      ...opt, 
      files: [...(opt.files || []),...files] // store File objects only
    } : opt)
  } : v));

  e.target.value = '';
};

const removeImageHandler = (vIdx, oIdx, imgIndex) => {
  setVariants(prev => prev.map((v, i) => i === vIdx? {
   ...v,
    options: v.options.map((opt, j) => j === oIdx? {
     ...opt,
      files: (opt.files || []).filter((_, idx) => idx!== imgIndex),  
      
    } : opt)
  } : v));
  toast.success("Removed")
};

const onDragEnd = (result, vIdx, oIdx) => {
  if (!result.destination) return;
  setVariants(prev => {
    const newV = structuredClone(prev);
    // KEY: Change from images to files
    const files = [...(newV[vIdx].options[oIdx].files || [])];
    const [reordered] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, reordered);
    newV[vIdx].options[oIdx].files = files;
    return newV;
  });
};

 const submitHandler = async (e) => {
  e.preventDefault();
  try {
    setLoadingCreate(true);
    setUploading(true); // NOW THIS WORKS

    // 1. UPLOAD ALL FILES TO CLOUDINARY FIRST
    const formData = new FormData();
    variants.forEach(v => {
      v.options.forEach(opt => {
        (opt.files || []).forEach(file => formData.append('images', file));
      })
    });

    let uploaded = [];
    if (formData.has('images')) {
      const data = await uploadAccessoryImage(formData).unwrap();
      uploaded = Array.isArray(data)? data : [data];
    }
    setUploading(false);

    // 2. MAP UPLOADED URLS BACK TO OPTIONS
    let uploadIndex = 0;
    const finalVariants = variants
 .filter(v => v.type && v.value)
 .map(v => ({
        type: v.type,
        value: v.value,
        description: v.description,
        specs: (v.specs || []).filter(s => s.key && s.value),
        options: (v.options || []).filter(opt => opt.name && opt.price).map(opt => {
          const newImages = (opt.files || []).map(() => {
            const img = uploaded[uploadIndex];
            uploadIndex++;
            return img; // {url, imagePublicId}
          });
          
          return {
            name: opt.name,
            hexCode: opt.hexCode || '',
            compatibleModel: Array.isArray(opt.compatibleModel)
              ? opt.compatibleModel
              : [],  
            price: Number(opt.price),
            countInStock: Number(opt.countInStock),
            sku: opt.sku,
            images: newImages,
            discount: opt.discount || { type: 'percentage', value: 0, startDate: null, endDate: null, isActive: false }
          }
        })
      }));

    const accessoryData = {
      name, brand, category, description,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      specs: specs.reduce((acc, s) => s.key? {...acc, [s.key]: s.value} : acc, {}),
      variants: finalVariants,
      compatibleWith,
    };

    await createAccessory(accessoryData).unwrap();
    toast.success('Accessory Created');
    navigate('/admin/accessorylist');
    
  } catch (err) { 
    toast.error(err?.data?.message || err.error);
  } finally {
    setUploading(false); // reset both on error/success
    setLoadingCreate(false); // reset both on error/success
  }
};

  // const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  // const updateSpec = (idx, field, val) => {
  //   const u = [...specs]; u[idx][field] = val; setSpecs(u);
  // };
  // const removeSpec = (idx) => setSpecs(specs.filter((_, i) => i!== idx));

 const modelOptions = compatibleWith.map(m => ({ value: m, label: m }));

const handleCompatibleChange = (selectedOptions, vIdx, oIdx) => {
  const selectedValues = selectedOptions? selectedOptions.map(opt => opt.value) : [];
  const updatedVariants = [...variants];
  updatedVariants[vIdx].options[oIdx].compatibleModel = selectedValues;
  setVariants(updatedVariants);
};

 const addVariant = () => {
  setVariants([
   ...variants,
    {
      type: '',
      value: '',
      description: '',
      specs: [{key: '', value: ''}], // ADD THIS
      options: [{name:'', hexCode:'', compatibleModel: [], sku:'', price:0, countInStock:0, images:[null], discount:{type:'percentage', value:0, startDate:null, endDate:null}}]
    }
  ]);
};

const removeVariant = (vIdx) => {
  setVariants(variants.filter((_, i) => i!== vIdx));
};

const handleVariantChange = (vIdx, field, value) => {
  const updated = [...variants];
  updated[vIdx][field] = value;
  setVariants(updated);
};

const addVariantSpec = (vIdx) => {
  const updated = [...variants];
  updated[vIdx].specs.push({key: '', value: ''});
  setVariants(updated);
};

const removeVariantSpec = (vIdx, sIdx) => {
  const updated = [...variants];
  updated[vIdx].specs = updated[vIdx].specs.filter((_, i) => i!== sIdx);
  setVariants(updated);
};

const handleVariantSpecChange = (vIdx, sIdx, field, value) => {
  const updated = [...variants];
  updated[vIdx].specs[sIdx][field] = value;
  setVariants(updated);
};

const addOption = (vIdx) => {
  const updated = [...variants];
  updated[vIdx].options.push({name:'', hexCode:'', compatibleModel: [], sku:'', price:0, countInStock:0, images:[null]});
  setVariants(updated);
};

const removeOption = (vIdx, oIdx) => {
  const updated = [...variants];
  updated[vIdx].options = updated[vIdx].options.filter((_, i) => i!== oIdx);
  setVariants(updated);
};

const updateOption = (vIdx, oIdx, field, value) => {
  const updated = [...variants];
  updated[vIdx].options[oIdx][field] = value;
  setVariants(updated);
};

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link to='/admin/accessorylist' className='inline-block mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm'>← Go Back</Link>
      <h1 className="text-2xl font-bold mb-6">Create Accessory</h1>
      {isLoading && <Loader />}

      <form onSubmit={submitHandler} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input className="p-2 border rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="p-2 border rounded" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </div>
        
        <input className="w-full p-2 border rounded" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        {/* <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /> */}
        <input className="w-full p-2 border rounded" placeholder="Keywords, comma separated" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
 

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
          onClick={() => setCompatibleWith(compatibleWith.filter((_, i) => i !== index))}
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
      if (e.key === 'Enter' && compatibleInput.trim() !== '') {
        e.preventDefault();
        if (!compatibleWith.includes(compatibleInput.trim())) {
          setCompatibleWith([...compatibleWith, compatibleInput.trim()]);
        }
        setCompatibleInput('');
      }
    }}
  />
</div>

      {/* VARIANTS WITH IMAGE UPLOAD */}
{/* VARIANTS WITH IMAGE UPLOAD */}
<div className="bg-white p-4 sm:p-6 rounded-xl shadow border mb-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="font-bold text-lg sm:text-xl">Variants</h2>
    <button 
      type="button" 
      onClick={addVariant} 
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
    >
      <FaPlus /> Add Variant
    </button>
  </div>

  {variants.map((v, vIdx) => (
    <div key={vIdx} className="mb-4 p-4 border rounded-lg bg-gray-50">
      
      {/* VARIANT HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">Variant {vIdx + 1}</h3>
        <button 
          type="button" 
          onClick={() => removeVariant(vIdx)} 
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
        >
          <FaTrash size={12}/> Remove
        </button>
      </div>

      {/* VARIANT TYPE + VALUE + DESCRIPTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          className="p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type: Color"
          value={v.type}
          onChange={(e) => handleVariantChange(vIdx, 'type', e.target.value)}
        />
        <input
          className="p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Value: Red"
          value={v.value}
          onChange={(e) => handleVariantChange(vIdx, 'value', e.target.value)}
        />
      </div>
      <textarea
        className="w-full p-2.5 border rounded-lg mb-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="2"
        placeholder="Variant Description"
        value={v.description}
        onChange={(e) => handleVariantChange(vIdx, 'description', e.target.value)}
      />

      {/* VARIANT SPECS */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
        <h4 className="font-semibold mb-3 text-sm">Variant Specs</h4>
        {(v.specs || []).map((s, sIdx) => (
          <div key={sIdx} className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              className="p-2.5 border rounded-lg flex-1 text-sm"
              placeholder="Key: Material"
              value={s.key}
              onChange={(e) => handleVariantSpecChange(vIdx, sIdx, 'key', e.target.value)}
            />
            <input
              className="p-2.5 border rounded-lg flex-1 text-sm"
              placeholder="Value: Silicone"
              value={s.value}
              onChange={(e) => handleVariantSpecChange(vIdx, sIdx, 'value', e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => removeVariantSpec(vIdx, sIdx)} 
              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm sm:w-auto w-full"
            >
              <FaTrash size={12}/> Remove
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => addVariantSpec(vIdx)} 
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
        >
          <FaPlus size={12}/> Add Spec
        </button>
      </div>

      {/* OPTIONS */}
      <div className="space-y-3">
        <h3 className="font-semibold mb-2 text-sm">Options</h3>
        {v.options.map((opt, oIdx) => (
          <div key={oIdx} className="border p-3 rounded-lg bg-white">
            {/* OPTION HEADER */}
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-sm text-blue-600">Option {oIdx + 1}</h5>
              <button 
                type="button" 
                onClick={() => removeOption(vIdx,oIdx)} 
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
              >
                <FaTrash size={12}/> Remove
              </button>
            </div>

            {/* MOBILE RESPONSIVE INPUTS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
              <input className="p-2.5 border rounded-lg text-sm" placeholder="Name" value={opt.name} onChange={(e)=>updateOption(vIdx,oIdx, 'name',e.target.value)}/>
              <input className="p-2.5 border rounded-lg text-sm" placeholder="Hex #000" value={opt.hexCode} onChange={(e)=>updateOption(vIdx,oIdx, 'hexCode',e.target.value)}/>
              <input className="p-2.5 border rounded-lg text-sm" placeholder="SKU" value={opt.sku} onChange={(e)=>updateOption(vIdx,oIdx, 'sku',e.target.value)}/>
              <input type="number" className="p-2.5 border rounded-lg text-sm" placeholder="Price" value={opt.price} onChange={(e)=>updateOption(vIdx,oIdx, 'price',e.target.value)}/>
              <input type="number" className="p-2.5 border rounded-lg text-sm" placeholder="Stock" value={opt.countInStock} onChange={(e)=>updateOption(vIdx,oIdx, 'countInStock',e.target.value)}/>
            </div>

            {/* COMPATIBLE MODEL DROPDOWN */}
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

            {/* IMAGE UPLOAD PER OPTION */}
            <div className="mt-3">
              <label className="block font-semibold text-sm mb-2">Images *</label>
              
              <div className='mb-3'>
                <label className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 text-sm font-medium'>
                  <FaPlus />
                  <span>{uploading? 'Preparing...' : 'Select Images'}</span>
                  <input
                    type='file' multiple accept="image/*"
                    onChange={(e) => uploadImageHandler(e, vIdx, oIdx)}
                    className='hidden' disabled={uploading}
                  />
                </label>
              </div>

              {/* IMAGE PREVIEWS WITH DND */}
              {opt.files?.length > 0 && (
                <div className='p-3 bg-gray-100 rounded-lg min-h-[100px]'>
                  <DragDropContext onDragEnd={(result) => onDragEnd(result, vIdx, oIdx)}>
                    <Droppable droppableId={`dnd-${vIdx}-${oIdx}`} direction="horizontal">
                      {(provided) => (
                        <div className="flex gap-3 flex-wrap" {...provided.droppableProps} ref={provided.innerRef}>
                          {[...(opt.files || [])].map((img, imgIndex) => (
                            <Draggable key={img.name + imgIndex} draggableId={img.name + imgIndex} index={imgIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative w-20 h-20 sm:w-24 sm:h-24 group ${snapshot.isDragging? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                                >
                                  <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded cursor-grab z-10'>
                                    <FaGripVertical className="text-white text-[10px]" />
                                  </div>
                                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover rounded-lg border-2 border-dashed border-blue-400 shadow-sm"/>
                                  <span className="absolute -top-2 left-0 text-[10px] bg-blue-500 text-white px-1.5 rounded">New</span>
                                  <button type="button" onClick={() => removeImageHandler(vIdx, oIdx, imgIndex)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition">
                                    <FaTimes />
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
        
        {/* ADD OPTION BUTTON */}
        <button 
          type="button" 
          onClick={() => addOption(vIdx)} 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border-2 border-dashed border-green-300 text-sm font-medium w-full"
        >
          <FaPlus /> Add Option
        </button>
      </div>
    </div>
  ))}
</div>

        <button 
  type="submit" 
  disabled={loadingCreate || uploading || loadingUpload}
  className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition flex items-center justify-center gap-2 mt-6
    ${loadingCreate || uploading || loadingUpload
     ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-green-600 hover:bg-green-700'
    }`}
>
  {loadingCreate || uploading || loadingUpload? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {uploading || loadingUpload? 'Uploading Images...' : 'Creating Accessory...'}
    </>
  ) : 'Create Accessory'}
</button>
      </form>
    </div>
  );
};

export default AccessoryCreateScreen;