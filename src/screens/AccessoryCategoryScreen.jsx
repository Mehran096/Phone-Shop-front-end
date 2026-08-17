import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useGetAccessoriesByCategoryQuery } from '../slices/accessoriesApiSlice'
import AccessoryCard from '../components/AccessoryCard'
import Paginate from '../components/Paginate'
import Loader from '../components/Loader'
import Message from '../components/Message'

const AccessoryListScreen = () => {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const pageNumber = Number(searchParams.get('pageNumber')) || 1

  const { data, isLoading, error } = useGetAccessoriesByCategoryQuery({ 
    categorySlug, 
    pageNumber 
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to='/' className='text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block'>
        ← Go Back Home
      </Link>

      <h1 className="text-2xl font-bold mb-2 capitalize">
        {data?.categoryName || categorySlug.replace('-', ' ')}
      </h1>
      <p className='text-gray-600 mb-6'>{data?.accessories?.length || 0} items found</p>

      {isLoading? <Loader /> : error? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {data.accessories.map((accessory) => (
              <AccessoryCard key={accessory._id} accessory={accessory} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className='mt-12 flex justify-center'>
              <Paginate 
                pages={data.pages} 
                page={data.page} 
                pathname={`/category/${categorySlug}`} 
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AccessoryListScreen