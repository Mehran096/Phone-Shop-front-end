import { FaShoppingCart, FaBolt, FaHeart } from "react-icons/fa";

const StickyPurchaseBar = ({
  addToCartHandler,
  buyNowHandler,
  wishlistHandler,
  isInWishlist,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
      <div className="max-w-7xl mx-auto p-3">
        <div className="flex items-center gap-2">

          {/* Wishlist */}
          <button
            onClick={wishlistHandler}
            className={`h-12 w-12 rounded-lg border flex items-center justify-center transition ${
              isInWishlist
                ? "bg-red-50 border-red-500 text-red-500"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaHeart />
          </button>

          {/* Add to Cart */}
          <button
            onClick={addToCartHandler}
            className="flex-1 h-12 rounded-lg bg-yellow-400 hover:bg-yellow-500 font-semibold text-black flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            <span>Add to Cart</span>
          </button>

          {/* Buy Now */}
          <button
            onClick={buyNowHandler}
            className="flex-1 h-12 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold flex items-center justify-center gap-2"
          >
            <FaBolt />
            <span>Buy Now</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default StickyPurchaseBar;