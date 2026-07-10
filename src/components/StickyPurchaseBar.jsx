import { FaShoppingCart, FaBolt } from "react-icons/fa";
import WishlistButton from "./WishlistButton";
//import CustomDropdown from "./CustomDropdown";

const StickyPurchaseBar = ({
  product,
  selectedColor,
  selectedVariant,
  qty,
  setQty,
  addToCartHandler,
  buyNowHandler,
}) => {
  return (
    // <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
  <div className="max-w-7xl mx-auto px-2 py-1.5 flex items-center gap-2">
        

          {/* Wishlist */}
          <WishlistButton
  product={product}
  selectedColor={selectedColor}
  selectedStorage={selectedVariant?.storage}
  selectedPrice={selectedVariant?.price}
  selectedImage={selectedColor?.images?.[0]?.url}
  countInStock={selectedVariant?.countInStock}
  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 bg-white flex-shrink-0"
  showText={false}
/>
{/* Only show these when in stock */}
{(selectedColor?.countInStock ?? selectedVariant?.countInStock ?? 0) > 0 && (
  <>
    {/* Add to Cart */}
    <button
      onClick={addToCartHandler}
      className="flex-1 h-10 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] font-semibold flex items-center justify-center 
      gap-1.5 transition"
    >
      <FaShoppingCart size={15} />
      Add to Cart
    </button>

    {/* Buy Now */}
    <button
      onClick={buyNowHandler}
      className="flex-1 h-10 rounded-xl bg-[#111827] hover:bg-black text-white font-semibold flex items-center justify-center 
      gap-1.5 transition"
    >
      <FaBolt size={15} />
      Buy Now
    </button>
  </>
)}
        </div>
      </div>
     
  );
};

export default StickyPurchaseBar;