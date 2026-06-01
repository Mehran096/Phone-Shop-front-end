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

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    pageNumber,
  })

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation()
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation()

  useEffect(() => {
    setSearch(keyword)
  }, [keyword])

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        toast.success('Product deleted')
        refetch()
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  // const createProductHandler = async () => {
  //   if (window.confirm('Are you sure you want to create a new product?')) {
  //     try {
  //       await createProduct()
  //       refetch()
  //       toast.success('Product created')
  //     } catch (err) {
  //       toast.error(err?.data?.message || err.error)
  //     }
  //   }
  // }

  const submitHandler = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setSearchParams({ keyword: search.trim(), pageNumber: 1 })
    } else {
      setSearchParams({ pageNumber: 1 })
    }
  }

  const onPageChange = (pageNum) => {
    const params = { pageNumber: pageNum }
    if (keyword) params.keyword = keyword
    setSearchParams(params)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4'>
        <h1 className='text-2xl font-bold text-gray-900'>Products</h1>

        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
          <form onSubmit={submitHandler} className='flex gap-2 flex-1 lg:flex-initial'>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search products...'
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 lg:w-72'
            />
            {keyword && (
              <button
                type='button'
                onClick={() => {
                  setSearch('')
                  setSearchParams({ pageNumber: 1 })
                }}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition'
              >
                Clear
              </button>
            )}
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap'
            >
              Search
            </button>
          </form>
          <Link to='/admin/product/create'>
          <button
            //onClick={createProductHandler}
            disabled={loadingCreate}
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center whitespace-nowrap disabled:opacity-50'
          >
            <FaPlus /> Create Product
          </button>
          </Link>
        </div>
      </div>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}
      {isLoading? (
        <Loader />
      ) : error? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <div className='hidden md:block bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead className='bg-gray-100 border-b'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24'>
                      ID
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Price
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell'>
                      Category
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell'>
                      Brand
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {data.products.map((product) => (
                    <tr key={product._id} className='hover:bg-gray-50 transition'>
                      <td className='px-4 py-4 text-sm text-gray-500 font-mono'>
                        {product._id.substring(0, 8)}...
                      </td>
                      <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                        <div className='max-w-xs truncate'>{product.name}</div>
                        <div className='text-gray-500 text-xs lg:hidden mt-1'>
                          {product.category} • {product.brand}
                        </div>
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-900 font-semibold'>
                        ${product.price.toLocaleString()}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-600 hidden lg:table-cell'>
                        {product.category}
                      </td>
                      <td className='px-4 py-4 text-sm text-gray-600 hidden lg:table-cell'>
                        {product.brand}
                      </td>
                      <td className='px-4 py-4 text-sm'>
                        <div className='flex gap-2'>
                          <Link
                            to={`/admin/product/${product._id}/edit`}
                            className='px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition'
                          >
                            <FaEdit className='inline' /> Edit
                          </Link>
                          <button
                            onClick={() => deleteHandler(product._id)}
                            className='px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition'
                          >
                            <FaTrash className='inline' /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards - Hidden on desktop */}
          <div className='md:hidden space-y-4'>
            {data.products.map((product) => (
              <div key={product._id} className='bg-white p-4 rounded-lg shadow'>
                <div className='flex justify-between items-start mb-2 gap-2'>
                  <h3 className='font-semibold text-lg leading-tight'>{product.name}</h3>
                  <span className='text-xl font-bold text-blue-600 shrink-0'>
                    ${product.price.toLocaleString()}
                  </span>
                </div>
                <div className='text-sm text-gray-600 space-y-1 mb-3'>
                  <p><span className='font-medium'>Brand:</span> {product.brand}</p>
                  <p><span className='font-medium'>Category:</span> {product.category}</p>
                  <p className='font-mono text-xs'><span className='font-medium font-sans'>ID:</span> {product._id.substring(0, 8)}...</p>
                </div>
                <div className='flex gap-2'>
                  <Link
                    to={`/admin/product/${product._id}/edit`}
                    className='flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-center text-sm'
                  >
                    <FaEdit className='inline mr-1' /> Edit
                  </Link>
                  <button
                    onClick={() => deleteHandler(product._id)}
                    className='flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm'
                  >
                    <FaTrash className='inline mr-1' /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Paginate
            pages={data.pages}
            page={data.page}
            isAdmin={true}
            onPageChange={onPageChange}
            keyword={keyword}
          />
        </>
      )}
    </div>
  )
}

export default ProductListScreen