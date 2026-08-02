import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';
import {
  useUpdateAccessoryMutation,
  useGetAccessoryDetailsQuery,
  useUploadAccessoryImageMutation,
} from '../../slices/accessoriesApiSlice';
import { useGetProductsForDropdownQuery } from '../../slices/productsApiSlice';

const AccessoryEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: accessory, isLoading, error } = useGetAccessoryDetailsQuery(id);
  const { data: productOptions, isLoading: loadingProducts } = useGetProductsForDropdownQuery('');
  const [updateAccessory, { isLoading: loadingUpdate }] = useUpdateAccessoryMutation();
  const [uploadAccessoryImage, { isLoading: loadingUpload }] = useUploadAccessoryImageMutation();

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500';
  const cardClass = 'bg-white p-6 rounded-xl shadow-sm border-gray-100';
  const btnPrimary = 'w-full mt-6 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50';

  // SAME STATE AS CREATE
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState(0);
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [specsKey, setSpecsKey] = useState('');
  const [specsValue, setSpecsValue] = useState('');
  const [specs, setSpecs] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);

  // IMAGE STATES - NEW: track by index not url
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]); // [{url, isNew, publicId}]
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [uploading, setUploading] = useState(false);

  const options = productOptions?.map(p => ({
    value: p._id,
    label: `${p.brand} ${p.name}`
  })) || [];

  // FIX 1: Load basic fields first
  useEffect(() => {
    if (accessory) {
      setName(accessory.name || '');
      setBrand(accessory.brand || '');
      setCategory(accessory.category || ''); // FIX 3: category
      setType(accessory.type || '');
      setPrice(accessory.price || 0);
      setCountInStock(accessory.countInStock || 0);
      setDescription(accessory.description || '');
      setKeywords(accessory.keywords?.join(', ') || '');
      setSpecs(accessory.specs || {});

      // Load images with publicId
      const loadedPreviews = (accessory.images || []).map(img => ({
        url: img.url,
        isNew: false,
        publicId: img.imagePublicId
      }));
      setPreviews(loadedPreviews);
    }
  }, [accessory]);

  // FIX 2: Load compatibleWith after options load
  useEffect(() => {
    if (accessory && options.length > 0) {
      const selected = options.filter(opt => accessory.compatibleWith?.includes(opt.value));
      setSelectedProducts(selected);
    }
  }, [accessory, options]);

  // FIX 3: SPECS - use timestamp as key so delete works
  const addSpecHandler = () => {
    if (specsKey.trim() && specsValue.trim()) {
      setSpecs(prev => ({...prev, [specsKey.trim()]: specsValue.trim() }));
      setSpecsKey('');
      setSpecsValue('');
    } else {
      toast.error('Enter both key and value');
    }
  };

  const removeSpecHandler = (key) => {
    setSpecs(prev => {
      const newSpecs = {...prev};
      delete newSpecs[key];
      return newSpecs;
    });
  };

  // DRAG N DROP
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    setFiles((prev) => [...prev,...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
      publicId: null
    }));
    setPreviews((prev) => [...prev,...newPreviews]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;
    setFiles((prev) => [...prev,...droppedFiles]);
    const newPreviews = droppedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
      publicId: null
    }));
    setPreviews((prev) => [...prev,...newPreviews]);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const removeImageHandler = (index) => {
    const removed = previews[index];
    if (!removed.isNew && removed.publicId) {
      setRemovedPublicIds(prev => [...prev, removed.publicId]); // for cloudinary delete
    }
    URL.revokeObjectURL(removed.url);
    setFiles(files.filter((_, i) => i!== index - (previews.filter((p, idx) => idx < index &&!p.isNew).length))); // messy, better way below
    setPreviews(previews.filter((_, i) => i!== index));
    toast.success("Image removed")
  };

  // BETTER: rebuild files from previews on submit
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = structuredClone(previews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPreviews(items);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!type) { toast.error('Please select accessory type'); return; }
    if (previews.length === 0) { toast.error('Please upload at least 1 image'); return; }
    if (selectedProducts.length === 0) { toast.error('Please select at least 1 compatible device'); return; }

    setUploading(true);

    // FIX 4: Rebuild files array from previews order
    const newFilesToUpload = [];
    const finalImages = [];

    for(let i = 0; i < previews.length; i++) {
      const p = previews[i];
      if(p.isNew) {
        // find file by url - we need to map it
        const fileIndex = previews.filter((x, idx) => idx <= i && x.isNew).length - 1;
        newFilesToUpload.push(files[fileIndex]);
        finalImages.push({ placeholder: true }); // temp
      } else {
        finalImages.push({ url: p.url, imagePublicId: p.publicId });
      }
    }

    // UPLOAD NEW IMAGES
    if (newFilesToUpload.length > 0) {
      const formData = new FormData();
      newFilesToUpload.forEach((file) => formData.append('images', file));
      const uploadedImages = await uploadAccessoryImage(formData).unwrap();
      
      // replace placeholders with real uploaded data
      let uploadIdx = 0;
      for(let i = 0; i < finalImages.length; i++) {
        if(finalImages[i].placeholder) {
          finalImages[i] = uploadedImages[uploadIdx];
          uploadIdx++;
        }
      }
    }
    setUploading(false);

    try {
      const payload = {
        _id: id,
        name,
        brand,
        category,
        type,
        price: Number(price),
        countInStock: Number(countInStock),
        description,
        specs, // Object - now delete/add works
        compatibleWith: selectedProducts.map(s => s.value),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        images: finalImages,
        image: finalImages[0]?.url || '',
        removedPublicIds,
      };

      await updateAccessory(payload).unwrap();
      toast.success('Accessory Updated');
      navigate('/admin/accessorylist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <div className='text-center py-4'>Loading...</div>;
  if (error) return <div className='text-red-500 p-5'>{error?.data?.message || error.error}</div>;

  return (
    <div className='max-w-5xl mx-auto p-5'>
      <Link to='/admin/accessorylist' className='text-blue-600 hover:underline mb-3 inline-block text-sm'>Go Back</Link>
      <h1 className='text-2xl font-bold mb-5 text-gray-800'>Edit Accessory V21.22.7.29</h1>
      {(loadingUpdate || uploading) && <div className='text-center py-4'>Processing...</div>}
      {loadingProducts && <div className='text-center py-4'>Loading Products...</div>}

      <form onSubmit={submitHandler} className='space-y-5'>
        
        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name *</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Brand *</label><input type="text" value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Category *</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Type *</label><input type="text" value={type} onChange={e => setType(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Price *</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Count In Stock *</label><input type="number" value={countInStock} onChange={e => setCountInStock(e.target.value)} className={inputClass} /></div>
            <div className='md:col-span-2'><label className={labelClass}>Keywords</label><input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="comma, separated" className={inputClass} /></div>
            <div className='md:col-span-2'>
              <label className={labelClass}>Compatible Products *</label>
              <Select isMulti options={options} value={selectedProducts} onChange={setSelectedProducts} />
            </div>
            <div className='md:col-span-2'><label className={labelClass}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className={inputClass}></textarea></div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Specifications</h2>
          <div className="flex gap-2 mb-3">
            <input placeholder="Key e.g Material" value={specsKey} onChange={e => setSpecsKey(e.target.value)} className={inputClass}/>
            <input placeholder="Value e.g TPU" value={specsValue} onChange={e => setSpecsValue(e.target.value)} className={inputClass}/>
            <button type="button" onClick={addSpecHandler} className='px-4 bg-indigo-600 text-white rounded-md'><FaPlus/></button>
          </div>
          {Object.entries(specs).map(([key, value]) => ( // FIX: use entries
            <div key={key} className='flex justify-between bg-gray-100 p-2 rounded-md mb-1'>
              <span><b>{key}</b>: {value}</span>
              <button type="button" onClick={() => removeSpecHandler(key)}><FaTrash size={12}/></button>
            </div>
          ))}
        </div>

        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2'>Images</h2>
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 mb-4'
          >
            <p className='text-gray-500'>Drag & drop images here, or</p>
            <input type='file' multiple onChange={handleFileChange} className='mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700' disabled={loadingUpload}/>
            {loadingUpload && <div className='text-sm mt-2'>Uploading...</div>}
          </div>

          {previews.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="edit-accessory-images" direction="horizontal">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className='grid grid-cols-3 md:grid-cols-6 gap-3'>
                    {previews.map((p, index) => (
                      <Draggable key={p.url + index} draggableId={`img-${index}`} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className='relative group'>
                            <img src={p.url} alt='preview' className='w-full h-24 object-cover rounded-md border' />
                            {p.isNew && <span className='absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded'>NEW</span>}
                            <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-white p-1 rounded cursor-grab shadow'><HiOutlineArrowsUpDown size={14} /></div>
                            <button type='button' onClick={() => removeImageHandler(index)} className='absolute bottom-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100'><FaTrash size={10} /></button>
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

        <button type='submit' className={btnPrimary} disabled={loadingUpdate || uploading}>
          {loadingUpdate || uploading? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default AccessoryEditScreen;