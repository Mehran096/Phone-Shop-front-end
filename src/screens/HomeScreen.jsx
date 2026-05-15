import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../slices/productSlice'
import { Link } from 'react-router-dom';

function HomeScreen() {
  const dispatch = useDispatch();
  const {  products, loading, error } = useSelector((state) => state.products);
  //console.log( { products, loading, error })

 useEffect(() => {
  dispatch(listProducts())
}, [dispatch])

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Latest Phones</h1>
      {products && products.length === 0 ? (
  <div className="text-center py-20">
    <p className="text-gray-500 text-lg">No products found</p>
  </div>
) :(
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {products?.map((product) => (
          <Link to={`/product/${product._id}`} key={product._id}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4"/>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                  <span className="text-sm text-gray-500">Stock: {product.countInStock}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
)}
    </div>
  );
}

export default HomeScreen;