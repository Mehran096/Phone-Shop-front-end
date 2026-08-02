import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAccessoryMutation } from '../../slices/accessoriesApiSlice';
import { useGetProductsForDropdownQuery } from '../../slices/productsApiSlice'; // import from products
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import Select from 'react-select';
import { useUploadAccessoryImageMutation } from '../../slices/accessoriesApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus } from 'react-icons/fa';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';

const AccessoryCreateScreen = () => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Case');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [compatibleSearch, setCompatibleSearch] = useState('');

  const [compatibleWith, setCompatibleWith] = useState([]);

  const [uploading, setUploading] = useState(false);
const [loading, setLoading] = useState(false);

  const { data: productOptions, isLoading: loadingProducts, isError } = useGetProductsForDropdownQuery(compatibleSearch, {});

const options = useMemo(() => productOptions || [], [productOptions]);

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
const handleCompatibleChange = (selected) => {
  const mapped = selected.map(s => ({
    product: s.value, // only send ID to backend
    countInStock: 0,
    imagePublicId: ''
  }));
  setCompatibleWith(mapped);
};

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
    setUploading(false);
    toast.error(err?.data?.message || err.error);
  }
};

  // const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  // const updateSpec = (idx, field, val) => {
  //   const u = [...specs]; u[idx][field] = val; setSpecs(u);
  // };
  // const removeSpec = (idx) => setSpecs(specs.filter((_, i) => i!== idx));

  const addCompatible = (product) => {
    if(!compatibleWith.find(c => c.product === product._id))
      setCompatibleWith([...compatibleWith, { product: product._id, countInStock: 0, imagePublicId: '' }]);
    setCompatibleSearch('');
  };
  const removeCompatible = (id) => setCompatibleWith(compatibleWith.filter(c => c.product!== id));

 const addVariant = () => {
  setVariants([
   ...variants,
    {
      type: '',
      value: '',
      description: '',
      specs: [{key: '', value: ''}], // ADD THIS
      options: [{name:'', hexCode:'', sku:'', price:0, countInStock:0, images:[null], discount:{type:'percentage', value:0, startDate:null, endDate:null}}]
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
  updated[vIdx].options.push({name:'', hexCode:'', sku:'', price:0, countInStock:0, images:[null]});
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

        {/* SPECS */}
        {/* <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Specs</h2>
          {specs.map((s, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
              <input className="p-2 border rounded" placeholder="Key: Material" value={s.key} onChange={(e)=>updateSpec(idx,'key',e.target.value)}/>
              <input className="p-2 border rounded" placeholder="Value: Silicone" value={s.value} onChange={(e)=>updateSpec(idx,'value',e.target.value)}/>
              <button type="button" onClick={()=>removeSpec(idx)} className="bg-red-500 text-white px-2 rounded">X</button>
            </div>
          ))}
          <button type="button" onClick={addSpec} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">+ Add Spec</button>
        </div> */}

        {/* COMPATIBLE */}
        <div className="border p-4 rounded">
  <h2 className="font-bold mb-2">Compatible With *</h2>
  <Select
    isMulti
    options={options}
    onInputChange={(val) => setCompatibleSearch(val)}
    onChange={handleCompatibleChange}
    placeholder="Type to search products..."
    isLoading={loadingProducts}
    noOptionsMessage={() => isError? "Error loading products" : "Type to search..."}
    value={options.filter(o => compatibleWith.some(c => c.product === o.value))}
  />
  {isError && <p className="text-red-500 text-sm mt-1">Failed to load products. Check /api/products/dropdown</p>}
</div>

      {/* VARIANTS WITH IMAGE UPLOAD */}
<div className="border p-4 rounded bg-gray-50">
  <h2 className="font-bold mb-3">Variants</h2>

  {variants.map((v, vIdx) => (
    <div key={vIdx} className="mb-4 p-3 border rounded bg-white">
      
      {/* VARIANT TYPE + VALUE + DELETE */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <input
          className="p-2 border rounded"
          placeholder="Type: Color"
          value={v.type}
          onChange={(e) => handleVariantChange(vIdx, 'type', e.target.value)}
        />
        <input
          className="p-2 border rounded"
          placeholder="Value: Red"
          value={v.value}
          onChange={(e) => handleVariantChange(vIdx, 'value', e.target.value)}
        />
        <button type="button" onClick={() => removeVariant(vIdx)} className="bg-red-500 text-white rounded">X</button>
      </div>

      {/* VARIANT DESCRIPTION */}
      <textarea
        className="w-full p-2 border rounded mb-3"
        rows="2"
        placeholder="Variant Description"
        value={v.description}
        onChange={(e) => handleVariantChange(vIdx, 'description', e.target.value)}
      />

      {/* VARIANT SPECS */}
      <div className="border p-3 rounded mb-3 bg-gray-50">
        <h4 className="font-bold mb-2">Variant Specs</h4>
        {v.specs.map((s, sIdx) => (
          <div key={sIdx} className="grid grid-cols-3 gap-2 mb-2">
            <input
              className="p-2 border rounded"
              placeholder="Key: Material"
              value={s.key}
              onChange={(e) => handleVariantSpecChange(vIdx, sIdx, 'key', e.target.value)}
            />
            <input
              className="p-2 border rounded"
              placeholder="Value: Silicone"
              value={s.value}
              onChange={(e) => handleVariantSpecChange(vIdx, sIdx, 'value', e.target.value)}
            />
            <button type="button" onClick={() => removeVariantSpec(vIdx, sIdx)} className="bg-red-500 text-white px-2 rounded">X</button>
          </div>
        ))}
        <button type="button" onClick={() => addVariantSpec(vIdx)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">+ Add Spec</button>
      </div>

      <h3 className="font-semibold mb-2">Options</h3>
      {v.options.map((opt, oIdx) => (
        <div key={oIdx} className="border p-2 rounded mb-2">
          <div className="grid grid-cols-5 gap-2 mb-2">
            <input className="p-2 border rounded" placeholder="Name" value={opt.name} onChange={(e)=>updateOption(vIdx,oIdx,'name',e.target.value)} />
            <input className="p-2 border rounded" placeholder="Hex #000" value={opt.hexCode} onChange={(e)=>updateOption(vIdx,oIdx,'hexCode',e.target.value)} />
            <input className="p-2 border rounded" placeholder="SKU" value={opt.sku} onChange={(e)=>updateOption(vIdx,oIdx,'sku',e.target.value)} />
            <input type="number" className="p-2 border rounded" placeholder="Price" value={opt.price} onChange={(e)=>updateOption(vIdx,oIdx,'price',e.target.value)} />
            <button type="button" onClick={()=>removeOption(vIdx,oIdx)} className="bg-red-500 text-white px-2 rounded">X</button>
          </div>
          <input type="number" className="p-2 border rounded w-32 mb-2" placeholder="Stock" value={opt.countInStock} onChange={(e)=>updateOption(vIdx,oIdx,'countInStock',e.target.value)} />

          {/* IMAGE UPLOAD PER OPTION */}
          {/* IMAGE UPLOAD PER OPTION */}
{/* IMAGE UPLOAD PER OPTION */}
<label className="font-semibold text-sm mb-1">Images *</label>
<div className='mb-3'>
  <label className='inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 text-sm'>
    <FaPlus />
    <span>{uploading? 'Preparing...' : 'Select Images'}</span> {/* changed loadingUpload to uploading */}
    <input 
      type='file' 
      multiple 
      accept="image/*" 
      onChange={(e) => uploadImageHandler(e, vIdx, oIdx)}
      className='hidden' 
      disabled={uploading} 
    />
  </label>
</div>
{/* REMOVED: uploading text because upload happens on submit */}

<div className='flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg min-h-20'>
  <DragDropContext onDragEnd={(result) => onDragEnd(result, vIdx, oIdx)}>
    <Droppable droppableId={`dnd-${vIdx}-${oIdx}`} direction="horizontal">
      {(provided) => (
        <div className="flex gap-2 flex-wrap w-full" {...provided.droppableProps} ref={provided.innerRef}>
          
          {/* KEY: Only map files now, not images */}
          {[...(opt.files || [])].map((img, imgIndex) => (
            <Draggable key={img.name + imgIndex} draggableId={img.name + imgIndex} index={imgIndex}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`relative w-16 h-16 group ${snapshot.isDragging? 'ring-2 ring-blue-500' : ''}`}
                >
                  {/* DRAG HANDLE */}
                  <div {...provided.dragHandleProps} className='absolute top-0 left-0 bg-black/60 p-1 rounded cursor-grab'>
                    <HiOutlineArrowsUpDown className="text-white text-[10px]" />
                  </div>

                  {/* KEY: Use URL.createObjectURL for File objects */}
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt="" 
                    className="w-full h-full object-cover rounded border"
                  />
                  
                  {/* DELETE BUTTON */}
                  <button 
                    type="button"
                    onClick={() => removeImageHandler(vIdx, oIdx, imgIndex)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] opacity-0 group-hover:opacity-100"
                  >X</button>
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
 
 
        </div>
      ))}
      <button type="button" onClick={()=>addOption(vIdx)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">+ Add Option</button>
    </div>
  ))}
  
  {/* ADD VARIANT BUTTON */}
  <button type="button" onClick={addVariant} className="bg-green-600 text-white px-4 py-2 rounded">
    + Add Variant
  </button>
</div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Create Accessory</button>
      </form>
    </div>
  );
};

export default AccessoryCreateScreen;