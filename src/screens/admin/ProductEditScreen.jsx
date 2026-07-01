import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
import { useUpdateProductMutation, useGetProductDetailsQuery, useUploadProductImageMutation } from '../../slices/productsApiSlice';
import api from '../../utils/axios';

const ProductEditScreen = () => {
  //const { productId } = useParams();
  const { id } = useParams(); // <-- V9.8 FIX: Changed from `id: productId` to just `id`
    const productId = id; // <-- ADD THIS LINE
  const navigate = useNavigate();

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [accessories, setAccessories] = useState('');
  const [variants, setVariants] = useState([{ 
    storage: '', 
    description: '',
    specs: { ram: '', display: '', battery: '', camera: '' },
    colors: [{ name: '', images: [], imagePublicIds: [], price: '', countInStock: '', sku: '' }] 
  }]);
  const [uploadingMap, setUploadingMap] = useState({});

  // V9.69 KEY: Preload V9.47 nested data
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setCategory(product.category || '');
      setDescription(product.description || '');
      setKeywords(product.keywords?.join(', ') || '');
      setAccessories(product.accessories?.join(', ') || '');
      setVariants(product.variants?.map(v => ({
        storage: v.storage || '',
        description: v.description || '',
        specs: {
          ram: v.specs?.ram || '',
          display: v.specs?.display || '',
          battery: v.specs?.battery || '',
          camera: v.specs?.camera || '',
        },
        colors: v.colors?.map(c => ({
          name: c.name || '',
          images: c.images || [],
          imagePublicIds: c.imagePublicIds || [],
          price: c.price || '',
          countInStock: c.countInStock || '',
          sku: c.sku || '',
        })) || [{ name: '', images: [], imagePublicIds: [], price: '', countInStock: '', sku: '' }]
      })) || [{ storage: '', description: '', specs: { ram: '', display: '', battery: '', camera: '' }, colors: [{ name: '', images: [], imagePublicIds: [], price: '', countInStock: '', sku: '' }] }]);
    }
  }, [product]);

  const addVariantHandler = () => setVariants([...variants, { storage: '', description: '', specs: { ram: '', display: '', battery: '', camera: '' }, colors: [{ name: '', images: [], imagePublicIds: [], price: '', countInStock: '', sku: '' }] }]);
  const removeVariantHandler = (vIndex) => setVariants(variants.filter((_, i) => i!== vIndex));
  const updateVariant = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex? {...item, [field]: value} : item));
  const updateVariantSpec = (vIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex? {...item, specs: {...item.specs, [field]: value}} : item));
  const addColorHandler = (vIndex) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: [...item.colors, { name: '', images: [], imagePublicIds: [], price: '', countInStock: '', sku: '' }]} : item));
  const removeColorHandler = (vIndex, cIndex) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: item.colors.filter((_, ci) => ci!== cIndex)} : item));
  const updateColor = (vIndex, cIndex, field, value) => setVariants(v => v.map((item, i) => i === vIndex? {...item, colors: item.colors.map((c, ci) => ci === cIndex? {...c, [field]: value} : c)} : item));

  const uploadFileHandler = async (vIndex, cIndex, e) => {
    const key = `v${vIndex}-c${cIndex}`;
    setUploadingMap(prev => ({...prev, [key]: true}));
    const files = Array.from(e.target.files);
    if (!files.length) { setUploadingMap(prev => ({...prev, [key]: false})); return; }
    const uploaded = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      try { 
        const { url, public_id } = await uploadProductImage(formData).unwrap(); 
        uploaded.push({ url, imagePublicId: public_id });
      } 
      catch (err) { toast.error(err?.data?.message || err.error); }
    }
    if(uploaded.length){
      setVariants(prev => prev.map((v, i) => i === vIndex? {...v, colors: v.colors.map((c, j) => j === cIndex? {...c, images: [...c.images,...uploaded], imagePublicIds: [...c.imagePublicIds,...uploaded.map(u => u.imagePublicId)]} : c)} : v));
      toast.success(`${uploaded.length} Image(s) added`);
    }
    setUploadingMap(prev => ({...prev, [key]: false}));
    e.target.value = '';
  };

const removeImageHandler = async (vIndex, cIndex, imgIndex) => {
  const color = variants[vIndex]?.colors[cIndex]; // V31.93? = No crash
  const raw_public_id = color?.imagePublicIds?.[imgIndex]; // V31.93? = No crash

  if(!raw_public_id) {
    toast.error('Old image: Cannot delete from Cloudinary. Use Update Product to save.');
    return;
  }

  // V31.86 KEY: Extract clean publicId
  let publicId = raw_public_id;
  if (publicId.includes('cloudinary.com')) {
    publicId = publicId.split('/upload/')[1] || publicId;
  }
  publicId = publicId.replace(/^\d+\//, '');
  publicId = publicId.replace(/\.[^.]+$/, "");
  console.log('V31.99 SENDING:', publicId);

  try {
    // V31.81 KEY: Backend first - Cloudinary only now
    await api.delete('/upload', { data: { publicId, productId: product._id, vIndex } });

    // V31.99 KEY: BULLETPROOF UI UPDATE - Delete from BOTH arrays
    setVariants(prev => { // V31.93 Use functional update = no stale state
      const newVariants = structuredClone(prev); // V31.93 Deep clone = no mutation bug

      const targetColor = newVariants[vIndex]?.colors[cIndex];
      if (!targetColor?.imagePublicIds ||!targetColor?.images) {
        console.log('V31.99 SKIP UI: arrays missing');
        return prev; // V31.93 Don't crash
      }

      targetColor.imagePublicIds.splice(imgIndex, 1); // V31.98 Delete publicId
      targetColor.images.splice(imgIndex, 1); // V31.98 KEY: Delete URL too
      return newVariants;
    });

    toast.success('Image removed'); // V31.93 This will show now

  } catch(err) {
    console.log('V31.99 CATCH:', err);
    toast.error(err?.data?.message || err.message || 'Delete failed');
  }
}

 const submitHandler = async (e) => {
    e.preventDefault();
    const payload = {
      id: productId,
      name, brand, category, description,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      // accessories: accessories.split(',').map(a => a.trim()).filter(Boolean),
      variants: variants
    .filter(v => v.storage && v.colors.some(c => c.name && c.price!== ''))
    .map(v => ({ 
          storage: v.storage, 
          description: v.description,
          specs: v.specs,
          colors: v.colors
        .filter(c => c.name && c.price!== '' && c.images.length > 0)
        .map(c => ({ 
              name: c.name, 
              images: c.images,
              imagePublicIds: c.imagePublicIds,
              price: Number(c.price),
              countInStock: Number(c.countInStock),
              sku: c.sku 
            })) 
        })),
    };
    try { 
      await updateProduct(payload).unwrap(); 
      toast.success('Product Updated'); 
      refetch();
      navigate('/admin/productlist'); 
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };


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
            <div><label className={labelClass}>Name *</label><input type='text' value={name} onChange={e => setName(e.target.value)} className={inputClass} required/></div>
            <div><label className={labelClass}>Brand *</label><input type='text' value={brand} onChange={e => setBrand(e.target.value)} className={inputClass} required/></div>
            <div><label className={labelClass}>Category *</label><input type='text' value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required/></div>
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
                <h3 className='font-semibold text-gray-800'>Variant {vIndex+1}</h3>
                {variants.length > 1 && <button type='button' onClick={() => removeVariantHandler(vIndex)} className='text-red-500 text-sm hover:underline'>Remove</button>}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
                <div><label className={labelClass}>Storage *</label><input type='text' placeholder='256GB' value={variant.storage} onChange={e => updateVariant(vIndex, 'storage', e.target.value)} className={inputClass} /></div>
                <div className='md:col-span-2'><label className={labelClass}>Variant Description</label><input type='text' placeholder='256GB Variant text' value={variant.description} onChange={e => updateVariant(vIndex, 'description', e.target.value)} className={inputClass} /></div>
              </div>
              <h4 className='font-semibold mt-2 mb-3 text-gray-700'>Specs for {variant.storage || 'Variant'}</h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                <div><label className={labelClass}>RAM</label><input type='text' placeholder='8GB' value={variant.specs.ram} onChange={e => updateVariantSpec(vIndex, 'ram', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Display</label><input type='text' placeholder='6.7 AMOLED' value={variant.specs.display} onChange={e => updateVariantSpec(vIndex, 'display', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Battery</label><input type='text' placeholder='5000mAh' value={variant.specs.battery} onChange={e => updateVariantSpec(vIndex, 'battery', e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Camera</label><input type='text' placeholder='50MP' value={variant.specs.camera} onChange={e => updateVariantSpec(vIndex, 'camera', e.target.value)} className={inputClass} /></div>
              </div>

              <h4 className='font-semibold mt-4 mb-3 text-gray-700'>Colors / SKUs</h4>
              {variant.colors.map((color, cIndex) => (
                <div key={cIndex} className="border-l-4 border-blue-500 pl-4 mb-4 bg-white p-4 rounded-r-lg shadow-sm">
                  <div className='flex justify-between items-center mb-2'>
                    <label className={labelClass}>Color {cIndex+1}</label>
                    {variant.colors.length > 1 && <button type='button' onClick={() => removeColorHandler(vIndex, cIndex)} className='text-red-500 text-sm hover:underline'>Remove Color</button>}
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-2'>
                    <div><label className={labelClass}>Color Name *</label><input type='text' placeholder='Black Titanium' value={color.name} onChange={e => updateColor(vIndex, cIndex, 'name', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>SKU</label><input type='text' placeholder='A17-256-BLK' value={color.sku} onChange={e => updateColor(vIndex, cIndex, 'sku', e.target.value)} className={inputClass} /></div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 mb-3'>
                    <div><label className={labelClass}>Price *</label><input type='number' value={color.price} onChange={e => updateColor(vIndex, cIndex, 'price', e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Stock *</label><input type='number' value={color.countInStock} onChange={e => updateColor(vIndex, cIndex, 'countInStock', e.target.value)} className={inputClass} /></div>
                  </div>
                  
                  <label className={labelClass}>Images *</label>
                  <div className='mb-3'>
                    <label className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium'>
                        <FaPlus />
                        <span>
                          {uploadingMap[`v${vIndex}-c${cIndex}`]? 'Uploading...' : 'Select Images'}
                        </span>
                        <input type='file' multiple accept="image/*" onChange={(e) => uploadFileHandler(vIndex, cIndex, e)} className='hidden' disabled={uploadingMap[`v${vIndex}-c${cIndex}`]}/>
                    </label>
                  </div>
                  {uploadingMap[`v${vIndex}-c${cIndex}`] && <div className='text-blue-600 text-sm mb-2 animate-pulse'>Uploading to Cloudinary...</div>}

                  <div className='flex flex-wrap gap-3 p-3 bg-gray-100 rounded-lg min-h-24'>
                    {color.images.map((img, imgIndex) => (
                      <div key={imgIndex} className='relative w-20 h-20 group'>
                        <img src={img.url} alt={`img-${imgIndex}`} className='w-full h-full rounded-md border object-cover' />
                        <button type="button" onClick={() => removeImageHandler(vIndex, cIndex, imgIndex)} className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity'>X</button>
                      </div>
                    ))}
                  </div>
                  <button type='button' onClick={() => addColorHandler(vIndex)} className={btnSecondary + ' mt-3'}><FaPlus size={12} /> Add Color</button>
                </div>
              ))}
              <button type='button' onClick={addVariantHandler} className={btnSecondary + ' mt-2'}><FaPlus size={12} /> Add Variant</button>
            </div>
          ))}
        </div>
        <button type='submit' disabled={loadingUpdate} className={btnPrimary}>
          Update Product
        </button>
      </form>
    </div>
  );
};
export default ProductEditScreen;