import { useParams, Link } from 'react-router-dom'
import Product from '../components/Product'
import Paginate from '../components/Paginate'
import { useGetProductsQuery } from '../slices/productsApiSlice'

const HomeScreen = () => {
  const { keyword, pageNumber } = useParams()
  
  const { data, isLoading, error } = useGetProductsQuery({ 
    keyword: keyword || '', 
    pageNumber: Number(pageNumber) || 1 
  })

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Banner */}
      <div className="w-full mb-8">
        <img 
          src="https://images.unsplash.com/photo-1648962492009-0bd1122f61d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNlbGwlMjBwaG9uZXN8ZW58MHx8MHx8fDA%3D" 
          alt="Phone Banner"
          className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg"
        />
      </div>
      {/* Back button when searching */}
      {keyword && (
        <Link 
          to='/' 
          className='inline-block mb-6 text-blue-600 hover:text-blue-800 font-medium'
        >
          ← Go Back
        </Link>
      )}

      <h1 className='text-3xl font-bold text-gray-900 mb-8 text-center'>
        {keyword ? `Search Results for "${keyword}"` : 'Latest Phones'}
      </h1>

      {/* Loading State */}
      {isLoading && (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded-lg text-center'>
          {error?.data?.message || error.error || 'Something went wrong'}
        </div>
      )}

      {/* Data Loaded State */}
      {!isLoading && !error && data && (
        <>
          {/* No Products Found */}
          {data?.products?.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-gray-500 text-lg'>No products found</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {data?.products?.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <Paginate 
                  pages={data.pages} 
                  page={data.page} 
                  keyword={keyword || ''} 
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default HomeScreen