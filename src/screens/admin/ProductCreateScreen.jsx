import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaPlus, FaTrash, FaTimes, FaGripVertical } from 'react-icons/fa'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useCreateProductMutation } from '../../slices/productsApiSlice'
import { toast } from 'react-toastify'
import Loader from '../../components/Loader'

const ProductCreateScreen = () => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  const [specs, setSpecs] = useState({
    storage: '', ram: '', display: '', battery: '', camera: ''
  })
  const [colors, setColors] = useState([
    { name: '', hexCode: '', price: 0, countInStock: 0, files: [], previews: [] }
  ])

  const [createProduct, { isLoading }] = useCreateProductMutation()
  const navigate = useNavigate()

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  // Create preview URLs when files change
  useEffect(() => {
    const newColors = colors.map(color => {
      const previews = color.files.map(file => URL.createObjectURL(file))
      return {...color, previews }
    })

    // Only update if previews actually changed to avoid infinite loop
    if (JSON.stringify(newColors.map(c => c.previews))!== JSON.stringify(colors.map(c => c.previews))) {
      setColors(newColors)
    }

    // Cleanup URLs on unmount
    return () => {
      colors.forEach(color => {
        color.previews?.forEach(url => URL.revokeObjectURL(url))
      })
    }
  }, [colors.map(c => c.files).flat().length])

  const addColorHandler = () => {
    setColors([...colors, { name: '', hexCode: '', price: 0, countInStock: 0, files: [], previews: [] }])
  }

  const removeColorHandler = (index) => {
    colors[index].previews?.forEach(url => URL.revokeObjectURL(url))
    setColors(colors.filter((_, i) => i!== index))
  }

  const handleColorChange = (index, field, value) => {
    const newColors = [...colors]
    newColors[index][field] = value
    setColors(newColors)
  }

  const handleColorImageChange = (index, files) => {
    const newColors = [...colors]
    newColors[index].files = [...newColors[index].files,...Array.from(files)]
    setColors(newColors)
  }

  const removeImageHandler = (colorIndex, fileIndex) => {
    const newColors = [...colors]
    URL.revokeObjectURL(newColors[colorIndex].previews[fileIndex])
    newColors[colorIndex].files.splice(fileIndex, 1)
    newColors[colorIndex].previews.splice(fileIndex, 1)
    setColors(newColors)
  }

  const onDragEnd = (result, colorIndex) => {
    if (!result.destination) return
    const newColors = [...colors]
    const items = Array.from(newColors[colorIndex].files)
    const previewItems = Array.from(newColors[colorIndex].previews)

    const [reorderedFile] = items.splice(result.source.index, 1)
    const [reorderedPreview] = previewItems.splice(result.source.index, 1)

    items.splice(result.destination.index, 0, reorderedFile)
    previewItems.splice(result.destination.index, 0, reorderedPreview)

    newColors[colorIndex].files = items
    newColors[colorIndex].previews = previewItems
    setColors(newColors)
  }

  const handleSpecsChange = (field, value) => {
    setSpecs({...specs, [field]: value })
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
    formData.append('specs', JSON.stringify(specs))

    const colorsData = colors.map(({ files, previews,...rest }) => rest)
    formData.append('colors', JSON.stringify(colorsData))

    colors.forEach((color, index) => {
      color.files.forEach(file => {
        formData.append(`colorImages-${index}`, file)
      })
    })

    try {
      await createProduct(formData).unwrap()
      toast.success('Product Created')
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

        <div className='mb-4'>
          <label className={labelClass}>Category</label>
          <input
            type='text'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className='mb-4'>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} h-24`}
            required
          />
        </div>

        {/* Specs */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-3'>Specifications</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Storage</label>
              <input
                type='text'
                value={specs.storage}
                onChange={(e) => handleSpecsChange('storage', e.target.value)}
                className={inputClass}
                placeholder='e.g. 256GB'
              />
            </div>
            <div>
              <label className={labelClass}>RAM</label>
              <input
                type='text'
                value={specs.ram}
                onChange={(e) => handleSpecsChange('ram', e.target.value)}
                className={inputClass}
                placeholder='e.g. 8GB'
              />
            </div>
            <div>
              <label className={labelClass}>Display</label>
              <input
                type='text'
                value={specs.display}
                onChange={(e) => handleSpecsChange('display', e.target.value)}
                className={inputClass}
                placeholder='e.g. 6.7 inch OLED'
              />
            </div>
            <div>
              <label className={labelClass}>Battery</label>
              <input
                type='text'
                value={specs.battery}
                onChange={(e) => handleSpecsChange('battery', e.target.value)}
                className={inputClass}
                placeholder='e.g. 5000mAh'
              />
            </div>
            <div>
              <label className={labelClass}>Camera</label>
              <input
                type='text'
                value={specs.camera}
                onChange={(e) => handleSpecsChange('camera', e.target.value)}
                className={inputClass}
                placeholder='e.g. 108MP'
              />
            </div>
          </div>
        </div>

        {/* Colors & Images */}
        <div className='mt-8'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-semibold'>Colors & Images</h3>
            <button
              type='button'
              onClick={addColorHandler}
              className='px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2'
            >
              <FaPlus /> Add Color
            </button>
          </div>

          {colors.map((color, colorIndex) => (
            <div key={colorIndex} className='border border-gray-200 rounded-lg p-4 mb-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
                <input
                  type='text'
                  placeholder='Color name e.g. Space Black'
                  value={color.name}
                  onChange={(e) => handleColorChange(colorIndex, 'name', e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type='text'
                  placeholder='Hex code e.g. #000000'
                  value={color.hexCode}
                  onChange={(e) => handleColorChange(colorIndex, 'hexCode', e.target.value)}
                  className={inputClass}
                  required
                />
                <input
                  type='number'
                  placeholder='Stock'
                  value={color.countInStock}
                  onChange={(e) => handleColorChange(colorIndex, 'countInStock', e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <input
                type='number'
                placeholder='Price for this color'
                value={color.price}
                onChange={(e) => handleColorChange(colorIndex, 'price', e.target.value)}
                className={`${inputClass} mb-3`}
              />

              <input
                type='file'
                multiple
                accept='image/*'
                onChange={(e) => handleColorImageChange(colorIndex, e.target.files)}
                className='w-full mb-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              />

              {/* Image Previews with Drag Drop */}
              <DragDropContext onDragEnd={(result) => onDragEnd(result, colorIndex)}>
                <Droppable droppableId={`images-${colorIndex}`} direction='horizontal'>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className='flex flex-wrap gap-3 mb-3 min-h-[100px] p-2 bg-gray-50 rounded'
                    >
                      {color.previews?.map((preview, fileIndex) => (
                        <Draggable
                          key={preview}
                          draggableId={`${colorIndex}-${fileIndex}`}
                          index={fileIndex}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative group ${snapshot.isDragging? 'opacity-70' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className='absolute top-1 left-1 bg-white/80 p-1 rounded cursor-grab'>
                                <FaGripVertical className='text-gray-600 text-xs' />
                              </div>
                              <img
                                src={preview}
                                alt='preview'
                                className='w-24 h-24 object-cover rounded border'
                              />
                              <button
                                type='button'
                                onClick={() => removeImageHandler(colorIndex, fileIndex)}
                                className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition'
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {colors.length > 1 && (
                <button
                  type='button'
                  onClick={() => removeColorHandler(colorIndex)}
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