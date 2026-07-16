import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCompare, removeFromCompare } from '../slices/compareSlice';

const CompareBar = () => {
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.compare);

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

        <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">

          {products.map((product) => (
            <div
              key={product._id}
              className="flex w-56 sm:w-64 flex-shrink-0 justify-end gap-2 w-full lg:w-auto items-center bg-gray-100 rounded-lg px-3 py-2"
            >
              <img
                src={product.defaultImage}
                alt={product.name}
                className="w-12 h-12 object-contain"
              />

              <div>
                <p className="text-sm font-medium line-clamp-1">
                  {product.name}
                </p>

                <button
                  onClick={() =>
                    dispatch(removeFromCompare(product._id))
                  }
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

        </div>

        <div className="flex gap-3">

          <button
            onClick={() => dispatch(clearCompare())}
            className="px-4 py-2 border rounded-lg"
          >
            Clear
          </button>

          <Link
            to="/compare"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white"
          >
            Compare ({products.length})
          </Link>

        </div>

      </div>
    </div>
  );
};

export default CompareBar;