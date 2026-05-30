import { Link, useNavigate } from 'react-router-dom'

const HeroBanner = () => {
  return (
    <>
    
      
    
     {/* <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-b from-black via-gray-900 to-gray-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 flex-col items-center text-center"> */}
     <div className='w-full bg-gradient-to-b from-black via-gray-900 to-black'>
      <div className='max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-20'>
        <div className='flex flex-col lg:flex-row items-center gap-6 lg:gap-12'>
          
          {/* Text Content */}
          <div className='flex-1 text-center lg:text-left'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 text-white leading-tight'>
              PhoneStore Pro Max
            </h1>
            
            <div className='text-sm sm:text-base md:text-lg text-gray-300 mb-6 space-y-1'>
              <p className='block sm:inline'>
                Snapdragon® 8 Elite
                <span className='hidden sm:inline mx-2'>|</span>
              </p>
              <p className='block sm:inline'>
                Ultra-Slim Design
                <span className='hidden sm:inline mx-2'>|</span>
              </p>
              <p className='block sm:inline'>6000 mAh Battery</p>
            </div>

            <Link 
              to='/products'
              className='inline-block bg-white text-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-medium hover:bg-gray-200 transition text-sm sm:text-base'
            >
              Learn more
            </Link>
             {/* <button className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition">
          Learn more
        </button> */}
          </div>

          {/* Image */}
           <Link  to='/products'>
          <div className='flex-1 w-full mt-4 lg:mt-0'>
           
            <img
              src='/assets/HeroBanner.png'
              alt='Phones'
              className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto object-contain'
            />
          
          </div>
          </Link>
            
        </div>
      </div>
    </div>
     
    </>
    
  )
}

export default HeroBanner