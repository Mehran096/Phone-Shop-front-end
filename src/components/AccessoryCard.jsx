import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const AccessoryCard = ({ accessory, onAddToCart }) => {
  // NEW DB: variants = Models, colorVariants = Colors
  const allModels = accessory.variants || [];
  
  // Get all prices from all colorVariants to show range
  const getAllPrices = () => {
    const prices = [];
    allModels.forEach(model => {
      model.colorVariants?.forEach(cv => {
        if (Number(cv.price) > 0) prices.push(Number(cv.price));
      });
    });
    return prices;
  };

  const allPrices = getAllPrices();
  const minPrice = allPrices.length > 0? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0? Math.max(...allPrices) : 0;
  const hasRange = minPrice!== maxPrice;

  // Get first color with discount for badge
  const firstDiscountedColor = allModels
   .flatMap(m => m.colorVariants || [])
   .find(cv => cv.discount?.isActive && cv.discount?.value > 0);
  
  const discountValue = firstDiscountedColor?.discount?.value || 0;
  const finalMinPrice = discountValue > 0? minPrice * (1 - discountValue / 100) : minPrice;
  const finalMaxPrice = discountValue > 0? maxPrice * (1 - discountValue / 100) : maxPrice;
  
  // Stock = sum of all colorVariants stock
  const totalStock = allModels.reduce((acc, model) => 
    acc + (model.colorVariants || []).reduce((sum, cv) => sum + Number(cv.countInStock || 0), 0), 0
  );
  
  // Thumbnail: first model's first color image
  const firstColor = allModels[0]?.colorVariants?.[0];
  const thumbnail = firstColor?.images?.[0]?.url || '/placeholder.jpg';

  // Total images count for badge
  const totalImages = allModels.reduce((acc, model) => 
    acc + (model.colorVariants || []).reduce((sum, cv) => sum + (cv.images?.length || 0), 0), 0
  );

  // Total colors count
  const totalColors = allModels.reduce((acc, model) => acc + (model.colorVariants?.length || 0), 0);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
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
        {totalStock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
        {totalImages > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
            {totalImages} imgs
          </span>
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-3 sm:p-4 flex-col flex-1">
        <Link to={`/accessory/${accessory.slug}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-green-600">
            {accessory.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-1">{accessory.brand}</p>
        
        {/* Models + Colors Count */}
        <div className="flex gap-3 text-[11px] text-gray-400 mb-2">
          <span>{allModels.length} Models</span>
          <span>•</span>
          <span>{totalColors} Colors</span>
        </div>

        {/* RATING */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span>⭐ {accessory.rating || 0}</span>
          <span>({accessory.numReviews || 0})</span>
        </div>
        
        {/* PRICE - SHOW RANGE IF DIFFERENT PER COLOR/MODEL */}
        <div className="flex items-center gap-2 mt-auto mb-3">
          <span className="text-lg sm:text-xl font-bold text-green-600">
            ${hasRange? `${finalMinPrice.toFixed(2)} - ${finalMaxPrice.toFixed(2)}` : finalMinPrice.toFixed(2)}
          </span>
          {discountValue > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${hasRange? `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}` : minPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* BUTTONS */}
        <button 
          onClick={() => onAddToCart(accessory)} // pass whole accessory, user will select model + color on detail page
          disabled={totalStock === 0}
          className={`w-full py-2 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition
            ${totalStock === 0 
           ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          <FaShoppingCart /> 
          {totalStock === 0? 'Out of Stock' : 'Select Options'}
        </button>
      </div>
    </div>
  );
};

export default AccessoryCard;