import { Link } from 'react-router-dom'

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <nav className="flex justify-center mb-8">
      <div className="flex space-x-2 md:space-x-4">
        <div className={`flex items-center ${step1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/login" className={step1 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Sign In</span>
            <span className="md:hidden">1</span>
          </Link>
        </div>
        <span className="text-gray-400">{'>'}</span>
        <div className={`flex items-center ${step2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/shipping" className={step2 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Shipping</span>
            <span className="md:hidden">2</span>
          </Link>
        </div>
        <span className="text-gray-400">{'>'}</span>
        <div className={`flex items-center ${step3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/payment" className={step3 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Payment</span>
            <span className="md:hidden">3</span>
          </Link>
        </div>
        <span className="text-gray-400">{'>'}</span>
        <div className={`flex items-center ${step4 ? 'text-blue-600' : 'text-gray-400'}`}>
          <Link to="/placeorder" className={step4 ? 'hover:text-blue-800' : 'pointer-events-none'}>
            <span className="hidden md:inline">Place Order</span>
            <span className="md:hidden">4</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default CheckoutSteps