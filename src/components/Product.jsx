import { Link } from 'react-router-dom';
import { FaEdit, FaStar, FaBalanceScale } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCompare,
  removeFromCompare,
} from '../slices/compareSlice';
import { toast } from 'react-toastify';
import CountdownTimer from './CountdownTimer';

const Product = ({ product, userInfo, hideCompare = false, fromRecent = false }) => {
  const dispatch = useDispatch();

  const { products: compareProducts } = useSelector(
    (state) => state.compare
  );

  const activeCompareProducts = compareProducts.filter(Boolean);
  //    console.log("compareProducts:", compareProducts);
  // console.log("activeCompareProducts:", activeCompareProducts);

  const isCompared = activeCompareProducts.some(
    (item) => item?._id === product._id
  );


  // V10.4 KEY: Check if this is flat recentlyViewed data first
  const isFlat = !product.variants // recentlyViewed data doesn't have variants

  // Find the variant/color to display - ONLY for full products
  const selectedVariant = isFlat
    ? null
    : product.defaultStorage
      ? product.variants?.find(v => v.storage === product.defaultStorage)
      : product.variants?.[0];

  const selectedColor = isFlat
    ? null
    : product.defaultColor
      ? selectedVariant?.colors?.find(c => c.name === product.defaultColor)
      : selectedVariant?.colors?.[0];
  //  console.log(product.defaultStorage);
  // console.log(product.defaultColor);
  // Image

  const mainImage = isFlat
    ? product.image // use the flat image we saved
    : (product.defaultColor
      ? product.variants?.[0]?.colors?.find(c => c.name === product.defaultColor)?.images?.[0]?.url
      : product.variants?.[0]?.colors?.[0]?.images?.[0]?.url)
    || '/images/placeholder-phone.jpg'

  const mainPrice = isFlat ? product.price : (product.price || product.variants?.[0]?.colors?.[0]?.price)
  const mainOriginalPrice = isFlat ? product.originalPrice : product.originalPrice
  const discountPercent = isFlat
    ? (product.originalPrice && product.price
      ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
      : 0)
    : product.bestDiscount || 0

  const mainPriceFormatted = mainPrice ? Number(mainPrice).toLocaleString('en-US') : '0';
  const mainOriginalPriceFormatted = mainOriginalPrice ? Number(mainOriginalPrice).toLocaleString('en-US') : null;

  // Colors
  const firstVariantColors = isFlat ? [] : (selectedVariant?.colors || []);
  //console.log(firstVariantColors)
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;
  //console.log('Flat product:', product.name, product.price, product.originalPrice, discountPercent)
  return (
    <div className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden 
    border-gray-100 group relative flex-col h-full'>
      {userInfo && userInfo.isAdmin && (
        <Link to={`/admin/product/${product._id}/edit`} className='absolute top-2 right-2 z-10 bg-white/90 
        backdrop-blur-sm text-gray-700 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity'>
          <FaEdit size={12} />
        </Link>
      )}

      {!hideCompare && (
        <button
          type="button"
          className={`absolute z-10 flex items-center justify-center
           w-7 h-7  lg:w-9 lg:h-9 rounded-full border shadow transition-all

          top-1 left-1 lg:top-3 lg:left-3 lg:right-auto

          ${isCompared
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:text-white hover:border-blue-600"
            }`}
          title="Compare"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const maxCompare = window.innerWidth < 1024 ? 2 : 4;

            if (isCompared) {

              dispatch(removeFromCompare(product._id));
            } else {
              if (activeCompareProducts.length >= maxCompare) {
                toast.warning(
                  `You can compare up to ${maxCompare} phones only.`
                );
                return;
              }

              dispatch(
                addToCompare({
                  _id: product._id,
                  slug: product.slug,
                  name: product.name,
                  brand: product.brand,
                  defaultImage:
                    product.variants?.[0]?.colors?.[0]?.images?.[0]?.url ||
                    product.defaultImage,

                  defaultPrice:
                    product.variants?.[0]?.colors?.[0]?.price ||
                    product.defaultPrice,
                  rating: product.rating,
                  numReviews: product.numReviews,
                  defaultStorage: product.variants?.[0].storage || "",
                  defaultColor: product.variants?.[0].colors?.[0].name || "",
                  specs: product.variants?.[0]?.specs || {},
                  variants: product.variants || [],
                })
              );

              toast.success("Added to compare");
            }
          }}

        >
          <FaBalanceScale
            size={18}
            className={isCompared ? "text-white" : "text-gray-700"}
          />
        </button>
      )}
      <div></div>
      {/* {console.log("DEBUG Recent:", product.name, "fromRecent:", fromRecent, "color:", product.color, "storage:", product.storage)} */}
      <Link
      
        to={
          
          fromRecent && product.color && product.storage
            ? `/product/${product.slug}?storage=${encodeURIComponent(product.storage)}&color=${encodeURIComponent(product.color)}`
            : product.defaultStorage && product.defaultColor
              ? `/product/${product.slug}?storage=${encodeURIComponent(product.defaultStorage)}&color=${encodeURIComponent(product.defaultColor)}`
              : `/product/${product.slug}`
        }
        className='block'
      >
        {/* V9.80 KEY: h-40 mobile, h-48 desktop. Big enough to breathe */}
        <div className='h-32 sm:h-48 overflow-hidden bg-gray-50 flex items-center justify-center'>
          <img src={mainImage} alt={product.name} className='h-full w-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300' loading="lazy" />
          {/* Countdown Badge on Image */}
          {product.bestDiscount > 0 && product.endDate && (
            <div className="absolute top-28 left-2 lg:top-44 lg:left-2 z-20">
              <CountdownTimer endDate={product.endDate} />
            </div>
          )}
        </div>
      </Link>

      <div className='p-3 sm:p-4 flex-col flex-1'>
        <Link
          to={
            fromRecent && product.color && product.storage
              ? `/product/${product.slug}?storage=${encodeURIComponent(product.storage)}&color=${encodeURIComponent(product.color)}`
              : product.defaultStorage && product.defaultColor
                ? `/product/${product.slug}?storage=${encodeURIComponent(product.defaultStorage)}&color=${encodeURIComponent(product.defaultColor)}`
                : `/product/${product.slug}`
          }
          className='block mb-1.5'
        >
          <h3 className='text-[15px] sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 leading-snug'>
            {product.name}
          </h3>
        </Link>

        {numReviews > 0 && (
          <div className='flex items-center gap-1 mb-2 text-xs text-gray-500'>
            <FaStar className='text-yellow-500' size={12} />
            <span className='font-medium text-gray-500'>{rating.toFixed(1)}</span>
            <span>({numReviews})</span>
          </div>
        )}

        {firstVariantColors.length > 0 && (
          <div className='flex gap-1.5 items-center mb-2.5'>
            {firstVariantColors.slice(0, 7).map((color, idx) => (
              <div key={idx} className='w-3.5 h-3.5 rounded-full border border-gray-500'
                style={{ backgroundColor: color.hexCode || color.name.toLowerCase() }} title={color.name} />
            ))}
          </div>
        )}

        <div className='mt-auto pt-1'>
          {product.attributes?.storage || product.attributes?.color ? (
            <div className='flex gap-2 mb-1'>
              {product.attributes?.storage && (
                <span className='text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium'>
                  {product.attributes.storage}
                </span>
              )}
              {product.attributes?.color && (
                <span className='text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium'>
                  {product.attributes.color}
                </span>
              )}
            </div>
          ) : null}

          {mainPrice ? (
            <div className='flex items-baseline gap-2 flex-wrap'>
              {discountPercent > 0 && Number(mainOriginalPrice) > Number(mainPrice) ? (
                // DEALS CARD - Show crossed price + badge
                <>
                  <p className='text-xl sm:text-2xl font-bold text-gray-900 leading-none'>
                    ${mainPriceFormatted}
                  </p>
                  {mainOriginalPriceFormatted && mainOriginalPrice > mainPrice && (
                    <p className='text-sm line-through text-gray-500'>${mainOriginalPriceFormatted}</p>
                  )}
                  {discountPercent > 0 && mainOriginalPrice > mainPrice && (
                    <span className='text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold'>
                      {discountPercent}% OFF
                    </span>
                  )}
                  {/* ADD THIS */}
                  {mainOriginalPrice > mainPrice && (
                    <p className='text-xs text-green-600 mt-0.5 w-full'>
                      You save ${(mainOriginalPrice - mainPrice).toFixed(2)}
                    </p>)}
                </>
              ) : (
                // NORMAL CARD - Show "Starting at"
                <>
                  {(product.variants?.length > 1 || firstVariantColors.length > 1) && (
                    <span className='text-[10px] uppercase tracking-wider text-gray-500 font-medium'>
                      Starting at
                    </span>
                  )}
                  <p className='text-xl sm:text-2xl font-bold text-gray-900 leading-none'>
                    ${mainPriceFormatted}
                  </p>
                </>
              )}
            </div>
          ) : (
            <p className='text-sm text-gray-400 font-medium'>Contact</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default Product;