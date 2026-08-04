import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetAccessoryBySlugQuery } from '../slices/accessoriesApiSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaCheck, FaArrowLeft, FaStar } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';

const AccessoryScreen = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');

  const { data: accessory, isLoading, error } = useGetAccessoryBySlugQuery(slug);

  // 1. DEDUPE MODELS BY modelName
  const uniqueModels = useMemo(() => {
    if (!accessory?.variants) return [];
    const map = new Map();
    accessory.variants.forEach(v => {
      if (!map.has(v.modelName)) map.set(v.modelName, v); // keep first one only
    });
    return Array.from(map.values());
  }, [accessory]);

  // Get selected model and color from URL
  const selectedModelName = searchParams.get('model') || uniqueModels[0]?.modelName || '';
  const selectedColorName = searchParams.get('color') || '';

  // 2. Find selected model object
  const selectedModel = useMemo(() => {
    return uniqueModels.find(m => m.modelName === selectedModelName) || uniqueModels[0] || null;
  }, [uniqueModels, selectedModelName]);

  // 3. DEDUPE COLORS BY sku - THIS IS THE KEY FIX
  const availableColors = useMemo(() => {
    if (!selectedModel?.colorVariants) return [];
    const map = new Map();
    selectedModel.colorVariants.forEach(cv => {
      if (!map.has(cv.sku)) map.set(cv.sku, cv); // dedupe by SKU
    });
    return Array.from(map.values());
  }, [selectedModel]);

  // 4. Find selected color object
  const selectedColor = useMemo(() => {
    if (!availableColors.length) return null;
    return availableColors.find(cv => cv.color === selectedColorName) || availableColors[0];
  }, [availableColors, selectedColorName]);

  // Display data comes from selected color
  const displayPrice = Number(selectedColor?.price || 0);
  const displayStock = Number(selectedColor?.countInStock || 0);
  const displaySKU = selectedColor?.sku || '';
  const discount = selectedColor?.discount;

  const finalPrice = useMemo(() => {
    if (!discount?.isActive ||!discount?.value) return displayPrice;
    if (discount.type === 'percentage') return displayPrice * (1 - discount.value / 100);
    if (discount.type === 'fixed') return Math.max(0, displayPrice - discount.value);
    return displayPrice;
  }, [displayPrice, discount]);

  const getImageUrls = (images) => {
    if (!images ||!Array.isArray(images)) return [];
    return images.map(img => typeof img === 'string'? img : img?.url || '').filter(Boolean);
  };

  const displayImages = getImageUrls(selectedColor?.images || []);
  const modelDescription = selectedModel?.description || '';
  const modelSpecs = selectedModel?.specs || [];

  const handleModelChange = (modelName) => {
    setSearchParams({ model: modelName }); // reset color
  };

  const handleColorChange = (colorName) => {
    const params = new URLSearchParams(searchParams);
    params.set('color', colorName);
    setSearchParams(params);
  };

  const displayTitle = `${accessory?.name || ''} for ${selectedModelName} ${selectedColor? `(${selectedColor.color})` : ''}`;

  useEffect(() => {
    setMainImage(displayImages[0] || '');
    setQty(1);
  }, [selectedColor?.sku, selectedModelName]);

  const addToCartHandler = () => {
    if (!selectedColor) return toast.error('Please select a color');
    dispatch(addToCart({
    ...accessory,
      qty,
      model: selectedModelName,
      color: selectedColor.color,
      colorHex: selectedColor.colorHex,
      sku: displaySKU,
      price: finalPrice,
      originalPrice: displayPrice,
      image: mainImage,
      discount: discount,
    }));
    toast.success('Added to cart');
    navigate('/cart');
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='container mx-auto px-4 py-6'>
      <Link to='/' className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium'>
        <FaArrowLeft /> Go Back
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* LEFT: IMAGES */}
        <div>
          <div className='border rounded-xl p-4 mb-4 bg-white shadow-sm'>
            {mainImage? (
              <img src={mainImage} className='w-full h-80 sm:h-96 object-contain bg-white rounded-lg p-4' alt={selectedColor?.color} />
            ) : (
              <div className='w-full h-[350px] bg-gray-100 rounded flex items-center justify-center text-gray-400'>No Image</div>
            )}
          </div>

          {displayImages.length > 0 && (
            <div className='grid grid-cols-4 sm:grid-cols-5 gap-2'>
              {displayImages.map((img, idx) => (
                <button key={img + idx} onClick={() => setMainImage(img)}
                  className={`border-2 rounded-lg p-1 ${mainImage === img? 'border-blue-600' : 'border-gray-200'}`}>
                  <img src={img} className='w-full h-16 object-contain' alt='thumb' />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS */}
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <p className='text-sm text-gray-500 mb-1'>{accessory?.brand} / {accessory?.category}</p>
          <h1 className='text-2xl font-bold mb-3'>{displayTitle}</h1>

          <div className='flex items-center gap-2 mb-4'>
            <div className='flex text-yellow-400'><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
            <span className='text-sm'>({accessory?.numReviews || 0})</span>
          </div>

          <div className='flex items-center gap-3 mb-1'>
            <h2 className='text-3xl text-green-600 font-bold'>${finalPrice.toFixed(2)}</h2>
            {discount?.isActive && <span className='text-sm bg-red-100 text-red-600 px-2 rounded'>-{discount.value}{discount.type === 'percentage'? '%' : '$'}</span>}
          </div>
          <p className='text-xs text-gray-400 mb-3'>SKU: {displaySKU}</p>

          <div className='mb-5'>
            {displayStock > 0? <span className='text-green-600'><FaCheck /> In Stock ({displayStock})</span> : <span className='text-red-600'>Out Of Stock</span>}
          </div>

          {/* MODEL SELECTOR - USE INDEX + modelName AS KEY */}
          <div className='mb-5'>
            <p className='font-semibold mb-3'>Select Model:</p>
            <div className='flex flex-wrap gap-2'>
              {uniqueModels.map((model, idx) => (
                <button key={model.modelName + idx}
                  onClick={() => handleModelChange(model.modelName)}
                  className={`px-4 py-2 border-2 rounded-lg text-sm ${selectedModelName === model.modelName? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  {model.modelName}
                </button>
              ))}
            </div>
            <p className='text-xs text-gray-500 mt-2'>{modelDescription}</p>
          </div>

          {/* COLOR SECTION - USE SKU AS KEY */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Choose your color</label>
            <div className='grid grid-cols-3 sm:grid-cols-5 gap-3'>
              {availableColors.map((cv) => (
                <button key={cv.sku} // KEY FIX: use SKU not index
                  onClick={() => handleColorChange(cv.color)}
                  className={`border-2 rounded-lg p-2 ${selectedColor?.sku === cv.sku? 'border-blue-600' : 'border-gray-200'}`}>
                  <img src={cv.images?.[0]?.url || '/placeholder.jpg'} className='w-full h-16 object-contain mb-1' alt={cv.color} />
                  <div className='w-4 h-4 rounded-full mx-auto' style={{ backgroundColor: cv.colorHex }} />
                  <p className='text-center text-xs mt-1'>{cv.color}</p>
                  <p className='text-center text-[10px]'>${Number(cv.price).toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* QTY + ADD TO CART */}
          {displayStock > 0 && (
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className='border-2 rounded-lg p-2 mb-4'>
              {[...Array(Math.min(displayStock, 10)).keys()].map(x => <option key={x+1} value={x+1}>{x+1}</option>)}
            </select>
          )}
          <button onClick={addToCartHandler} disabled={displayStock === 0}
            className='w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-400'>
            <FaShoppingCart /> Add To Cart
          </button>
        </div>
      </div>

       
     {/* SPECS + DESCRIPTION */}
<div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
  
  {/* LEFT: DESCRIPTION */}
  <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
    <h3 className='font-bold text-lg sm:text-xl mb-4'>Description</h3>
    <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
      {modelDescription || 'No description added for this model.'}
    </p>
  </div>

  {/* RIGHT: SPECIFICATIONS */}
  <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
    <h3 className='font-bold text-lg sm:text-xl mb-4'>Specifications</h3>
    {modelSpecs.length > 0 ? (
      <div className='divide-y divide-gray-200'>
        {modelSpecs.map((s, i) => (
          <div key={s.key + i} className='flex justify-between items-center py-3 text-sm'>
            <span className='text-gray-600 font-medium'>{s.key}</span>
            <span className='text-gray-900 text-right max-w-[60%]'>{s.value}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-sm">No specifications added</p>
    )}
  </div>

</div>
    </div>
  );
};

export default AccessoryScreen;