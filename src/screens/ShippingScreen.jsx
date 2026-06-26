import { useState } from 'react';
import { Helmet } from 'react-helmet-async'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../slices/cartSlice';
import PhoneInput from 'react-phone-number-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import CheckoutSteps from '../components/CheckoutSteps';
import { toast } from 'react-toastify'

 

function ShippingScreen() {
  const cart = useSelector((state) => state.cart);
  //const { loading } = useSelector((state) => state.order)
  const { shippingAddress } = cart;
  const { userInfo } = useSelector((state) => state.auth)


  const [phone, setPhone] = useState(shippingAddress?.phone || '')
  const [phoneError, setPhoneError] = useState('')
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

 const submitHandler = (e) => {
  e.preventDefault();

  // 1. Check if phone is empty
  if (!phone || phone.trim() === '') {
    toast.error('Phone number is required');
    return; // Stop here, don't save/navigate
  }

  // 2. Check if phone format is valid for Pakistan
  if (!isValidPhoneNumber(phone)) {
    toast.error('Please enter a valid phone number');
    return; // Stop here
  }

  // 3. If validation passes, save and continue
  dispatch(saveShippingAddress({
    phone,
    address,
    city,
    postalCode,
    country,
    name: userInfo.name,
    email: userInfo.email
  }));
  navigate('/payment'); // Next step
};

  // if (loading) {
  //   return (
  //     <div className='flex justify-center items-center h-64'>
  //       <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
  //     </div>
  //   )
  // }

  return (
    <>
     <Helmet>
  <title>Shipping | Phone-Store</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
     
     <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <CheckoutSteps step1 step2 />
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        

        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Shipping</h1>

        <form onSubmit={submitHandler} className="space-y-4">
          {/* Phone Number */}
          <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            international
            defaultCountry="PK"
            value={phone}
            onChange={setPhone}
            className={`phone-input ${phoneError ? 'border-red-500' : ''}`}
            id="phone"
          />
          {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
          )}
        </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter address"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter postal code"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter country"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Continue
          </button>
        </form>
      </div>
       </div>
    </div>
    </>
  );
}

export default ShippingScreen;