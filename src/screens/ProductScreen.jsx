import { useEffect } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProductDetails } from '../slices/productSlice'
import { addToCart } from '../slices/cartSlice';

function ProductScreen() {
    const [qty, setQty] = useState(1);
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading, error } = useSelector((state) => state.products);

   useEffect(() => {
  dispatch(getProductDetails(id))
}, [dispatch, id])

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty }));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!product || !product.name) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full object-contain" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-2">{product.brand}</p>
                    <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
                    <p className="mb-4">{product.description}</p>
                    <div className="mb-4">
                        <span className="font-semibold">Rating:</span> {product.rating} ({product.numReviews} reviews)
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Stock:</span> {product.countInStock}
                    </div>
                    {/* selector */}
                    {product.countInStock > 0 && (
                        <div className="flex items-center mb-4">
                            <span className="mr-2">Qty:</span>
                            <select
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                className="border rounded px-2 py-1"
                            >
                                {[...Array(product.countInStock).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                        {x + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* selector */}
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        onClick={addToCartHandler}
                        disabled={product.countInStock === 0}
                    >
                        {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductScreen;