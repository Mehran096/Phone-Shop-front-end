import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGetAccessoryBySlugQuery } from '../slices/accessoriesApiSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'

const AccessoryScreen = () => {
  const { slug } = useParams()
  const [mainImage, setMainImage] = useState('')
  const [qty, setQty] = useState(1)

  const { data: accessory, isLoading, error } = useGetAccessoryBySlugQuery(slug)

  if (isLoading) return <Loader />
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>

  return (
    <div className='container mx-auto px-4 py-8'>
      <Link to='/' className='text-blue-600 hover:underline mb-4 inline-block'>← Go Back</Link>
      
      <div className='grid md:grid-cols-2 gap-10'>
        {/* IMAGE GALLERY */}
        <div>
          <div className='border rounded-lg p-4 mb-4 bg-white'>
            <img 
              src={mainImage || accessory.images?.[0]?.url} 
              alt={accessory.name} 
              className='w-full h-96 object-contain'
            />
          </div>
          <div className='flex gap-3 overflow-x-auto'>
            {accessory.images?.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                onClick={() => setMainImage(img.url)}
                className={`w-20 h-20 object-cover rounded border-2 cursor-pointer hover:border-blue-500 ${
                  mainImage === img.url? 'border-blue-500' : 'border-gray-200'
                }`}
                alt=''
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <p className='text-sm text-gray-500 mb-1'>{accessory.brand} / {accessory.type}</p>
          <h1 className='text-3xl font-bold mb-3'>{accessory.name}</h1>
          
          <div className='text-3xl font-bold text-blue-600 mb-4'>Rs {accessory.price}</div>
          
          <p className='text-gray-700 mb-6'>{accessory.description}</p>
          
          <div className='flex items-center gap-2 mb-4'>
            <strong>Stock:</strong>
            {accessory.countInStock > 0? (
              <span className='text-green-600 flex items-center gap-1'><FaCheck /> In Stock ({accessory.countInStock})</span>
            ) : (
              <span className='text-red-600'>Out Of Stock</span>
            )}
          </div>

          {/* COMPATIBLE WITH */}
          {accessory.compatibleWith?.length > 0 && (
            <div className='mb-6'>
              <p className='font-semibold mb-2'>Compatible With:</p>
              <div className='flex flex-wrap gap-2'>
                {accessory.compatibleWith?.map(p => (
                  <Link 
                    key={p._id} 
                    to={`/product/${p.slug}`}
                    className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 border-blue-200'
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* QTY + ADD TO CART */}
          {accessory.countInStock > 0 && (
            <div className='flex items-center gap-4 mb-4'>
              <label className='font-semibold'>Qty:</label>
              <select 
                value={qty} 
                onChange={(e) => setQty(Number(e.target.value))}
                className='border rounded px-3 py-2'
              >
                {[...Array(accessory.countInStock).keys()].map((x) => (
                  <option key={x + 1} value={x + 1}>{x + 1}</option>
                ))}
              </select>
            </div>
          )}

          <button 
            disabled={accessory.countInStock === 0}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2'
          >
            <FaShoppingCart /> Add To Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccessoryScreen