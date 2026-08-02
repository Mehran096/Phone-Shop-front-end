import { Link } from 'react-router-dom';

const AccessoryCard = ({ accessory }) => {
  const discountPercent = accessory.discount?.percentage || 0;
  const finalPrice = discountPercent > 0 
   ? accessory.price * (1 - discountPercent / 100) 
    : accessory.price;

  const thumbnail = accessory.images?.[0]?.url || '/placeholder.jpg'; // <- FIX HERE

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      
      {/* IMAGE */}
      <Link to={`/accessory/${accessory.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={thumbnail}
            alt={accessory.name}
            loading="lazy"
            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </span>
          )}
          {accessory.countInStock === 0 && (
            <span className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {/* Image count badge */}
          {accessory.images?.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
              {accessory.images.length} imgs
            </span>
          )}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1 truncate">{accessory.brand}</p>
        
        <Link to={`/accessory/${accessory.slug}`}>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-10 hover:text-blue-600">
            {accessory.name}
          </h3>
        </Link>

        {/* COMPATIBLE TAGS - will be real names after populate */}
        <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
          {accessory.compatibleWith?.slice(0, 2).map((item, i) => (
            <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {item.name || 'Compatible'} {/* shows name if populated, else fallback */}
            </span>
          ))}
          {accessory.compatibleWith?.length > 2 && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              +{accessory.compatibleWith.length - 2}
            </span>
          )}
        </div>

        {/* PRICE */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">Rs {finalPrice.toFixed(0)}</span>
          {discountPercent > 0 && (
            <span className="text-sm text-gray-400 line-through">Rs {accessory.price}</span>
          )}
        </div>

        {/* BUTTON */}
        <button 
          disabled={accessory.countInStock === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition"
        >
          {accessory.countInStock > 0? 'Add To Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  )
}

export default AccessoryCard