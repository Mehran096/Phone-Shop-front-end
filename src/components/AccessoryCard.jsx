import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const AccessoryCard = ({ accessory, onAddToCart }) => {
  // Get first variant's first option as default
  const defaultVariant = accessory.variants?.[0];
  const defaultOption = defaultVariant?.options?.[0];

  const price = defaultOption?.price || 0;
  const discountValue = defaultOption?.discount?.isActive? defaultOption.discount.value : 0;
  const finalPrice = discountValue > 0 
   ? price * (1 - discountValue / 100) 
    : price;
  const countInStock = defaultOption?.countInStock || 0;
  const thumbnail = defaultOption?.images?.[0]?.url || '/placeholder.jpg';

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-gray-100 flex-col h-full">
      {/* IMAGE */}
      <Link to={`/accessory/${accessory.slug}`} className="relative overflow-hidden block">
        <img
          src={thumbnail}
          alt={accessory.name}
          loading="lazy"
          className="w-full h-40 sm:h-48 md:h-52 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {discountValue > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountValue}%
          </span>
        )}
        {countInStock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
        {defaultOption?.images?.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
            {defaultOption.images.length} imgs
          </span>
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/accessory/${accessory.slug}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-green-600">
            {accessory.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-1">{defaultVariant?.value}</p>
        
        {/* RATING */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span>⭐ {accessory.rating || 0}</span>
          <span>({accessory.numReviews || 0})</span>
        </div>
        
        {/* PRICE - USING $ NOW */}
        <div className="flex items-center gap-2 mt-auto mb-3">
          <span className="text-lg sm:text-xl font-bold text-green-600">
            ${finalPrice.toFixed(2)}
          </span>
          {discountValue > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${price.toFixed(2)}
            </span>
          )}
        </div>

        {/* BUTTONS */}
        <button 
          onClick={() => onAddToCart(accessory, defaultVariant, defaultOption)}
          disabled={countInStock === 0}
          className={`w-full py-2 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition
            ${countInStock === 0 
             ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          <FaShoppingCart /> 
          {countInStock === 0? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default AccessoryCard;