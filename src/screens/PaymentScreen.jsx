import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../slices/cartSlice';
 
function PaymentScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const [paymentMethod, setPaymentMethod] = useState('Stripe');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder'); // Next screen
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="border rounded p-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="Stripe"
              checked={paymentMethod === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Stripe or Credit Card</span>
          </label>
        </div>
        
        <div className="border rounded p-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="Cash on Delivery"
              checked={paymentMethod === 'Cash on Delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Cash on Delivery</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default PaymentScreen;