import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateProductMutation } from '../../slices/productsApiSlice'
import { FaTrash, FaPlus } from 'react-icons/fa'
import Loader from '../../components/Loader'
import { toast } from 'react-toastify'

const ProductCreateScreen = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState('')
  const [description, setDescription] = useState('')
  
  const [specs, setSpecs] = useState({
    storage: '',
    ram: '',
    display: '',
    battery: '',
    camera: ''
  })

  const [colors, setColors] = useState([{
    name: '',
    hexCode: '',
    countInStock: '',
    price: '',
    files: []
  }])

  const [createProduct, { isLoading }] = useCreateProductMutation()

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const addColorHandler = () => {
    setColors([...colors, { name: '', hexCode: '', countInStock: '', price: '', files: [] }])
  }

  const removeColorHandler = (index) => {
    setColors(colors.filter((_, i) => i!== index))
  }

  const handleColorChange = (index, field, value) => {
    const newColors = [...colors]
    newColors[index][field] = value
    setColors(newColors)
  }

  const handleColorImageChange = (index, files) => {
    const newColors = [...colors]
    newColors[index].files = Array.from(files)
    setColors(newColors)
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    const invalidColor = colors.find(c => c.name &&!c.hexCode)
    if (invalidColor) {
      toast.error(`Hex code required for color: ${invalidColor.name}`)
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    formData.append('brand', brand)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('countInStock', countInStock)
    formData.append('specs', JSON.stringify(specs))

    const colorsData = colors.map(c => ({
      name: c.name,
      hexCode: c.hexCode,
      countInStock: Number(c.countInStock) || 0,
      price: Number(c.price) || 0,
    }))
    formData.append('colors', JSON.stringify(colorsData))

    colors.forEach((color, idx) => {
      color.files?.forEach(file => {
        formData.append(`colorImages-${idx}`, file)
      })
    })

    try {
      await createProduct(formData).unwrap()
      toast.success('Product created successfully')
      navigate('/admin/productlist')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-3xl'>
      <Link to='/admin/productlist' className='text-blue-600 hover:underline mb-4 inline-block'>
        ← Go Back
      </Link>
      
      <h1 className='text-3xl font-bold mb-6'>Create Product</h1>
      
      {isLoading && <Loader />}

      <form onSubmit={submitHandler} className='max-w-4xl bg-white p-6 rounded-lg shadow'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
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
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
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

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
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

        <div className='mb-6'>
          <label className={labelClass}>Description</label>
          <textarea
            rows='4'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Product Specifications */}
        <div className='border-t pt-6 mt-6'>
          <h3 className='text-lg font-semibold mb-4'>Specifications</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Storage</label>
              <input
                type='text'
                placeholder='e.g. 512GB'
                value={specs.storage}
                onChange={(e) => setSpecs({...specs, storage: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>RAM</label>
              <input
                type='text'
                placeholder='e.g. 16GB'
                value={specs.ram}
                onChange={(e) => setSpecs({...specs, ram: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Display</label>
              <input
                type='text'
                placeholder='e.g. 6.7 inch AMOLED 120Hz'
                value={specs.display}
                onChange={(e) => setSpecs({...specs, display: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Battery</label>
              <input
                type='text'
                placeholder='e.g. 5000mAh'
                value={specs.battery}
                onChange={(e) => setSpecs({...specs, battery: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Camera</label>
              <input
                type='text'
                placeholder='e.g. 50MP Triple'
                value={specs.camera}
                onChange={(e) => setSpecs({...specs, camera: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Colors & Images */}
        <div className='border-t pt-6 mt-6'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='text-lg font-semibold'>Colors & Images</h3>
            <button 
              type='button' 
              onClick={addColorHandler} 
              className='px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2'
            >
              <FaPlus /> Add Color
            </button>
          </div>
          {colors.map((color, index) => (
            <div key={index} className='border border-gray-200 rounded-lg p-4 mb-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
                <input
                  type='text'
                  placeholder='Color name e.g. Space Black'
                  value={color.name}
                  onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type='text'
                  placeholder='Hex code e.g. #000000'
                  value={color.hexCode}
                  onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type='number'
                  placeholder='Stock'
                  value={color.countInStock}
                  onChange={(e) => handleColorChange(index, 'countInStock', e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <input
                type='number'
                placeholder='Price for this color'
                value={color.price}
                onChange={(e) => handleColorChange(index, 'price', e.target.value)}
                className={`${inputClass} mb-3`}
              />
              <input
                type='file'
                multiple
                onChange={(e) => handleColorImageChange(index, e.target.files)}
                className='w-full mb-2'
              />
              {colors.length > 1 && (
                <button 
                  type='button' 
                  onClick={() => removeColorHandler(index)} 
                  className='text-red-600 hover:text-red-800 flex items-center gap-1'
                >
                  <FaTrash /> Remove Color
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          type='submit' 
          disabled={isLoading}
          className='w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50'
        >
          {isLoading? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}

export default ProductCreateScreen