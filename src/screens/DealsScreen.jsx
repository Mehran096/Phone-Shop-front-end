import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'

import { useGetDealsProductsQuery } from '../slices/productsApiSlice'

const DealsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)

  const {
    data: deals,
    isLoading,
    error,
  } = useGetDealsProductsQuery()
//console.log(deals)
  return (
    <>
      <Helmet>
        <title>Deals & Discounts | PhoneStore</title>
        <meta
          name="description"
          content="Browse all discounted smartphones and save more on your next purchase."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">

        {/* Back Button */}
        <Link
          to="/"
          className="inline-block mb-8 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Home
        </Link>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            💸 Deals & Discounts
          </h1>

          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Discover all smartphones currently available at discounted prices.
          </p>
        </div>

        {/* Products */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : deals?.length === 0 ? (
          <Message>No discounted products available.</Message>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map((product) => (
              <Product
                key={product._id}
                product={product}
                userInfo={userInfo}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default DealsScreen