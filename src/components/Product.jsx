import { Link } from 'react-router-dom';
import { FaEdit, FaStar, FaBalanceScale } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCompare,
  removeFromCompare,
} from '../slices/compareSlice';

const Product = ({ product, userInfo }) => {
  const dispatch = useDispatch();

  const { products: compareProducts } = useSelector(
    (state) => state.compare
  );

  const isCompared = compareProducts.some(
    (item) => item._id === product._id
  );
  // Find the variant/color to display
  const selectedVariant =
    product.defaultStorage
      ? product.variants?.find(
        (variant) => variant.storage === product.defaultStorage
      )
      : product.variants?.[0];

  //console.log(selectedVariant)

  const selectedColor =
    product.defaultColor
      ? selectedVariant?.colors?.find(
        (color) => color.name === product.defaultColor
      )
      : selectedVariant?.colors?.[0];
  //  console.log(product.defaultStorage);
  // console.log(product.defaultColor);
  // Image
  const mainImage =
    selectedColor?.images?.[0]?.url ||
    '/images/placeholder-phone.jpg';

  // Price
  const mainPrice =
    selectedColor?.price
      ? Number(selectedColor.price).toLocaleString('en-US')
      : null;

  // Colors
  const firstVariantColors = selectedVariant?.colors || [];
  //console.log(firstVariantColors)
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;

  return (
    <div className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden 
    border-gray-100 group relative flex-col h-full'>
      {userInfo && userInfo.isAdmin && (
        <Link to={`/admin/product/${product._id}/edit`} className='absolute top-2 right-2 z-10 bg-white/90 
        backdrop-blur-sm text-gray-700 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity'>
          <FaEdit size={12} />
        </Link>
      )}
      <button
        type="button"
        className={`absolute top-3 left-3 z-10 flex items-center justify-center
              w-9 h-9 rounded-full border shadow transition-all
              ${isCompared
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-600 border-gray-200  hover:text-white'
          }`}
        title="Compare"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (isCompared) {
            dispatch(removeFromCompare(product._id));
          } else {
            dispatch(
              addToCompare({
                _id: product._id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                defaultImage: mainImage,
                defaultPrice: mainPrice,
                rating: product.rating,
                numReviews: product.numReviews,
                defaultStorage:product.variants?.[0].storage,
                defaultColor:product.variants?.[0].colors?.[0].name,
                specs: product.variants?.[0]?.specs || {},
                 
              })
            )
          }
        }}

      >
        <FaBalanceScale
          size={20}
          className="text-gray-800 hover:text-gray-800"
        />
      </button>
<div></div>
      <Link
        to={
          product.defaultStorage && product.defaultColor
            ? `/product/${product.slug}?storage=${encodeURIComponent(
              product.defaultStorage
            )}&color=${encodeURIComponent(product.defaultColor)}`
            : `/product/${product.slug}`
        }
        className='block'
      >
        {/* V9.80 KEY: h-40 mobile, h-48 desktop. Big enough to breathe */}
        <div className='h-36 sm:h-48 overflow-hidden bg-gray-50 flex items-center justify-center'>
          <img src={mainImage} alt={product.name} className='h-full w-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300' loading="lazy" />
        </div>
      </Link>

      <div className='p-3 sm:p-4 flex-col flex-1'>
        <Link to={
          product.defaultStorage && product.defaultColor
            ? `/product/${product.slug}?storage=${encodeURIComponent(
              product.defaultStorage
            )}&color=${encodeURIComponent(product.defaultColor)}`
            : `/product/${product.slug}`
        } className='block mb-1.5'>
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
          {mainPrice ? (
            <div className='flex items-baseline gap-1.5'>
              {product.variants?.length > 1 || firstVariantColors.length > 1 ? (
                <span className='text-[10px] uppercase tracking-wider text-gray-500 font-medium'>
                  Starting at
                </span>
              ) : null}

              <p className='text-xl sm:text-2xl font-bold text-gray-900 leading-none'>
                ${mainPrice}
              </p>
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