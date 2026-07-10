import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Product from '../components/Product'
import { useSelector } from 'react-redux'
import Paginate from '../components/Paginate'
import { useGetProductsQuery } from '../slices/productsApiSlice'
import HeroBanner from '../components/HeroBanner'
import Loader from '../components/Loader'
import Message from '../components/Message'
import OfflineMessage from '../components/OfflineMessage'
import { FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa'

const HomeScreen = ({ isOnline }) => {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const brand = searchParams.get('brand') || '' // Fix 1: Read brand
  const pageNumber = Number(searchParams.get('pageNumber')) || 1

  const { userInfo } = useSelector((state) => state.auth)

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    keyword,
    brand, // Fix 2: Send brand to API
    pageNumber,
  })

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'OPPO', 'ViVO']

  // This is the key part - check for network error
  if (!isOnline || error?.status === 'FETCH_ERROR' || error?.error === 'TypeError: Failed to fetch') {
    return <OfflineMessage refetch={refetch} isOnline={isOnline} />
  }

  return (
    <>
      <Helmet>
        <title>
          {keyword
            ? `Search: ${keyword} - Phone-Store`
            : brand
              ? `${brand} Mobiles - Phone-Store`
              : 'Phone-Store - Buy Mobile Phones Online in Pakistan'}
        </title>
        <meta
          name="description"
          content={keyword || brand
            ? `Shop ${keyword || brand} mobiles at Phone-Store. Best prices, 1 year warranty, fast delivery in Pakistan.`
            : 'Phone-Store: Buy latest iPhone, Samsung, Xiaomi, Oppo, Vivo mobiles online in Pakistan. Best prices, 1 year warranty, fast delivery in Peshawar, Karachi, Lahore.'}
        />
        <link rel="canonical" href={`https://www.phone-store.asia${keyword ? `/?keyword=${keyword}` : brand ? `/?brand=${brand}` : ''}`} />

        <meta property="og:title" content={brand ? `${brand} Phones - Phone-Store` : 'Phone-Store - Best Mobile Shop in Pakistan'} />
        <meta property="og:description" content="Shop iPhone, Samsung, Xiaomi & more. Genuine products, best prices, warranty, fast delivery across Pakistan." />
        <meta property="og:image" content="https://www.phone-store.asia/og-home.jpg" />
        <meta property="og:url" content="https://www.phone-store.asia" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Phone-Store",
            "url": "https://www.phone-store.asia",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.phone-store.asia/?keyword={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      {/* 1. Hero Section - Hide when filtering */}
      {!keyword && !brand && <HeroBanner />}

      {/* 2. Shop by Brand - Only on homepage */}
      {!keyword && !brand && (
        <section className='py-16 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>Shop by Brand</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {brands.map((brand) => (
                <Link
                  key={brand}
                  to={`/products?brand=${encodeURIComponent(brand)}`} // Fix 3: Use brand param not keyword
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
      <div className='container mx-auto px-2 sm:px-4 py-6 sm:py-8'>
        {/* Back button when filtering */}
        {(keyword || brand) && ( // Fix 4: Show for brand too
          <Link
            to='/'
            className='inline-block mb-6 text-blue-600 hover:text-blue-800 font-medium'
          >
            ← Go Back
          </Link>
        )}

        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center'>
          {keyword
            ? `Search Results for "${keyword}"`
            : brand
              ? `${brand} Phones` // Fix 5: Show brand in title
              : 'Latest Phones'}
        </h1>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'>
              {data.products.map((product) => (
                <Product key={product._id} product={product} userInfo={userInfo} />
              ))}
            </div>

            {/* Add pagination here */}
            <div className='mt-12 flex justify-center'>
              <Paginate
                pages={data.pages}
                page={data.page}
                keyword={keyword}
                brand={brand} // Fix 6: Pass brand to Paginate
                pathname='/products' // Fix 7: Set correct path
                isAdmin={false}
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Why Choose Us - Only on homepage */}
      {!keyword && !brand && ( // Fix 8: Hide when filtering by brand too
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