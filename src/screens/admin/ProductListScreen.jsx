import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { useGetProductsQuery, useDeleteProductMutation, useCreateProductMutation } from '../../slices/productsApiSlice'
import Paginate from '../../components/Paginate'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import { toast } from 'react-toastify'

const ProductListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('keyword') || '')

  const keyword = searchParams.get('keyword') || ''
  const pageNumber = Number(searchParams.get('pageNumber')) || 1

  const navigate = useNavigate()

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  })

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation()
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation()

  useEffect(() => {
    setSearch(keyword)
  }, [keyword])

  const deleteHandler = async (id) => {
    if (window.confirm('Delete this product? This will also delete all images from Cloudinary.')) {
      try {
        await deleteProduct(id).unwrap()
        toast.success('Product deleted')
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  const createProductHandler = async () => {
    if (window.confirm('Create a new sample product?')) {
      try {
        navigate(`/admin/product/create`)
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    const params = { pageNumber: 1 }
    if (search.trim()) params.keyword = search
    setSearchParams(params)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4'>
        <h1 className='text-2xl font-bold text-gray-900'>Products</h1>

        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
          <form onSubmit={submitHandler} className='flex gap-2 flex-1 lg:flex-initial'>
            <div className='relative flex-1'>  
    <input
      type='text'
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder='Search products...'
      className='w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    />
   {search && (
  <button
    type='button'
    onClick={() => {
      setSearch('')
      setSearchParams({ pageNumber: 1 })
    }}
    className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none z-10 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100'
  >
    ×
  </button>
)}
  </div>  
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap'
            >
              Search
            </button>
          </form>

          <button
            onClick={createProductHandler}
            disabled={loadingCreate}
            className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50'
          >
            <FaPlus /> Create Product
          </button>
        </div>
      </div>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='error'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <div className='hidden md:block overflow-x-auto bg-white rounded-lg shadow'>
            <table className='w-full table-auto'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>ID</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>NAME</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>PRICE</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>CATEGORY</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>BRAND</th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {data.products.map((product) => (
                  <tr key={product._id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-sm text-gray-600'>{product._id.substring(18, 24)}...</td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-900'>{product.name}</td>
                    <td className='px-4 py-3 text-sm text-gray-600'>${product.colors[0].price.toLocaleString()}</td>
                    <td className='px-4 py-3 text-sm text-gray-600'>{product.category}</td>
                    <td className='px-4 py-3 text-sm text-gray-600'>{product.brand}</td>
                    <td className='px-4 py-3 flex gap-2'>
                      <Link to={`/admin/product/${product._id}/edit`}>
                        <button className='p-2 text-blue-600 hover:bg-blue-50 rounded transition'>
                          <FaEdit />
                        </button>
                      </Link>
                      <button
                        className='p-2 text-red-600 hover:bg-red-50 rounded transition'
                        onClick={() => deleteHandler(product._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Hidden on desktop */}
          <div className='md:hidden space-y-4'>
            {data.products.map((product) => (
              <div key={product._id} className='bg-white p-4 rounded-lg shadow'>
                <div className='flex justify-between items-start mb-2 gap-2'>
                  <h3 className='font-semibold text-lg leading-tight'>{product.name}</h3>
                  <span className='text-xl font-bold text-blue-600 shrink-0'>
                    ${product.colors[0].price.toLocaleString()}
                  </span>
                </div>
                <div className='text-sm text-gray-600 space-y-1 mb-3'>
                  <p><span className='font-medium'>Brand:</span> {product.brand}</p>
                  <p><span className='font-medium'>Category:</span> {product.category}</p>
                  <p className='font-mono text-xs'><span className='font-medium font-sans'>ID:</span> {product._id.substring(18, 24)}...</p>
                </div>
                <div className='flex gap-2'>
                  <Link
                    to={`/admin/product/${product._id}/edit`}
                    className='flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-center text-sm flex items-center justify-center gap-1'
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    onClick={() => deleteHandler(product._id)}
                    className='flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm flex items-center justify-center gap-1'
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6'>
            <Paginate
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
              isAdmin={true}
              pathname="/admin/productlist"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ProductListScreen