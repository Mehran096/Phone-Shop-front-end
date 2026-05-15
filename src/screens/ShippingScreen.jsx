import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../slices/cartSlice';

function ShippingScreen() {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment'); // Next step
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Shipping</h1>
      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter address"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">City</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter city"
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Postal Code</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter postal code"
            value={postalCode}
            required
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Country</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter country"
            value={country}
            required
            onChange={(e) => setCountry(e.target.value)}
          />
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

export default ShippingScreen;