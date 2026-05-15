import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  listProducts,
  deleteProduct,
  createProduct,
  resetProductCreate,
  resetProductDelete
} from '../../slices/productSlice'

const ProductListScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    products,
    product,
    loading,
    error,
    successDelete,
    successCreate
  } = useSelector((state) => state.products)

  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!userInfo?.isAdmin) {
      navigate('/login')
    }

    if (successCreate) {
      dispatch(resetProductCreate())
      navigate(`/admin/product/${products._id}/edit`)
    }

    if (successDelete) {
      dispatch(resetProductDelete())
    }

    if (!successCreate) {
      dispatch(listProducts())
    }
  }, [dispatch, navigate, userInfo, successCreate, successDelete, product])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id))
    }
  }

  const createProductHandler = () => {
    dispatch(createProduct())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        {/* <button
          onClick={createProductHandler}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Create Product
        </button> */}
        <Link
          to="/admin/product/create"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Create Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRICE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CATEGORY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BRAND
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteHandler(product._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductListScreen