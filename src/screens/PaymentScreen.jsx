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
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Payment Method</h1>

        <form onSubmit={submitHandler} className="space-y-4">
          
          {/* Stripe Option */}
          <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="Stripe"
              checked={paymentMethod === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-gray-700 font-medium">Stripe or Credit Card</span>
          </label>

          {/* Cash on Delivery Option */}
          <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={paymentMethod === 'Cash on Delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-gray-700 font-medium">Cash on Delivery</span>
          </label>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-slate-700 text-white py-2.5 px-4 rounded-md font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition duration-200"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentScreen;