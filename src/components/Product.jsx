import { Link } from 'react-router-dom';
import { FaEdit, FaStar } from 'react-icons/fa';

const Product = ({ product, userInfo }) => {
  const mainImage = product.variants?.[0]?.colors?.[0]?.images?.[0]?.url || '/images/placeholder-phone.jpg';
  const allPrices = product.variants?.flatMap(v => v.colors?.map(c => Number(c.price)).filter(p => p > 0) || []) || [];
  const mainPrice = allPrices.length > 0? Math.min(...allPrices).toLocaleString('en-US') : null;
  const firstVariantColors = product.variants?.[0]?.colors || [];
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;

  return (
    <div className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border-gray-100 group relative flex-col h-full'>
      {userInfo && userInfo.isAdmin && (
        <Link to={`/admin/product/${product._id}/edit`} className='absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 p-1.5 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity'>
          <FaEdit size={12} />
        </Link>
      )}

      <Link to={`/product/${product.slug}`} className='block'>
        {/* V9.80 KEY: h-40 mobile, h-48 desktop. Big enough to breathe */}
        <div className='h-40 sm:h-48 overflow-hidden bg-gray-50'>
          <img src={mainImage} alt={product.name} className='h-full w-full object-contain p-3 group-hover:scale-105 transition-transform duration-300' loading="lazy" />
        </div>
      </Link>

      <div className='p-3 sm:p-4 flex-col flex-1'>
        <Link to={`/product/${product.slug}`} className='block mb-1.5'>
          <h3 className='text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 leading-snug'>
            {product.name}
          </h3>
        </Link>
        
        {numReviews > 0 && (
          <div className='flex items-center gap-1 mb-2 text-xs text-gray-500'>
            <FaStar className='text-yellow-500' size={12} />
            <span className='font-medium text-gray-700'>{rating.toFixed(1)}</span>
            <span>({numReviews})</span>
          </div>
        )}

        {firstVariantColors.length > 1 && (
          <div className='flex gap-1.5 items-center mb-2.5'>
            {firstVariantColors.slice(0, 3).map((color, idx) => (
              <div key={idx} className='w-3 h-3 rounded-full border-gray-300' style={{ backgroundColor: color.name.toLowerCase() }} title={color.name} />
            ))}
          </div>
        )}

        <div className='mt-auto pt-1'>
          {mainPrice? (
            <div className='flex items-baseline gap-1'>
              <p className='text-base sm:text-lg font-bold text-gray-900 leading-none'>
                ${mainPrice}
              </p>
              {product.variants?.length > 1 || firstVariantColors.length > 1? (
                <span className='text-xs text-gray-500'>from</span>
              ) : null}
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