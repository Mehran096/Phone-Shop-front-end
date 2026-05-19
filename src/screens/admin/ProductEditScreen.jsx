import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProductDetails, updateProduct, resetProductUpdate } from '../../slices/productSlice'

const ProductEditScreen = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [images, setImages] = useState(null)
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  // Existing images from DB
  const [existingImages, setExistingImages] = useState([])

  // New files selected by user
  const [newFiles, setNewFiles] = useState([])

  // Preview URLs for new files
  const [previewUrls, setPreviewUrls] = useState([])

  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedFrom, setDraggedFrom] = useState(null) // 'existing' or 'new'

  const { product, loading, error, successUpdate } = useSelector((state) => state.products)

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: 'product/resetProductUpdate' })
      navigate('/admin/productlist')
    } else {
      if (!product || product._id !== id) {
        dispatch(getProductDetails(id))
      } else {
        setName(product.name)
        setPrice(product.price)
         
        setBrand(product.brand)
        setCategory(product.category)
        setCountInStock(product.countInStock)
        setDescription(product.description)
        setExistingImages(product.images || [])
      }
    }
  }, [product, id, dispatch, navigate, successUpdate])

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setNewFiles(files)

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const removeNewImage = (idx) => {
    URL.revokeObjectURL(previewUrls[idx])
    setNewFiles(newFiles.filter((_, i) => i!== idx))
    setPreviewUrls(previewUrls.filter((_, i) => i!== idx))
  }

  const removeExistingImage = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i!== idx))
  }

  // Drag handlers
  const handleDragStart = (e, idx, type) => {
    setDraggedItem(idx)
    setDraggedFrom(type)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIdx, dropType) => {
    e.preventDefault()

    if (draggedFrom!== dropType) return // only reorder within same list

    if (dropType === 'existing') {
      const updated = [...existingImages]
      const [moved] = updated.splice(draggedItem, 1)
      updated.splice(dropIdx, 0, moved)
      setExistingImages(updated)
    }

    if (dropType === 'new') {
      const updatedFiles = [...newFiles]
      const updatedUrls = [...previewUrls]
      const [movedFile] = updatedFiles.splice(draggedItem, 1)
      const [movedUrl] = updatedUrls.splice(draggedItem, 1)
      updatedFiles.splice(dropIdx, 0, movedFile)
      updatedUrls.splice(dropIdx, 0, movedUrl)
      setNewFiles(updatedFiles)
      setPreviewUrls(updatedUrls)
    }

    setDraggedItem(null)
    setDraggedFrom(null)
  }


  const submitHandler = (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('price', price)
    formData.append('description', description)
     formData.append('brand', brand)
     formData.append('category', category)
     formData.append('countInStock', countInStock)

    // Send remaining existing images as JSON
    formData.append('existingImages', JSON.stringify(existingImages))

    // Append new files
    newFiles.forEach(file => {
      formData.append('images', file)
    })


    dispatch(updateProduct({ id, formData }))
  }
  
const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
const labelClass = "block text-sm font-medium text-gray-700"
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/admin/productlist" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Go Back
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Price</label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </div>

            

            <div>
              <label className={labelClass}>Brand</label>
              <input
                type="text"
                value={brand || ''}
                onChange={(e) => setBrand(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                value={category || ''}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Count In Stock</label>
              <input
                type="number"
                value={countInStock || ''}
                onChange={(e) => setCountInStock(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className={inputClass}
              ></textarea>
            </div>

            {/* Existing Images - Draggable */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Images <span className="text-gray-500 text-xs">Drag to reorder</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, idx) => (
                  <div
                    key={img}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, 'existing')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, 'existing')}
                    className="relative group cursor-move"
                  >
                    <img
                      src={img}
                      alt={`existing ${idx}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-xs">⋮</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

           {/* Upload New Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Add New Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
         {/* New Image Previews - Draggable */}
          {previewUrls.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                New Image Previews <span className="text-gray-500 text-xs">Drag to reorder</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, idx) => (
                  <div
                    key={url}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx, 'new')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, 'new')}
                    className="relative group cursor-move"
                  >
                    <img
                      src={url}
                      alt={`preview ${idx}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-xs">⋮</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700"
            >
              Update Product
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProductEditScreen