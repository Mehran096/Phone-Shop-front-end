import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateProductMutation } from '../../slices/productsApiSlice'
import { FaTrash, FaPlus } from 'react-icons/fa'
import Loader from '../../components/Loader'
import { toast } from 'react-toastify'

const ProductCreateScreen = () => {
  const navigate = useNavigate()
  const [createProduct, { isLoading }] = useCreateProductMutation()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  const [colors, setColors] = useState([{ name: '', images: [], files: [] }])
  const [specs, setSpecs] = useState([{ key: '', value: '' }])

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const addColorHandler = () => {
    setColors([...colors, { name: '', images: [], files: [] }])
  }

  const removeColorHandler = (index) => {
    const newColors = colors.filter((_, i) => i!== index)
    setColors(newColors)
  }

  const handleColorChange = (index, field, value) => {
    const newColors = [...colors]
    newColors[index][field] = value
    setColors(newColors)
  }

  const handleColorFileChange = (index, e) => {
    const newColors = [...colors]
    newColors[index].files = Array.from(e.target.files)
    setColors(newColors)
  }

  const addSpecHandler = () => {
    setSpecs([...specs, { key: '', value: '' }])
  }

  const removeSpecHandler = (index) => {
    const newSpecs = specs.filter((_, i) => i!== index)
    setSpecs(newSpecs)
  }

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const submitHandler = async (e) => {
  e.preventDefault()
  const formData = new FormData()
  formData.append('name', name)
  formData.append('price', price)
  formData.append('brand', brand)
  formData.append('category', category)
  formData.append('countInStock', countInStock)
  formData.append('description', description)
  formData.append('colors', JSON.stringify(colors)) // Must send this, even if []
  formData.append('specs', JSON.stringify(specs)) // Same here
  
  // Add color images
  colors.forEach((color, idx) => {
    color.files?.forEach(file => {
      formData.append(`colorImages-${idx}`, file)
    })
  })
  
  try {
    await createProduct(formData).unwrap()
    toast.success('Product created')
    navigate('/admin/productlist')
  } catch (err) {
    toast.error(err?.data?.message || err.error)
  }
}

  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <Link to='/admin/productlist' className='text-blue-600 hover:text-blue-800 mb-4 inline-block'>
        ← Go Back
      </Link>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-3xl font-bold mb-6'>Create Product</h1>

        {isLoading && <Loader />}

        <form onSubmit={submitHandler} className='space-y-4'>
          <div>
            <label className={labelClass}>Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Price</label>
              <input
                type='number'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Count In Stock</label>
              <input
                type='number'
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Brand</label>
              <input
                type='text'
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input
                type='text'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows='4'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {/* Colors */}
          <div className='border-t pt-4'>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='text-lg font-semibold'>Colors & Images</h3>
              <button
                type='button'
                onClick={addColorHandler}
                className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1'
              >
                <FaPlus /> Add Color
              </button>
            </div>
            {colors.map((color, index) => (
              <div key={index} className='border p-3 rounded mb-3 bg-gray-50'>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-medium'>Color {index + 1}</span>
                  {colors.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeColorHandler(index)}
                      className='text-red-600 hover:text-red-800'
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <input
                  type='text'
                  placeholder='Color name e.g. Space Black'
                  value={color.name}
                  onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                  className={`${inputClass} mb-2`}
                  required
                />
                <input
                  type='file'
                  multiple
                  onChange={(e) => handleColorFileChange(index, e)}
                  className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                  accept='image/*'
                />
                {color.files.length > 0 && (
                  <p className='text-xs text-gray-600 mt-1'>{color.files.length} file(s) selected</p>
                )}
              </div>
            ))}
          </div>

          {/* Specs */}
          <div className='border-t pt-4'>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='text-lg font-semibold'>Specifications</h3>
              <button
                type='button'
                onClick={addSpecHandler}
                className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1'
              >
                <FaPlus /> Add Spec
              </button>
            </div>
            {specs.map((spec, index) => (
              <div key={index} className='flex gap-2 mb-2'>
                <input
                  type='text'
                  placeholder='Key e.g. Display'
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  className={inputClass}
                />
                <input
                  type='text'
                  placeholder='Value e.g. 6.7 inch OLED'
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  className={inputClass}
                />
                {specs.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeSpecHandler(index)}
                    className='px-3 text-red-600 hover:text-red-800'
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold'
          >
            {isLoading? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProductCreateScreen