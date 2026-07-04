import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { removeFromCart, updateCartQty } from '../slices/cartSlice';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaChevronDown, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CartScreen() {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkoutHandler = () => {
    if (!userInfo) {
      toast.info('Please sign in to checkout');
      navigate('/login?redirect=/shipping');
    } else {
      navigate('/shipping');
    }
  };

  const removeFromCartHandler = (item) => {
    dispatch(removeFromCart({
      product: item.product,
      color: item.color,
      storage: item.storage,
    }));
  };

  const updateQtyHandler = (item, qty) => {
    dispatch(updateCartQty({
      product: item.product,
      color: item.color,
      storage: item.storage,
      qty: Number(qty),
    }));
  };

  const cartSubtotal = cartItems?.reduce((acc, item) => acc + item.qty * Number(item.price || 0), 0);
  const cartItemsCount = cartItems?.reduce((acc, item) => acc + item.qty, 0);

  //drop down qty 
  // V34.37 KEY: Reusable Dropdown - Works Mobile + Desktop
const CustomDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => ref.current &&!ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-20 "> 
      <button
        type="button"
        disabled={options.length === 0}
        onClick={() => setOpen(!open)}
        className='flex items-center justify-between border rounded-lg gap-1 px-3 h-10 w-full border-gray-300 rounded-md bg-white shadow-sm font-medium text-sm text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed'
      >
        <span>{value}</span>
        <FaChevronDown className={`text-gray-500 transition-transform text-xs ${open? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto 
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm font-medium text-gray-900 hover:bg-blue-50 ${Number(value) === Number(opt)? 'bg-blue-50 text-blue-600' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

  return (
    <>
      <Helmet>
        <title>Cart | Phone-Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen bg-gray-50">
        <h1 className="text-xl lg:text-3xl font-bold mb-4 lg:mb-6 text-gray-900">Shopping Cart</h1>

        {cartItems?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm">
            <FaShoppingCart className="text-gray-300 text-6xl mb-6" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6 max-w-md px-4">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> {/* V16.6 KEY: 1 col mobile, 3 col desktop */}

            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.product}-${item.color}-${item.storage}`} className="flex flex-col p-3 lg:p-4 border-gray-200 rounded-xl bg-white shadow-sm">

                  {/* TOP: Image + Info Row */}
                  <div className="flex gap-4">
                    {/* V16.6 KEY: FIXED SMALL IMAGE ON MOBILE */}
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-lg bg-white border-gray-200 p-1 flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 flex-col">
                      <Link to={`/product/${item.slug || item.product}`} className="hover:underline">
                        <h2 className="font-bold text-gray-900 text-base leading-tight">
                          {item.name}{item.storage ? ` - ${item.storage}` : ''}
                        </h2>
                      </Link>
                      <p className="text-xs text-gray-600 mt-1">Color: <span className="font-medium">{item.color || 'Default'}</span></p>
                      <p className="text-xs text-gray-600">Storage: <span className="font-medium">{item.storage || 'N/A'}</span></p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ${Number(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM: Qty + Remove FULL WIDTH ROW */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"> {/* V16.6 KEY */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Qty</label>
<CustomDropdown
  value={item.qty}
  onChange={(val) => updateQtyHandler(item, Number(val))}
  options={Array.from({ length: Math.min(item.countInStock, 10) }, (_, i) => i + 1)}
/>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      onClick={() => removeFromCartHandler(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-gray-200 rounded-xl p-5 shadow-sm lg:sticky lg:top-6">
                <h2 className="text-lg font-bold mb-4 pb-3 border-b border-gray-200 text-gray-900">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItemsCount} items)</span>
                    <span className="font-semibold text-gray-900">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={checkoutHandler}
                  disabled={cartItems.length === 0}
                  className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold transition"
                >
                  Proceed To Checkout
                </button>
                <Link to="/" className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-3 font-semibold">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartScreen;