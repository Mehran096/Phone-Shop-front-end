const HeroBanner = () => {
  return (
    <>
    
      
    
     <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-b from-black via-gray-900 to-gray-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 flex-col items-center text-center">
        
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 px-2">
          PhoneStore Pro Max
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 px-4 leading-relaxed">
          Snapdragon® 8 Elite <span className="hidden sm:inline">|</span>
          <br className="sm:hidden" />
          Ultra-Slim Design <span className="hidden sm:inline">|</span>
          <br className="sm:hidden" />
          6000 mAh Battery
        </p>
        
        <button className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition">
          Learn more
        </button>

        {/* Fixed image classes */}
        <img 
          src="/assets/HeroBanner.png" 
          alt="Phones"
          className="mt-8 w-full max-w-[95vw] sm:max-w-4xl md:max-w-6xl mx-auto object-contain"
        />
      </div>
    </div>
     
    </>
    
  )
}

export default HeroBanner