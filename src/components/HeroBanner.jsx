import { Link } from 'react-router-dom'

const HeroBanner = () => {
  return (
    <div className='w-full bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 items-center gap-6 lg:gap-8 py-8 md:py-12 lg:py-20'>
          
          {/* Text Content */}
          <div className='text-center lg:text-left order-2 lg:order-1 z-10'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 text-white leading-tight'>
              PhoneStore Pro Max
            </h1>
            
            <div className='text-sm sm:text-base lg:text-lg text-gray-300 mb-5 md:mb-6 space-y-1 sm:space-y-0'>
              <span className='block sm:inline'>Snapdragon® 8 Elite</span>
              <span className='hidden sm:inline mx-2'>|</span>
              <span className='block sm:inline'>Ultra-Slim Design</span>
              <span className='hidden sm:inline mx-2'>|</span>
              <span className='block sm:inline'>6000 mAh Battery</span>
            </div>

            <Link 
              to='/products'
              className='inline-block bg-white text-black px-5 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full font-semibold hover:bg-gray-200 transition text-sm sm:text-base'
            >
              Learn more
            </Link>
          </div>

          {/* Image - Scaled up to hide black padding */}
          <div className='order-1 lg:order-2 flex justify-center lg:justify-end'>
            <Link  to='/products'>
            <div className='w-full max-w-[350px] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[700px] xl:max-w-[850px]'>
              <img
                src='/assets/HeroBanner.png'
                alt='PhoneStore Pro Max Phones'
                className='w-full h-auto scale-125 lg:scale-150 object-contain'
              />
            </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroBanner