import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../slices/cartSlice';
import { updateCartQty } from '../slices/cartSlice';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CartScreen() {
const { cartItems } = useSelector((state) => state.cart);
const { userInfo } = useSelector((state) => state.auth)
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const checkoutHandler = () => {
    if (!userInfo) {
      toast.info('Please sign in to checkout')
      navigate('/login?redirect=/shipping') // <- Login wall moved here
    } else {
      navigate('/shipping')
    }
  }


  const removeFromCartHandler = (item) => {
  dispatch(removeFromCart({ 
    product: item.product, // <- This is the product ID you stored in cart
    color: item.color 
  }));
};

  const updateQtyHandler = (item, qty) => {
  dispatch(updateCartQty({ 
    product: item.product, 
    color: item.color, 
    qty: Number(qty) 
  }));
};


  const cartSubtotal = cartItems?.reduce((acc, item) => acc + item.qty * item.price, 0);
  const cartItemsCount = cartItems?.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

      {cartItems?.length === 0 ? (
        <p>
          Your cart is empty <Link to="/" className="text-blue-600 hover:underline">Go Back</Link>
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems?.map((item, index) => (
              <div key={`${item.product}-${item.color}`} className="flex justify-between items-center border p-4 rounded">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                  <div>
                    <Link to={`/product/${item.product}`} className="font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">${item.price}</p>
                      <select
                        value={item.qty}
                        onChange={(e) => updateQtyHandler(item, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCartHandler(item)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl mb-2">
              Subtotal ({cartItemsCount}) items: ${cartSubtotal.toFixed(2)}
            </h2>
            <button
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
              className="w-full bg-gray-800 text-white py-2 rounded disabled:bg-gray-400"
            >
              Proceed To Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartScreen;