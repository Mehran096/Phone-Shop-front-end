import { Link, useSearchParams } from 'react-router-dom'
import Product from '../components/Product'
import Paginate from '../components/Paginate'
import { useGetProductsQuery } from '../slices/productsApiSlice'
import HeroBanner from '../components/HeroBanner'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa'

const HomeScreen = () => {
  //const { keyword } = useParams() // keyword still comes from /search/:keyword
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || '' 
  const pageNumber = Number(searchParams.get('pageNumber')) || 1 
  

  const { data, isLoading, error } = useGetProductsQuery({
    keyword: keyword || '',
    pageNumber: pageNumber
  })
const brands = ['Apple', 'Samsung', 'Google', 'OnePlus']

  return (
    <>
     {/* 1. Hero Section */}
      {!keyword && <HeroBanner />} 

       {/* 2. Shop by Brand - Only show on homepage */}
      
{!keyword && (
  <section className='py-16 bg-gray-50'>
    <div className='container mx-auto px-4'>
      <h2 className='text-3xl font-bold text-center mb-12'>Shop by Brand</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {brands.map((brand) => (
          <Link
            key={brand}
            to={`/?keyword=${encodeURIComponent(brand)}&pageNumber=1`}
            className='bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition text-center group'
          >
            <img
              src={`/images/${brand.toLowerCase()}.svg`}
              alt={brand}
              className='h-16 mx-auto mb-4 group-hover:scale-110 transition object-contain'
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <h3 className='font-semibold text-lg'>{brand}</h3>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}
   {/* 3. Products Section */}
<div className='container mx-auto px-4 py-8'>
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

  {isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>
      {error?.data?.message || error.error}
    </Message>
  ) : (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
        {data.products.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </div>
      
      {/* Add pagination here */}
      <div className='mt-12 flex justify-center'>
        <Paginate
          pages={data.pages}
          page={data.page}
          keyword={keyword}
          isAdmin={false}
        />
      </div>
    </>
  )}
</div>
      {/* 4. Why Choose Us - Only on homepage */}
      {!keyword && (
        <section className='py-16 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>Why Choose PhoneStore</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaShippingFast className='text-2xl text-blue-600' />
                </div>
                <h3 className='font-bold text-xl mb-2'>Fast Delivery</h3>
                <p className='text-gray-600'>Free shipping on orders over $500. Get it in 2-3 days.</p>
              </div>
              <div className='text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaShieldAlt className='text-2xl text-blue-600' />
                </div>
                <h3 className='font-bold text-xl mb-2'>Secure Payment</h3>
                <p className='text-gray-600'>100% secure checkout with PayPal & Stripe integration.</p>
              </div>
              <div className='text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaHeadset className='text-2xl text-blue-600' />
                </div>
                <h3 className='font-bold text-xl mb-2'>24/7 Support</h3>
                <p className='text-gray-600'>Questions? Our team is here to help anytime.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default HomeScreen