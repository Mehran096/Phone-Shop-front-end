import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { HiOutlineArrowsUpDown } from 'react-icons/hi2';
import {
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
  //useDeleteCloudinaryImagesBatchMutation, 
} from '../../slices/productsApiSlice';
import api from '../../utils/axios';

const ProductEditScreen = () => {
  //const { productId } = useParams();
  const { id } = useParams(); // <-- V9.8 FIX: Changed from `id: productId` to just `id`
  const productId = id; // <-- ADD THIS LINE
  const navigate = useNavigate();

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();
  //const [deleteCloudinaryImagesBatch] = useDeleteCloudinaryImagesBatchMutation();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');

  const [keywords, setKeywords] = useState('');
  const [accessories, setAccessories] = useState('');
  const [variants, setVariants] = useState([{
    storage: '',
    specs: {},
    specsJson: '',
    colors: [{ name: '', hexCode: '', images: [], price: '', countInStock: '', sku: '' }]
  }]);
  const [uploadingMap, setUploadingMap] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // V9.69 KEY: Preload V9.47 nested data
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setCategory(product.category || '');
      setKeywords(product.keywords?.join(', ') || '');
      setAccessories(product.accessories?.join(', ') || '');
      setVariants(product.variants?.map(v => ({
        storage: v.storage || '',
        description: v.description || '',
        specs: v.specs || {},
        specsJson: JSON.stringify(v.specs || {}, null, 2),
        colors: v.colors?.map(c => ({
          name: c.name || '',
          hexCode: c.hexCode || '',
          images: (c.images || []).map(img =>
            typeof img === 'string'
              ? { url: img, imagePublicId: '' }
              : img
          ),
          newFiles: [],
          price: c.price || '',
          countInStock: c.countInStock || '',
          sku: c.sku || '',
        })) || [{ name: '', hexCode: '', images: [], price: '', countInStock: '', sku: '' }]
      })) || [{
        storage: '',
        description: '',
        specs: {},
        specsJson: '',
        colors: [{ name: '', hexCode: '', images: [], price: '', countInStock: '', sku: '' }]
      }])
    }
  }, [product]);

  const addVariantHandler = () => setVariants([...variants, {
    storage: '',
    description: '',
    specs: {},
    specsJson: '',
    colors: [{ name: '', hexCode: '', images: [], newFiles: [], price: '', countInStock: '', sku: '' }]
  }]);
  const removeVariantHandler = (vIndex) => setVariants(variants.filter((_, i) => i !== vIndex));
  const updateVariant = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, [field]: value } : item));
  // const updateVariantSpec = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex ?
  //   { ...item, specs: { ...item.specs, [field]: value } } : item));
  const addColorHandler = (vIndex) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, colors: [...item.colors, { name: '', hexCode: '', images: [], newFiles: [], price: '', countInStock: '', sku: '' }] } : item));
  const removeColorHandler = (vIndex, cIndex) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, colors: item.colors.filter((_, ci) => ci !== cIndex) } : item));
  const updateColor = (vIndex, cIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex ?
    { ...item, colors: item.colors.map((c, ci) => ci === cIndex ? { ...c, [field]: value } : c) } : item));

  // V38.37 KEY: DON'T UPLOAD YET, JUST SAVE FILES TO STATE
  const uploadFileHandler = async (vIndex, cIndex, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const key = `v${vIndex}-c${cIndex}`
    setUploadingMap(prev => ({ ...prev, [key]: true }))

    try {
      const newFiles = []
      for (const file of files) {
        const preview = URL.createObjectURL(file) // for instant show
        newFiles.push({ id: Date.now() + Math.random(), file, preview })
      }

      setVariants(prev => prev.map((v, vi) => {
        if (vi !== vIndex) return v
        return {
          ...v,
          colors: v.colors.map((c, ci) => {
            if (ci !== cIndex) return c
            return {
              ...c,
              newFiles: [...c.newFiles, ...newFiles] // ONLY push to newFiles
            }
          })
        }
      }))

    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploadingMap(prev => ({ ...prev, [key]: false }))
      e.target.value = null // reset input
    }
  }

  const getPublicIdFromUrl = (url) => {
    // https://res.cloudinary.com/little-success/image/upload/v1783163628/products/17831636175.jpg
    const parts = url.split('/');
    const folder = parts[parts.length - 2]; // products
    const filename = parts[parts.length - 1].split('.')[0]; // 17831636175
    return `${folder}/${filename}`; // products/17831636175
  };

  //remove image handler
  // V38.32 KEY: UI ONLY DELETE - SAME AS CREATE SCREEN
  // V38.34 KEY: IMMUTABLE DELETE - NO MUTATION
  const removeImageHandler = (vIndex, cIndex, imgIndex) => {
    const img = variants[vIndex].colors[cIndex].images[imgIndex];

    // V38.56 KEY: If no publicId, extract from URL for old images
    const publicId = img.imagePublicId || getPublicIdFromUrl(img.url);

    if (publicId) {
      //console.log('QUEUED FOR DELETE:', publicId);
      setImagesToDelete(prev => [...prev, publicId]);
    }

    setVariants(prev => prev.map((v, i) => i === vIndex ? {
      ...v,
      colors: v.colors.map((c, j) => j === cIndex ? {
        ...c,
        images: c.images.filter((_, k) => k !== imgIndex),
        newFiles: c.newFiles?.filter((_, k) => k !== imgIndex)
      } : c)
    } : v));
  };

  // V9.74 KEY: ADD SAFETY || []
  //Drag and drop image handler
  // V9.75 KEY: ONLY USE images ARRAY
  const onDragEnd = (result, vIndex, cIndex) => {
    if (!result.destination) return;

    setVariants(prev => {
      const newVariants = structuredClone(prev);
      const color = newVariants[vIndex].colors[cIndex];

      // SAFETY: ensure images array exists
      color.images = color.images || [];

      const imgs = color.images;
      const [reorderedImg] = imgs.splice(result.source.index, 1);
      imgs.splice(result.destination.index, 0, reorderedImg);

      return newVariants;
    });
  };

  //submit image handler 
  // V38.38 KEY: UPLOAD TO CLOUDINARY ONLY ON UPDATE CLICK
  // V38.40 KEY: USE RTK loadingUpdate, NO setLoadingUpdate
  const submitHandler = async (e) => {
    e.preventDefault();
    //console.log('V38.71 BUTTON CLICKED');

    try {
      //console.log('V38.72 STEP 1: Start');

      const variantsToUpload = variants.map(v => ({ ...v }));
      //console.log('V38.72 STEP 2: Copied variants');

      // STEP 1: UPLOAD ALL NEW FILES FIRST
      for (let vIndex = 0; vIndex < variants.length; vIndex++) {
        for (let cIndex = 0; cIndex < variants[vIndex].colors.length; cIndex++) {
          const color = variants[vIndex].colors[cIndex];
          //console.log('V38.72 STEP 3: Checking color', cIndex);

          if (color.newFiles?.length > 0) {
            //console.log('V38.72 STEP 4: Uploading files');
            const formData = new FormData();
            color.newFiles.forEach(f => formData.append('images', f.file));

            const data = await uploadProductImage(formData).unwrap();
            //console.log('V38.72 STEP 5: Upload success', data);

            const uploaded = data.map(u => ({
              url: u.url,
              imagePublicId: u.public_id,
              isLocal: false
            }));

            variantsToUpload[vIndex].colors[cIndex].images = [
              ...variantsToUpload[vIndex].colors[cIndex].images.filter(img => !img.isLocal),
              ...uploaded
            ];
            delete variantsToUpload[vIndex].colors[cIndex].newFiles;
          }
        }
      }

      //console.log('V38.72 STEP 6: Before setVariants');
      setVariants(variantsToUpload);

      //console.log('V38.72 STEP 7: Before updateProduct');
      const { data: updatedProduct } = await updateProduct({
        _id: productId,
        variants: variantsToUpload,
        imagesToDelete,
        name,
        brand,
        category,
        //accessories,
        keywords: typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : keywords,
        // metaTitle: metaTitle || '',
        // metaDescription: metaDescription || ''
      }).unwrap();

      //console.log('V38.72 STEP 8: Success');
      toast.success('Product Updated');
      refetch();
      navigate('/admin/productlist');

    } catch (err) {
      console.log('V38.72 CATCH ERROR:', err); // V38.72 KEY
      toast.error(err?.data?.message || err.error || err.message);
    }
  };

  // accessories: accessories.split(',').map(a => a.trim()).filter(Boolean),
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const inputClass = 'w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none';
  const cardClass = 'bg-white p-6 rounded-xl shadow-sm border-gray-100';
  const btnSecondary = 'px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2';
  const btnPrimary = 'w-full mt-6 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors';

  if (isLoading) return <div className='text-center py-4'>Loading...</div>;
  if (error) return <div className='text-red-500 p-5'>{error?.data?.message || error.error}</div>;

  return (
    <div className='max-w-5xl mx-auto p-5'>
      <Link to='/admin/productlist' className='text-blue-600 hover:underline mb-3 inline-block text-sm'> Go Back</Link>
      <h1 className='text-2xl font-bold mb-5 text-gray-800'>Edit Product V9.69</h1>
      {loadingUpdate && <div className='text-center py-4'>Updating...</div>}
      <form onSubmit={submitHandler} className='space-y-5'>
        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2 text-gray-800'>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name *</label><input type='text' value={name} onChange={e => setName(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Brand *</label><input type='text' value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Category *</label><input type='text' value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Keywords</label><input type='text' placeholder='comma, separated' value={keywords} onChange={e => setKeywords(e.target.value)} className={inputClass} /></div>
            {/* <div className='md:col-span-2'><label className={labelClass}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className={inputClass} rows={3}/></div>
            <div className='md:col-span-2'><label className={labelClass}>Accessories</label><input type='text' placeholder='Box, Charger' value={accessories} onChange={e => setAccessories(e.target.value)} className={inputClass} /></div> */}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className='text-lg font-semibold mb-4 border-b pb-2 text-gray-800'>Variants V9.47</h2>
          {variants.map((variant, vIndex) => (
            <div key={vIndex} className='border border-gray-200 p-5 mb-4 rounded-lg bg-gray-50'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='font-semibold text-gray-800'>Variant {vIndex + 1}</h3>
                {variants.length > 1 && <button type='button' onClick={() => removeVariantHandler(vIndex)} className='text-red-500 text-sm hover:underline'>Remove</button>}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
                <div><label className={labelClass}>Storage *</label><input type='text' placeholder='256GB' value={variant.storage || ''} onChange={e => updateVariant(vIndex, 'storage', e.target.value)} className={inputClass} /></div>
                <div className='md:col-span-2'><label className={labelClass}>Variant Description</label><input type='text' placeholder='256GB Variant text' value={variant.description || ''} onChange={e => updateVariant(vIndex, 'description', e.target.value)} className={inputClass} /></div>
              </div>
              <h4 className='font-semibold mt-2 mb-3 text-gray-700'>Specs for {variant.storage || 'Variant'}</h4>
              <div className='mb-4'>
                <label className={labelClass}>Specs JSON *</label>
                <textarea
                  rows={10}
                  placeholder={`{\n  "Display": "6.88 inch HD+ 120Hz",\n  "RAM": "3GB",\n  "Storage": "64GB eMMC 5.1"\n}`}
                  value={variant.specsJson}
                  onChange={(e) => {
                    const specsJson = e.target.value;
                    let specs = {};
                    try { specs = JSON.parse(specsJson) } catch { }
                    updateVariant(vIndex, 'specsJson', specsJson);
                    updateVariant(vIndex, 'specs', specs);
                  }}
                  className={inputClass + ' font-mono text-sm'}
                />
                <p className='text-xs text-gray-500 mt-1'>Edit JSON here. Unlimited specs. Auto saves</p>
              </div>

              <h4 className='font-semibold mt-4 mb-3 text-gray-700'>Colors / SKUs</h4>
              {variant.colors.map((color, cIndex) => (
                <div key={cIndex} className="border-l-4 border-blue-500 pl-4 mb-4 bg-white p-4 rounded-r-lg shadow-sm">

                  {/* COLOR HEADER */}
                  <div className='flex justify-between items-center mb-2'>
                    <label className={labelClass}>Color {cIndex + 1}</label>
                    {variant.colors.length > 1 &&
                      <button
                        type='button'
                        onClick={() => removeColorHandler(vIndex, cIndex)}
                        className='text-red-500 text-sm hover:underline'
                      >
                        Remove Color
                      </button>
                    }
                  </div>

                  {/* COLOR NAME + hexCode */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
                    <div>
                      <label className={labelClass}>Color Name *</label>
                      <input
                        type='text'
                        placeholder='Black Titanium'
                        value={color.name}
                        onChange={e => updateColor(vIndex, cIndex, 'name', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Hex Code</label>
                      <input
                        type="text"
                        placeholder="#C8E6C9"
                        value={color.hexCode}
                        onChange={(e) =>
                          updateColor(vIndex, cIndex, 'hexCode', e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                     

                  </div>

                  {/* PRICE + STOCK */}
                  <div className='grid grid-cols-2 gap-4 mb-3'>
                    <div>
                      <label className={labelClass}>Price *</label>
                      <input
                        type='number'
                        value={color.price}
                        onChange={e => updateColor(vIndex, cIndex, 'price', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Stock *</label>
                      <input
                        type='number'
                        value={color.countInStock}
                        onChange={e => updateColor(vIndex, cIndex, 'countInStock', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  {/* sku */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
                    
                    <div>
                      <label className={labelClass}>SKU</label>
                      <input
                        type='text'
                        placeholder='A17-256-BLK'
                        value={color.sku}
                        onChange={e => updateColor(vIndex, cIndex, 'sku', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                  </div>

                  {/* IMAGES SECTION */}
                  <label className={labelClass}>Images *</label>

                  {/* UPLOAD BUTTON */}
                  <div className='mb-3'>
                    <label className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md border-2 border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium'>
                      <FaPlus />
                      <span>
                        {uploadingMap[`v${vIndex}-c${cIndex}`] ? 'Uploading...' : 'Select Images'}
                      </span>
                      <input
                        type='file'
                        multiple
                        accept="image/*"
                        onChange={(e) => uploadFileHandler(vIndex, cIndex, e)}
                        className='hidden'
                        disabled={uploadingMap[`v${vIndex}-c${cIndex}`]}
                      />
                    </label>
                  </div>

                  {uploadingMap[`v${vIndex}-c${cIndex}`] && <div className='text-blue-600 text-sm mb-2 animate-pulse'>Uploading...</div>}

                  {/* SINGLE WRAPPER: DB + NEW TOGETHER */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Drag to reorder. Green border = New</p>
                    <div className='flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg min-h-24'>

                      <DragDropContext onDragEnd={(result) => onDragEnd(result, vIndex, cIndex)} key={`ddc-${vIndex}-${cIndex}`}>
                        <Droppable droppableId={`dnd-edit-${vIndex}-${cIndex}`} direction="horizontal">
                          {(provided) => (
                            <div className="flex gap-3 flex-wrap w-full" {...provided.droppableProps} ref={provided.innerRef}>

                              {/* 1. EXISTING DB IMAGES - DRAGGABLE */}
                              {color.images?.map((img, imgIndex) => (
                                <Draggable
                                  key={`url-${img.imagePublicId || img}-${imgIndex}`}
                                  draggableId={`url-${img.imagePublicId || img}-${imgIndex}`}
                                  index={imgIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`relative w-20 h-20 lg:w-24 lg:h-24 group ${snapshot.isDragging ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                      <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-black/60 p-1 rounded cursor-grab z-10'>
                                        <HiOutlineArrowsUpDown className="text-white text-xs" />
                                      </div>

                                      <img
                                        src={img.url || img}
                                        alt={`img-${imgIndex}`}
                                        className="w-full h-full object-contain rounded-lg bg-white border-gray-200 p-1 flex-shrink-0 border-2 border-blue-500"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => removeImageHandler(vIndex, cIndex, imgIndex)}
                                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10'
                                      >
                                        X
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {/* 2. NEW UPLOADED IMAGES - NOT DRAGGABLE, INLINE */}
                              {color.newFiles?.map((f) => (
                                <div key={`file-${f.id}`} className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                                  <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded z-10">NEW</div>
                                  <img
                                    src={f.preview}
                                    alt="new"
                                    className="w-full h-full object-contain rounded-lg bg-white border-gray-200 p-1 border-2 border-green-500"
                                  />
                                </div>
                              ))}

                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                    </div>
                  </div>
                  <button type='button' onClick={() => addColorHandler(vIndex)} className={btnSecondary + ' mt-3'}>
                    <FaPlus size={12} /> Add Color</button>
                </div>
              ))}


              <button type='button' onClick={addVariantHandler} className={btnSecondary + ' mt-2'}><FaPlus size={12} /> Add Variant</button>
            </div>
          ))}
        </div>
        <button
          type='submit'
          disabled={loadingUpdate || loadingUpload} // V38.74 KEY: disable on both
          className={` ${btnPrimary} w-full flex items-center justify-center gap-2 ${loadingUpdate || loadingUpload ? 'opacity-60 cursor-not-allowed' : ''} `} // V38.74 KEY
        >
          {loadingUpdate || loadingUpload ? ( // V38.74 KEY
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading & Updating...
            </>
          ) : 'Update Product'}
        </button>
      </form>
    </div>
  );
};
export default ProductEditScreen;