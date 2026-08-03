import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetAccessoryBySlugQuery } from '../slices/accessoriesApiSlice';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductImageGallery from '../components/ProductImageGallery';

const AccessoryScreen = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');

  const { data: accessory, isLoading, error } = useGetAccessoryBySlugQuery(slug);

  // BOL.COM LOGIC
  const models = accessory?.compatibleWith || [];
  const selectedModel = searchParams.get('model') || models[0] || '';
  const selectedColorName = searchParams.get('color') || '';

  const filteredOptions = useMemo(() => {
    if (!accessory?.variants?.[0]) return [];
    return accessory.variants[0].options.filter(opt => {
      // if empty array [] = works for all models
      if (!opt.compatibleModel || opt.compatibleModel.length === 0) return true;
      return opt.compatibleModel.includes(selectedModel)
    });
  }, [accessory, selectedModel]);

  const selectedOption = useMemo(() => {
    if (!accessory?.variants?.[0]?.options?.length) return null;
    // Check in ALL options, not just filtered. So color stays if it exists
    return accessory.variants[0].options.find(opt => opt.name === selectedColorName) || accessory.variants[0].options[0];
  }, [accessory, selectedColorName]);


  // Get all options for current model to check availability
  const availableOptionsForModel = useMemo(() => {
    if (!accessory?.variants?.[0]?.options?.length) return [];
    return accessory.variants[0].options.filter(opt => {
      if (!opt.compatibleModel || opt.compatibleModel.length === 0) return true;
      return opt.compatibleModel.includes(selectedModel)
    });
  }, [accessory, selectedModel]);

  const handleModelChange = (model) => {
    const params = new URLSearchParams();
    params.set('model', model);

    // Keep the current color exactly as it is. Don't check, don't change.
    const currentColor = searchParams.get('color');
    if (currentColor) {
      params.set('color', currentColor);
    }

    navigate(`?${params.toString()}`);
  };



  const handleColorChange = (colorName) => {
    const params = new URLSearchParams(searchParams);
    params.set('color', colorName);
    setSearchParams(params);
  };

  const displayTitle = `${accessory?.name || ''} for ${selectedModel} ${selectedOption ? `(${selectedOption.name})` : ''}`;
  const displayPrice = selectedOption?.price || accessory?.price || 0;

  // FIX: Get image URLs from objects - works for both string and object
  const getImageUrls = (images) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map(img => {
      if (typeof img === 'string') return img;
      return img?.url || '';
    }).filter(Boolean);
  };

  // Get images for selected option, fallback to accessory images
  const optionImages = selectedOption?.images || [];
  const accessoryImages = accessory?.images || [];
  const displayImages = getImageUrls(optionImages.length > 0 ? optionImages : accessoryImages);
  const displayStock = selectedOption?.countInStock || 0;
  const variantDescription = accessory?.variants?.[0]?.description || accessory?.description || '';

  // FORCE IMAGE TO CHANGE WHEN OPTION CHANGES
  useEffect(() => {
    console.log('Selected Option:', selectedOption?.name); // DEBUG
    console.log('Display Images:', displayImages); // DEBUG
    if (displayImages?.[0]) {
      setMainImage(displayImages[0]);
    } else {
      setMainImage('');
    }
    setQty(1);
  }, [selectedOption?.name, selectedModel]); // Depend on name + model so it fires every time

  const addToCartHandler = () => {
    if (!selectedOption) {
      toast.error('Please select a color');
      return;
    }
    dispatch(addToCart({
      ...accessory,
      qty,
      option: selectedOption,
      model: selectedModel,
      price: displayPrice
    }));
    toast.success('Added to cart');
    navigate('/cart');
  };



  const isSelectedColorAvailable = availableOptionsForModel.some(opt => opt.name === selectedOption?.name);

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
            {mainImage ? (
              <div className={`relative w-full h-96 bg-white rounded-lg p-4 ${!isSelectedColorAvailable ? 'opacity-30' : ''}`}>
                <img src={mainImage} className='w-full h-full object-contain' alt={selectedOption?.name || 'Accessory'} />
              </div>
            ) : (
              <div className='w-full h-[350px] md:h-[450px] bg-gray-100 rounded flex items-center justify-center text-gray-400'>No Image</div>
            )}
          </div>


          {/* Thumbnails */}
          {isSelectedColorAvailable && ( // <-- ADD THIS WRAPPER
            <div className='grid grid-cols-4 sm:grid-cols-5 gap-3'>
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`border-2 rounded-lg p-1 bg-white hover:border-blue-400 transition ${mainImage === img ? 'border-blue-600' : 'border-gray-200'}`}
                >
                  <img src={img} className='w-full h-20 object-contain' alt='thumb' />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS CARD */}
        <div className='bg-white p-6 rounded-xl shadow-sm'>
          <p className='text-sm text-gray-500 mb-1'>{accessory.brand} / Case</p>

          <h1 className='text-2xl md:text-3xl font-bold mb-3 text-gray-800'>{displayTitle}</h1>

          <div className='flex items-center gap-2 mb-4'>
            <span className='text-yellow-400'>★★★★★</span>
            <span className='text-sm text-gray-500'>(0 Reviews)</span>
          </div>

          <h2 className='text-4xl text-green-600 font-bold mb-4'>${displayPrice}</h2>

          <div className='mb-5'>
            {displayStock > 0 ?
              <span className='text-green-600 font-medium flex items-center gap-1'><FaCheck /> In Stock ({displayStock})</span> :
              <span className='text-red-600 font-medium'>Out Of Stock</span>
            }
          </div>

          {/* MODEL SELECTOR */}
          {models.length > 0 && (
            <div className='mb-5'>
              <p className='font-semibold mb-3 text-gray-700'>Compatible With:</p>
              <div className='flex flex-wrap gap-2'>
                {[...models]
                  .sort((a, b) => {
                    const aCompatible = !selectedOption?.compatibleModel ||
                      selectedOption.compatibleModel.length === 0 ||
                      selectedOption.compatibleModel.includes(a);
                    const bCompatible = !selectedOption?.compatibleModel ||
                      selectedOption.compatibleModel.length === 0 ||
                      selectedOption.compatibleModel.includes(b);

                    if (aCompatible && !bCompatible) return -1;
                    if (!aCompatible && bCompatible) return 1;
                    return 0;
                  })
                  .map((model) => {
                    const isSelectedModel = selectedModel === model;
                    const isCompatible = !selectedOption?.compatibleModel ||
                      selectedOption.compatibleModel.length === 0 ||
                      selectedOption.compatibleModel.includes(model);

                    return (
                      <button
                        key={model}
                        onClick={() => handleModelChange(model)} // <-- SIMPLE: only change model
                        className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition ${isSelectedModel
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                          } ${!isCompatible ? 'opacity-40' : '' // dim but clickable
                          }`}
                      >
                        {model}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}
          {/* color section */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Choose your color</label>
            <div className='grid grid-cols-4 sm:grid-cols-5 gap-3'>
              {accessory?.variants?.[0]?.options?.map((opt) => {
                const isAvailable = !opt.compatibleModel || opt.compatibleModel.length === 0 || opt.compatibleModel.includes(selectedModel);
                const isSelected = opt.name === selectedOption?.name;
                const colorImage = opt.images?.[0].url || accessory?.image;

                return (
                  <button
                    key={opt.name}
                    onClick={() => handleColorChange(opt.name)}
                    className={`border-2 rounded-lg p-2 bg-white transition ${isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                      } ${!isAvailable ? 'opacity-40' : 'hover:border-blue-400'
                      }`}
                  >
                    <div className='relative'>
                      <img
                        src={colorImage}
                        className={`w-full h-16 object-contain mb-1 ${!isAvailable ? 'opacity-50' : ''}`}
                        alt={opt.name}
                      />
                      {!isAvailable && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <span className='text-red-500 text-lg'>🚫</span>
                        </div>
                      )}
                    </div>

                    <p className={`text-center text-xs font-medium ${!isAvailable ? 'text-gray-400' : 'text-gray-700'}`}>
                      {opt.name}
                    </p>
                    {!isAvailable && (
                      <p className='text-center text-xs text-red-500'>Not compatible</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* QTY */}
          {displayStock > 0 && (
            <div className='mb-5'>
              <label className='font-semibold mr-3 text-gray-700'>Qty:</label>
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className='border-2 rounded-lg p-2'>
                {[...Array(Math.min(displayStock, 10)).keys()].map(x => (
                  <option key={x + 1} value={x + 1}>{x + 1}</option>
                ))}
              </select>
            </div>
          )}

          {/* ADD TO CART */}
          <button
            onClick={addToCartHandler}
            disabled={displayStock === 0}
            className='w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition'
          >
            <FaShoppingCart /> Add To Cart
          </button>
        </div>
      </div>

      {/* SPECS + DESCRIPTION IN 1 ROW FLEX */}
      <div className='mt-8 flex flex-col lg:flex-row gap-8'>
        <div className='bg-white p-6 rounded-xl shadow-sm lg:w-1/2'>
          <h3 className='font-bold text-xl mb-4'>Specifications</h3>
          {accessory.variants?.[0]?.specs?.map((s, i) => (
            <div key={i} className='flex justify-between border-b py-3 text-sm'>
              <span className='text-gray-600'>{s.key}</span>
              <span className='font-medium'>{s.value}</span>
            </div>
          ))}
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm lg:w-1/2'>
          <h3 className='font-bold text-xl mb-4'>Description</h3>
          <p className='text-gray-700 leading-relaxed'>{variantDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default AccessoryScreen;