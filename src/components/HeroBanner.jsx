import { Link } from 'react-router-dom';

const HeroBanner = () => {
  return (
    <section className='w-full'>

      {/* Desktop Banner - Reduced height */}
      <div className='hidden md:block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid grid-cols-2 gap-8 items-center min-h-[400px] lg:min-h-[440px]'>

            {/* Left: Text */}
            <div className='text-white space-y-5 py-8 z-10'>
              <h1 className='text-4xl xl:text-5xl font-bold leading-tight'>
                PhoneStore Pro Max
              </h1>
              <div className='space-y-1.5 text-base text-gray-300'>
                <p>Snapdragon® 8 Elite</p>
                <p>Ultra-Slim Design</p>
                <p>6000 mAh Battery</p>
              </div>
              <Link
                to='/products'
                className='inline-block bg-white text-slate-900 px-7 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-all'
              >
                Learn More
              </Link>
            </div>

            {/* Right: Image - Bigger but not huge */}
            <div className='relative h-full flex items-center justify-end'>
              <img
                src='/assets/desktopBanner.png'
                alt='PhoneStore Pro Max'
                className='w-full max-w-lg lg:max-w-xl h-auto object-contain'
              />
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Banner - Keep same */}
      <div className='md:hidden relative h-[420px] bg-slate-900 overflow-hidden'>

        <img
          src='/assets/HeroBanner.png'
          alt='PhoneStore Pro Max'
          className='absolute inset-0 w-full h-full object-cover'
        />

        <div className='absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent' />

        <div className='relative h-full flex flex-col justify-end px-6 pb-10 text-center'>
          <div className='space-y-4 text-white'>
            <h1 className='text-3xl font-bold leading-tight'>
              PhoneStore Pro Max
            </h1>

            <div className='space-y-1 text-sm text-gray-200'>
              <p>Snapdragon® 8 Elite</p>
              <p>Ultra-Slim Design</p>
              <p>6000 mAh Battery</p>
            </div>

            <Link
              to='/products'
              className='inline-block bg-white text-slate-900 px-7 py-2.5 rounded-full font-semibold mt-3'
            >
              Learn More
            </Link>
          </div>
        </div>

      </div>

    </section>
  );
};

export default HeroBanner;