import { Link  } from 'react-router-dom'
 



const HeroBanner = () => {

   
  


  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
      {/* Desktop Banner */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-20">
          <div className="flex items-center justify-between max-w-6xl mx-auto">

            {/* Left: Text */}
            <div className="text-white space-y-6 max-w-md lg:max-w-lg">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                iPhone 17 Pro
              </h1>

              <div className="space-y-2 text-base lg:text-lg text-gray-300">
                <p>A19 Pro Chip</p>
                <p>Titanium Design</p>
                <p>48MP Fusion Camera</p>
              </div>

              <Link
                to="/products"
                className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition duration-200"
              >
                Shop Now
              </Link>
            </div>

            {/* Right: Image */}
            <div className="flex-shrink-0">
              <Link to="/products?brand=Apple">
              <img 
                src="/assets/desktopBanner.png"
                alt="iPhone 17 Pro"
                className="h-[300px] lg:h-[360px] xl:h-[420px] w-auto object-contain"
              />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Banner */}
      {/* Mobile Banner */}
<div className="md:hidden relative w-full bg-slate-900 overflow-hidden">
  <img
    src="/assets/HeroBanner.png"
    alt="Latest Flagship Phones"
    className="w-full min-h-[320px] object-cover object-center"
  />
  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-3xl font-bold text-white mb-3">
      Latest Flagship Phones
    </h1>
    <p className="text-gray-200 mb-6">Apple, Samsung, Google & More</p>
    <Link
      to="/products"
      className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-semibold"
    >
      Shop Now
    </Link>
  </div>
</div>
    </div>
  )
}

export default HeroBanner