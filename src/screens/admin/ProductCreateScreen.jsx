import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createProduct, resetProductCreate } from '../../slices/productSlice'

const ProductCreateScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')

  const { loading, error, successCreate, product } = useSelector((state) => state.products)

  useEffect(() => {
    if (successCreate) {
      dispatch(resetProductCreate())
      navigate('/admin/productlist')
    }
  }, [successCreate, dispatch, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    //console.log('Sending:', { name, price, image, brand, category, countInStock, description }) // debug
    dispatch(
      createProduct({
        name,
        price: Number(price),
        image,
        brand,
        category,
        countInStock: Number(countInStock),
        description,
      })
    )
  }

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
const labelClass = "block text-sm font-medium text-gray-700"

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/admin/productlist" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Go Back
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Create Product</h1>

        {loading && <div className="text-center py-10">Loading...</div>}
        {error && (
          <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            className= {inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className= {inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className= {inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className= {inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className= {inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Count In Stock</label>
            <input
              type="number"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              className= {inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className= {inputClass}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            Create Product
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProductCreateScreen