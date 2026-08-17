import { useGetAccessoriesQuery } from '../slices/accessoriesApiSlice' // check your path
import AccessoryCard from '../components/AccessoryCard'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useSearchParams } from 'react-router-dom'

const AccessoryCategoryListScreen = () => {

 const [searchParams] = useSearchParams()
const typeFilter = searchParams.get('type') // "Case", "Charger", "Holder / Stand"
const brandFilter = searchParams.get('brand') // from brand menu

const { data, isLoading, error } = useGetAccessoriesQuery({
    keyword: '',
    pageNumber: 1,
    type: typeFilter || 'accessory', // if no filter, get all accessories
    brand: brandFilter || '', // for Apple Accessories etc
    pageSize: 20
})

  const products = data?.accessories || [] // backend returns {accessories: [], page, pages}

  return (
    <div className='container mx-auto px-4 py-8'>
     <h1 className='text-2xl font-bold mb-6'>
  {typeFilter 
   ? typeFilter 
    : brandFilter 
     ? `${brandFilter} Accessories` 
      : 'All Accessories'}
</h1>
      
      {isLoading? (
        <Loader />
      ) : error? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {products.length === 0? (
            <Message>No Accessories Found</Message>
          ) : (
            products.map((accessory) => (
              <AccessoryCard key={accessory._id} accessory={accessory} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
export default AccessoryCategoryListScreen