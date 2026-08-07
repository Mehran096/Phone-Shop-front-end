import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetAccessoryBySlugQuery } from '../slices/accessoriesApiSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaCheck, FaArrowLeft, FaStar, FaTag } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductImageGallery from '../components/ProductImageGallery';

const ACCESSORY_TYPE_LABELS = {
  case: 'Case', charger: 'Charger', cable: 'Cable', glass: 'Glass', audio: 'Audio', holder: 'Holder', other: 'Other'
}

const getTypeColor = (type) => {
  const colors = {
    Charger: 'bg-blue-100 text-blue-700', Cable: 'bg-green-100 text-green-700',
    Audio: 'bg-purple-100 text-purple-700', Holder: 'bg-orange-100 text-orange-700',
    Case: 'bg-pink-100 text-pink-700', Glass: 'bg-gray-100 text-gray-700',
  };
  const label = ACCESSORY_TYPE_LABELS[type] || 'Other';
  return colors[label] || 'bg-gray-100 text-gray-700';
};

const AccessoryScreen = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [isSettingDefaults, setIsSettingDefaults] = useState(false);

  const { data: accessory, isLoading, error } = useGetAccessoryBySlugQuery(slug);

  const hasModels = accessory?.models && accessory.models.length > 0;

  const uniqueModels = useMemo(() => {
    if (!hasModels) return [];
    const map = new Map();
    accessory.models.forEach(m => {
      if (!map.has(m.modelName)) map.set(m.modelName, m);
    });
    return Array.from(map.values());
  }, [accessory, hasModels]);

  const selectedModelName = searchParams.get('model') || '';
  const selectedVariantName = searchParams.get('variant') || '';

  const selectedModel = useMemo(() => {
    if (!hasModels) return null;
    return uniqueModels.find(m => m.modelName === selectedModelName) || null;
  }, [uniqueModels, selectedModelName, hasModels]);

  const availableVariants = useMemo(() => {
    if (hasModels) {
      return selectedModel?.variants || [];
    } else {
      return accessory?.variants || [];
    }
  }, [selectedModel, accessory, hasModels]);

  const selectedVariant = useMemo(() => {
    if (!availableVariants.length) return null;
    return availableVariants.find(v => v.name === selectedVariantName) || availableVariants[0] || null;
  }, [availableVariants, selectedVariantName]);

  useEffect(() => {
    if (!accessory || isSettingDefaults) return;
    const currentModel = searchParams.get('model');
    const currentVariant = searchParams.get('variant');

    if (!currentModel &&!currentVariant) {
      setIsSettingDefaults(true);
      if (hasModels && uniqueModels.length > 0) {
        const firstModel = uniqueModels[0];
        const firstVariant = firstModel.variants?.[0];
        setSearchParams({
          model: firstModel.modelName,
          variant: firstVariant?.name || ''
        });
      } else if (accessory.variants?.length > 0) {
        setSearchParams({
          model: 'Universal',
          variant: accessory.variants[0].name
        });
      }
      setTimeout(() => setIsSettingDefaults(false), 100);
    }
  }, [accessory, hasModels, uniqueModels, searchParams, setSearchParams, isSettingDefaults]);

  // === USE DATA DIRECTLY FROM BACKEND ===
  const originalPrice = Number(selectedVariant?.originalPrice || 0);
  const finalPrice = Number(selectedVariant?.price || 0); // backend already did discount + bulk for qty=1
  const displayStock = Number(selectedVariant?.countInStock || 0);
  const displaySKU = selectedVariant?.sku || '';
  const discount = selectedVariant?.discount;
  const isOutOfStock = displayStock <= 0;
  const totalPrice = (finalPrice * qty).toFixed(2);

  // Calculate savings
  const savings = (originalPrice - finalPrice).toFixed(2);
  const savingsPercent = originalPrice > 0? Math.round((savings / originalPrice) * 100) : 0;

  // For bulk tier UI - these are just for display. Real price updates on cart
  const bulkPricing = selectedVariant?.bulkPricing || [];

  const getImageUrls = (images) => {
    if (!images ||!Array.isArray(images)) return [];
    return images.map(img => typeof img === 'string'? img : img?.url || '').filter(Boolean);
  };

  const displayImages = getImageUrls(selectedVariant?.images || []);
  const modelDescription = selectedModel?.description || accessory?.description || '';
  const modelSpecs = selectedModel?.specs || [];

  const handleModelChange = (modelName) => {
    const newModel = uniqueModels.find(m => m.modelName === modelName);
    if (!newModel) return;
    const firstVariant = newModel.variants?.[0];
    setSearchParams({
      model: modelName,
      variant: firstVariant?.name || ''
    });
  };

  const handleVariantChange = (variantName) => {
    const params = new URLSearchParams(searchParams);
    params.set('variant', variantName);
    setSearchParams(params);
    setQty(1);
  };

  const displayTitle = `${accessory?.name || ''} ${hasModels && selectedModelName? `for ${selectedModelName}` : ''} ${selectedVariant? `(${selectedVariant.name})` : ''}`;

  useEffect(() => {
    setMainImage(displayImages[0] || '');
    setQty(1);
  }, [selectedVariant?.sku]);

  const addToCartHandler = () => {
    if (!selectedVariant) return toast.error('Please select an option');
    dispatch(addToCart({
    ...accessory,
      qty,
      model: hasModels? selectedModelName : 'Universal',
      variant: selectedVariant.name,
      colorHex: selectedVariant.colorHex,
      sku: displaySKU,
      price: finalPrice, // final price per item from backend for qty=1
      originalPrice: originalPrice,
      image: mainImage,
      discount: discount,
      bulkPricing: bulkPricing,
      appliedTierQty: qty,
    }));
    toast.success('Added to cart');
    navigate('/cart');
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;
  if (!selectedVariant) return <Loader />;

  const typeLabel = ACCESSORY_TYPE_LABELS[accessory?.accessoryType];

  return (
    <div className='container mx-auto px-3 sm:px-4 py-4 sm:py-6'>
      <Link to='/' className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 sm:mb-6 font-medium text-sm'>
        <FaArrowLeft /> Go Back
      </Link>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8'>
        {/* LEFT: IMAGES */}
        <div className='lg:col-span-1'>
          <div className='border rounded-xl p-3 sm:p-4 bg-white shadow-sm relative'>
            <div className='absolute top-3 left-3 z-20 flex gap-2 flex-wrap'>
              <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${getTypeColor(accessory?.accessoryType)}`}>
                {typeLabel}
              </span>
              {discount?.isActive && savingsPercent > 0 && (
                <span className='px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded flex items-center gap-1'>
                  <FaTag />-{savingsPercent}%
                </span>
              )}
            </div>

            {isOutOfStock && (
              <div className='absolute top-3 right-3 z-20'>
                <span className='px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md shadow-sm border'>SOLD OUT</span>
              </div>
            )}

            <ProductImageGallery images={displayImages} selectedImage={mainImage} onSelectImage={setMainImage} />
          </div>
        </div>

        {/* RIGHT: DETAILS */}
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <p className='text-xs sm:text-sm text-gray-500 mb-1'>{accessory?.brand} / {typeLabel}</p>
          <h1 className='text-xl sm:text-2xl font-bold mb-3'>{displayTitle}</h1>

          <div className='flex items-center gap-2 mb-4'>
            <div className='flex text-yellow-400 text-sm'><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
            <span className='text-sm'>({accessory?.numReviews || 0} reviews)</span>
          </div>

          {/* PRICE WITH ORIGINAL + CUT PRICE */}
          <div className='mb-4'>
            <div className='flex items-center gap-3 mb-1 flex-wrap'>
              <h2 className='text-2xl sm:text-3xl text-green-600 font-bold'>${finalPrice.toFixed(2)}</h2>
              {originalPrice > finalPrice && (
                <span className='text-sm sm:text-lg text-gray-400 line-through'>${originalPrice.toFixed(2)}</span>
              )}
              {discount?.isActive && discount?.value > 0 && (
                <span className='px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded flex items-center gap-1'>
                  <FaTag />-{discount.value}{discount.type === 'percentage'? '%' : '$'}
                </span>
              )}
            </div>
            
            {originalPrice > finalPrice && (
              <p className='text-xs text-red-500 font-semibold'>
                You save ${savings} ({savingsPercent}%)
              </p>
            )}

            <p className='text-xs text-gray-500 mt-1'>per item for qty {qty}</p>
            <p className='text-xs text-gray-400 mt-1'>SKU: {displaySKU}</p>
          </div>

          <div className='mb-5'>
            {displayStock > 0? <span className='text-green-600 flex items-center gap-1 text-sm'><FaCheck /> In Stock ({displayStock})</span> : <span className='text-red-600 text-sm'>Out Of Stock</span>}
          </div>

          {/* MODEL SELECTOR */}
          {hasModels && uniqueModels.length > 1 && (
            <div className='mb-5'>
              <p className='font-semibold mb-3 text-sm'>Select Model:</p>
              <div className='flex flex-wrap gap-2'>
                {uniqueModels.map((model) => (
                  <button
                    key={model.modelName}
                    onClick={() => handleModelChange(model.modelName)}
                    className={`px-3 py-2 border-2 rounded-lg text-xs sm:text-sm transition ${
                      selectedModelName === model.modelName? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {model.modelName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VARIANT SECTION - SHOWS CUT PRICE */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>{hasModels? 'Choose Color' : 'Choose Option'}</label>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3'>
              {availableVariants.map((v) => {
                const isVariantOut = Number(v.countInStock) <= 0;
                const vOriginalPrice = Number(v.originalPrice || 0);
                const vFinalPrice = Number(v.price || 0);
                const hasDiscount = vOriginalPrice > vFinalPrice;

                return (
                  <button
                    key={v.sku}
                    onClick={() => handleVariantChange(v.name)}
                    className={`border-2 rounded-lg p-2 transition relative ${
                      selectedVariant?.sku === v.sku? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                    } ${isVariantOut? 'opacity-50 grayscale' : 'hover:border-gray-400'}`}
                  >
                    {isVariantOut && <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full font-semibold'>OUT</span>}
                    <img src={v.images?.[0]?.url || '/placeholder.jpg'} className='w-full h-12 sm:h-16 object-contain mb-1' alt={v.name} />
                    {v.colorHex && <div className='w-4 h-4 rounded-full mx-auto mb-1 border' style={{ backgroundColor: v.colorHex }} />}
                    <p className='text-center text-xs font-medium truncate'>{v.name}</p>
                    <div className='text-center'>
                      <p className='text-[11px] font-bold text-green-600'>${vFinalPrice.toFixed(2)}</p>
                      {hasDiscount && <p className='text-[9px] text-gray-400 line-through'>${vOriginalPrice.toFixed(2)}</p>}
                    </div>
                    {isVariantOut && <p className='text-center text-[9px] text-red-500 font-bold'>0 Stock</p>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* BULK PRICING TIERS - INFO ONLY */}
          {displayStock > 0 && bulkPricing.length > 1 && (
            <div className='mb-4 p-3 bg-purple-50 rounded-lg'>
              <p className='text-sm font-semibold mb-2 text-purple-800'>Bulk Pricing - Save more:</p>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {[...bulkPricing].sort((a,b) => a.qty - b.qty).map((tier) => {
                  const isActive = qty >= tier.qty && qty < ([...bulkPricing].sort((a,b) => a.qty - b.qty).find(t => t.qty > tier.qty)?.qty || 999);
                  const tierTotal = (tier.price * tier.qty).toFixed(2);

                  return (
                    <button
                      key={tier.qty}
                      onClick={() => setQty(tier.qty)}
                      className={`border-2 rounded-lg p-2 text-center transition ${
                        isActive? 'border-purple-600 bg-white shadow-sm' : 'border-purple-200 hover:border-purple-400'
                      }`}
                    >
                      <p className='text-xs font-semibold'>Buy {tier.qty}+</p>
                      <p className='text-[11px] font-bold text-purple-700'>${tier.price.toFixed(2)} each</p>
                      <p className='text-[10px] text-gray-500'>Total: ${tierTotal}</p>
                      {tier.discountLabel && <p className='text-[10px] text-red-500 font-medium mt-1'>{tier.discountLabel}</p>}
                    </button>
                  )
                })}
              </div>
              <p className='text-[10px] text-gray-500 mt-2'>*Add to cart to get exact bulk price for selected qty</p>
            </div>
          )}

          {/* QTY SELECTOR */}
          {displayStock > 0 && (
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-1'>Quantity</label>
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className='border-2 rounded-lg p-2 w-full text-sm'
              >
                {[...Array(Math.min(displayStock, 20)).keys()].map(x => <option key={x+1} value={x+1}>{x+1}</option>)}
              </select>
              <p className='text-sm font-bold text-green-600 mt-2'>Estimated Total: ${totalPrice}</p>
            </div>
          )}

          <button onClick={addToCartHandler} disabled={displayStock === 0}
            className='w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-400 text-sm sm:text-base'>
            <FaShoppingCart /> Add To Cart
          </button>
        </div>
      </div>

      {/* SPECS + DESCRIPTION */}
      <div className='mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='font-bold text-base sm:text-lg mb-4'>Description</h3>
          <p className='text-gray-700 leading-relaxed text-sm whitespace-pre-line'>{modelDescription}</p>
        </div>
        <div className='bg-white p-4 sm:p-6 rounded-xl shadow-sm'>
          <h3 className='font-bold text-base sm:text-lg mb-4'>Specifications</h3>
          {modelSpecs.length > 0? (
            <div className='divide-y divide-gray-200'>
              {modelSpecs.map((s, i) => (
                <div key={s.key + i} className='flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 text-sm gap-1'>
                  <span className='text-gray-600 font-medium'>{s.key}</span>
                  <span className='text-gray-900 sm:text-right'>{s.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No specifications added</p>}
        </div>
      </div>
    </div>
  );
};

export default AccessoryScreen;