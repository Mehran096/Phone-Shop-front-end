import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useGetProductDetailsQuery, useUpdateProductMutation } from '../../slices/productsApiSlice'
import { FaTrash, FaPlus, FaTimes, FaGripVertical } from 'react-icons/fa'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import { toast } from 'react-toastify'

const ProductEditScreen = () => {
  const { id: productId } = useParams()
  const navigate = useNavigate()

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId)
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation()

  const [name, setName] = useState('')
  //const [price, setPrice] = useState(0)
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [colors, setColors] = useState([])
  // const [specs, setSpecs] = useState([{ key: '', value: '' }])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [draggedImage, setDraggedImage] = useState(null)
  const [specs, setSpecs] = useState({
    storage: '',
    ram: '',
    display: '',
    battery: '',
    camera: ''
  })


  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  useEffect(() => {
    if (product) {
      setName(product.name)
      //setPrice(product.price)
      setBrand(product.brand)
      setCategory(product.category)
      setDescription(product.description)
      setSpecs(product.specs?.length ? product.specs : [{ key: '', value: '' }])
      setColors(product.colors?.length ? product.colors.map(c => ({ ...c, files: [], filePreviews: [] })) : [])

      setSpecs({
        storage: product.specs?.storage || '',
        ram: product.specs?.ram || '',
        display: product.specs?.display || '',
        battery: product.specs?.battery || '',
        camera: product.specs?.camera || ''
      })
    }
  }, [product])

  useEffect(() => {
    return () => {
      colors.forEach(color => {
        color.filePreviews?.forEach(url => URL.revokeObjectURL(url))
      })
    }
  }, [colors])

  const addColorHandler = () => {
    setColors([...colors, { name: '', hexCode: '', countInStock: 0, price: 0, images: [], imagePublicIds: [], files: [], filePreviews: [] }])
  }

  const removeColorHandler = (index) => {
    const color = colors[index]
    if (color.imagePublicIds?.length) {
      setImagesToDelete(prev => [...prev, ...color.imagePublicIds])
    }
    color.filePreviews?.forEach(url => URL.revokeObjectURL(url))
    setColors(colors.filter((_, i) => i !== index))
  }

  const handleColorChange = (index, field, value) => {
    setColors(prevColors => {
      const newColors = [...prevColors]
      newColors[index] = { ...newColors[index], [field]: value }
      return newColors
    })
  }

  const handleColorFileChange = (index, e) => {
    const files = Array.from(e.target.files)
    const previews = files.map(file => URL.createObjectURL(file))

    setColors(prevColors => {
      const newColors = [...prevColors]
      newColors[index].filePreviews?.forEach(url => URL.revokeObjectURL(url))
      newColors[index] = {
        ...newColors[index],
        files: files,
        filePreviews: previews
      }
      return newColors
    })
  }

  const removeExistingImage = (colorIndex, imgIndex) => {
    const publicId = colors[colorIndex].imagePublicIds[imgIndex]

    if (publicId) {
      setImagesToDelete(prev => [...prev, publicId])
    }

    setColors(prevColors => {
      const newColors = prevColors.map((color, idx) => {
        if (idx !== colorIndex) return color
        return {
          ...color,
          images: color.images.filter((_, i) => i !== imgIndex),
          imagePublicIds: color.imagePublicIds.filter((_, i) => i !== imgIndex)
        }
      })
      return newColors
    })
  }

  // Drag and Drop handlers
  const handleDragStart = (e, colorIndex, imgIndex) => {
    setDraggedImage({ colorIndex, imgIndex })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, colorIndex, dropImgIndex) => {
    e.preventDefault()
    if (!draggedImage || draggedImage.colorIndex !== colorIndex) return
    if (draggedImage.imgIndex === dropImgIndex) return

    setColors(prevColors => {
      const newColors = [...prevColors]
      const color = { ...newColors[colorIndex] }

      // Reorder images array
      const newImages = [...color.images]
      const [movedImage] = newImages.splice(draggedImage.imgIndex, 1)
      newImages.splice(dropImgIndex, 0, movedImage)

      // Reorder publicIds array - must match images order
      const newPublicIds = [...color.imagePublicIds]
      const [movedPublicId] = newPublicIds.splice(draggedImage.imgIndex, 1)
      newPublicIds.splice(dropImgIndex, 0, movedPublicId)

      newColors[colorIndex] = {
        ...color,
        images: newImages,
        imagePublicIds: newPublicIds
      }
      return newColors
    })

    setDraggedImage(null)
  }

  // const addSpecHandler = () => setSpecs([...specs, { key: '', value: '' }])
  // const removeSpecHandler = (index) => setSpecs(specs.filter((_, i) => i !== index))
  // const handleSpecChange = (index, field, value) => {
  //   const newSpecs = [...specs]
  //   newSpecs[index][field] = value
  //   setSpecs(newSpecs)
  // }

  const submitHandler = async (e) => {
    e.preventDefault()

    const invalidColor = colors.find(c => c.name && !c.hexCode)
    if (invalidColor) {
      toast.error(`Hex code required for color: ${invalidColor.name}`)
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    //formData.append('price', price)
    formData.append('brand', brand)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('specs', JSON.stringify(specs))

    const colorsData = colors.map(c => ({
      name: c.name,
      hexCode: c.hexCode,
      countInStock: c.countInStock,
      price: c.price,
      images: c.images,
      imagePublicIds: c.imagePublicIds,
    }))
    formData.append('colors', JSON.stringify(colorsData))

    colors.forEach((color, idx) => {
      color.files?.forEach(file => {
        formData.append(`colorImages-${idx}`, file)
      })
    })

    formData.append('imagesToDelete', JSON.stringify(imagesToDelete))

    // const validSpecs = specs.filter(s => s.key.trim() && s.value.trim())
    // formData.append('specs', JSON.stringify(validSpecs))

    try {
      await updateProduct({ productId, formData }).unwrap()
      toast.success('Product updated')
      refetch()
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
        <h1 className='text-3xl font-bold mb-6'>Edit Product</h1>

        {loadingUpdate && <Loader />}
        {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
          <form onSubmit={submitHandler} className='space-y-4'>
            {/* <div>
              <label className={labelClass}>Name</label>
              <input type='text' value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </div> */}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* <div>
                <label className={labelClass}>Price</label>
                <input type='number' value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required />
              </div> */}
              <div>
              <label className={labelClass}>Name</label>
              <input type='text' value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </div>
            
              <div>
                <label className={labelClass}>Brand</label>
                <input type='text' value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} required />
              </div>
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <input type='text' value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} required />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea rows='4' value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} required />
            </div>

            <div className='border-t pt-4'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='text-lg font-semibold'>Colors & Images</h3>
                <button type='button' onClick={addColorHandler} className='px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1'>
                  <FaPlus /> Add Color
                </button>
              </div>
              {colors.map((color, index) => (
                <div key={index} className='border p-3 rounded mb-3 bg-gray-50'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium'>Color {index + 1}</span>
                    <button type='button' onClick={() => removeColorHandler(index)} className='text-red-600 hover:text-red-800'>
                      <FaTrash />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-2 mb-2'>
                    <input type='text' placeholder='Color name' value={color.name} onChange={(e) => handleColorChange(index, 'name', e.target.value)} className={inputClass} required />
                    <input type='text' placeholder='Hex #000000' value={color.hexCode} onChange={(e) => handleColorChange(index, 'hexCode', e.target.value)} className={inputClass} required={color.name ? true : false} />
                    <input type='number' placeholder='Stock' value={color.countInStock} onChange={(e) => handleColorChange(index, 'countInStock', e.target.value)} className={inputClass} />
                    <input
                      type='number'
                      step='0.01'
                      placeholder='599.99'
                      value={color.price}
                      onChange={(e) => handleColorChange(index, 'price', Number(e.target.value))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    />
                  </div>

                  {(color.images?.length > 0 || color.filePreviews?.length > 0) && (
                    <div className='mb-2'>
                      <p className='text-sm text-gray-600 mb-1'>Images: <span className='text-xs'>Drag to reorder</span></p>
                      <div className='flex flex-wrap gap-2'>
                        {color.images.map((img, imgIdx) => (
                          <div
                            key={`existing-${imgIdx}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index, imgIdx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index, imgIdx)}
                            className='relative cursor-move group'
                          >
                            <div className='absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400'>
                              <FaGripVertical />
                            </div>
                            <img src={img} alt='' className='w-20 h-20 object-cover rounded border' />
                            <span className='absolute bottom-0 left-0 bg-black bg-opacity-60 text-white text-xs px-1 rounded-tr'>{imgIdx + 1}</span>
                            <button
                              type='button'
                              onClick={() => removeExistingImage(index, imgIdx)}
                              className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700'
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}

                        {color.filePreviews?.map((preview, fileIdx) => (
                          <div key={`new-${fileIdx}`} className='relative'>
                            <img src={preview} alt='' className='w-20 h-20 object-cover rounded border border-green-500' />
                            <span className='absolute top-0 left-0 bg-green-500 text-white text-xs px-1 rounded-br'>NEW</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input type='file' multiple onChange={(e) => handleColorFileChange(index, e)} className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100' accept='image/*' />
                  {color.files?.length > 0 && <p className='text-xs text-gray-600 mt-1'>{color.files.length} new file(s) selected</p>}
                </div>
              ))}
            </div>

            {/* Product Specifications */}
            <div className='border-t pt-6 mt-6'>
              <h3 className='text-lg font-semibold mb-4'>Specifications</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block mb-2 font-medium text-gray-700'>Storage</label>
                  <input
                    type='text'
                    placeholder='e.g. 512GB'
                    value={specs.storage}
                    onChange={(e) => setSpecs({ ...specs, storage: e.target.value })}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block mb-2 font-medium text-gray-700'>RAM</label>
                  <input
                    type='text'
                    placeholder='e.g. 16GB'
                    value={specs.ram}
                    onChange={(e) => setSpecs({ ...specs, ram: e.target.value })}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block mb-2 font-medium text-gray-700'>Display</label>
                  <input
                    type='text'
                    placeholder='e.g. 6.7 inch AMOLED 120Hz'
                    value={specs.display}
                    onChange={(e) => setSpecs({ ...specs, display: e.target.value })}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block mb-2 font-medium text-gray-700'>Battery</label>
                  <input
                    type='text'
                    placeholder='e.g. 5000mAh'
                    value={specs.battery}
                    onChange={(e) => setSpecs({ ...specs, battery: e.target.value })}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block mb-2 font-medium text-gray-700'>Camera</label>
                  <input
                    type='text'
                    placeholder='e.g. 50MP Triple'
                    value={specs.camera}
                    onChange={(e) => setSpecs({ ...specs, camera: e.target.value })}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            <button type='submit' disabled={loadingUpdate} className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold'>
              {loadingUpdate ? 'Updating...' : 'Update Product'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProductEditScreen