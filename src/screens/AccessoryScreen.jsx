import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetAccessoryBySlugQuery } from '../slices/accessoriesApiSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaCheck, FaArrowLeft, FaStar } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductImageGallery from '../components/ProductImageGallery'; // <-- NEW

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
      if (!map.has(v.modelName)) map.set(v.modelName, v);
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

  // 3. DEDUPE COLORS BY sku
  const availableColors = useMemo(() => {
    if (!selectedModel?.colorVariants) return [];
    const map = new Map();
    selectedModel.colorVariants.forEach(cv => {
      if (!map.has(cv.sku)) map.set(cv.sku, cv);
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
  const isOutOfStock = displayStock <= 0;

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
    const newModel = uniqueModels.find(m => m.modelName === modelName);
    if (!newModel) return;

    const sameColorExists = newModel.colorVariants?.find(c => c.color === selectedColorName);
    const firstAvailable = newModel.colorVariants?.find(c => Number(c.countInStock) > 0) 
      || newModel.colorVariants?.[0];
    const colorToSet = sameColorExists?.color || firstAvailable?.color || '';

    setSearchParams({ 
      model: modelName, 
      color: colorToSet 
    });
  };

  const handleColorChange = (colorName) => {
    const params = new URLSearchParams(searchParams);
    params.set('color', colorName);
    setSearchParams(params);
  };

  const displayTitle = `${accessory?.name || ''} for ${selectedModelName} ${selectedColor? `(${selectedColor.color})` : ''}`;

  // AUTO FIX: When model changes and color doesn't exist, switch to valid color
  useEffect(() => {
    if (!selectedModel?.colorVariants?.length) return;
    const colorExistsInModel = selectedModel.colorVariants.some(c => c.color === selectedColorName);
    if (!colorExistsInModel) {
      const firstAvailable = selectedModel.colorVariants.find(c => Number(c.countInStock) > 0) 
        || selectedModel.colorVariants[0];
      if (firstAvailable) {
        setSearchParams(prev => {
          prev.set('model', selectedModel.modelName);
          prev.set('color', firstAvailable.color);
          return prev;
        });
      }
    }
  }, [selectedModel, selectedColorName, setSearchParams]);

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
        <div className='lg:col-span-1'>
          <div className='border rounded-xl p-4 bg-white shadow-sm relative'>
            {/* SOLD OUT Badge */}
            {isOutOfStock && (
              <div className='absolute top-3 right-3 z-20'>
                <span className='px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md shadow-sm tracking-wide border border-gray-300 animate-pulse'>
                  SOLD OUT
                </span>
              </div>
            )}

            <ProductImageGallery 
              images={displayImages}
              selectedImage={mainImage}
              onSelectImage={setMainImage}
            />
          </div>
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
            {displayStock > 0? <span className='text-green-600 flex items-center gap-1'><FaCheck /> In Stock ({displayStock})</span> : <span className='text-red-600'>Out Of Stock</span>}
          </div>

          {/* MODEL SELECTOR */}
          <div className='mb-5'>
            <p className='font-semibold mb-3'>Select Model:</p>
            <div className='flex flex-wrap gap-2'>
              {uniqueModels.map((model, idx) => {
                const hasAnyStock = model.colorVariants?.some(c => Number(c.countInStock) > 0)
                const isSelectedModel = selectedModelName === model.modelName
                const selectedColorIsOut = isSelectedModel && isOutOfStock
                const shouldDim =!hasAnyStock || selectedColorIsOut
                
                return (
                  <button 
                    key={model.modelName + idx}
                    onClick={() => handleModelChange(model.modelName)}
                    className={`px-4 py-2 border-2 rounded-lg text-sm transition ${
                      isSelectedModel? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    } ${shouldDim? 'opacity-50 grayscale' : ''}`}
                  >
                    {model.modelName}
                    {!hasAnyStock && <span className='ml-1 text-[10px] text-gray-500'>(Out)</span>}
                    {selectedColorIsOut && <span className='ml-1 text-[10px] text-red-500'>(Color Out)</span>}
                  </button>
                )
              })}
            </div>
            <p className='text-xs text-gray-500 mt-2'>{modelDescription}</p>
          </div>

          {/* COLOR SECTION */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Choose your color</label>
            <div className='grid grid-cols-3 sm:grid-cols-5 gap-3'>
              {availableColors.map((cv) => {
                const isColorOut = Number(cv.countInStock) <= 0;
                return (
                  <button 
                    key={cv.sku}
                    onClick={() => handleColorChange(cv.color)}
                    className={`border-2 rounded-lg p-2 transition relative ${
                      selectedColor?.sku === cv.sku? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                    } ${isColorOut? 'opacity-50 grayscale hover:border-red-300' : 'hover:border-gray-400'}`}
                  >
                    {isColorOut && (
                      <span className='absolute -top-1 -right-1 bg-gray-200 text-gray-700 text-[9px] px-1.5 py-0.5 rounded-full font-semibold border border-gray-300 animate-pulse'>
                        OUT
                      </span>
                    )}
                    <img src={cv.images?.[0]?.url || '/placeholder.jpg'} className='w-full h-16 object-contain mb-1' alt={cv.color} />
                    <div className='w-4 h-4 rounded-full mx-auto' style={{ backgroundColor: cv.colorHex }} />
                    <p className='text-center text-xs mt-1'>{cv.color}</p>
                    <p className='text-center text-[10px]'>${Number(cv.price).toFixed(2)}</p>
                    {isColorOut && <p className='text-center text-[9px] text-red-500 font-bold'>0 Stock</p>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* QTY + ADD TO CART */}
          {displayStock > 0 && (
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className='border-2 rounded-lg p-2 mb-4 w-full'>
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
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='font-bold text-lg sm:text-xl mb-4'>Description</h3>
          <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
            {modelDescription || 'No description added for this model.'}
          </p>
        </div>
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='font-bold text-lg sm:text-xl mb-4'>Specifications</h3>
          {modelSpecs.length > 0? (
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