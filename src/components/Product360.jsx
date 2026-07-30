import { useState, useEffect, useRef } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes, FaBan } from 'react-icons/fa'

const Product360 = ({ 
  images, 
  selectedIndex, 
  setSelectedIndex, 
  isImageFullscreen, 
  setIsImageFullscreen, 
  stock, 
  externalLoading,
  slideDirection,
  setSlideDirection, 
  
}) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false);

  //const [, setIsExternalLoading] = useState(false)  
//const [slideDirection, setSlideDirection] = useState('center') 
  //const [isFullscreen, setIsFullscreen] = useState(false)

  const minSwipeDistance = 50

 // Amazon: NO LOADING SPINNER - just fade + slide
const nextImage = () => {
  if (selectedIndex === images.length - 1) return;
  setSlideDirection('right') // slide right
  setIsAnimating(true)
  setTimeout(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev))
    setIsAnimating(false)
  }, 150)
}

const prevImage = () => {
  if (selectedIndex === 0) return;
  setSlideDirection('left') // slide left
  setIsAnimating(true)
  setTimeout(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    setIsAnimating(false)
  }, 150)
}

  // Mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) nextImage()
    if (distance < -minSwipeDistance) prevImage()
  }

  // Reset slideDirection after animation so next swipe works
useEffect(() => {
  const timer = setTimeout(() => {
    setSlideDirection('center')
  }, 300) // must match duration-300 in your className
  return () => clearTimeout(timer)
}, [selectedIndex])

  // Lock body scroll when fullscreen open
  useEffect(() => {
    if (isImageFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isImageFullscreen])

  // Desktop keyboard + ESC for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') setIsImageFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, isImageFullscreen])


const thumbRef = useRef(null)

useEffect(() => {
  if (thumbRef.current) {
    const activeThumb = thumbRef.current.children[selectedIndex]
    activeThumb?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
  }
}, [selectedIndex])


  return (
    <>
      <div className='w-full flex flex-col md:flex-row min-w-0 gap-4'>
        {/* Desktop Thumbnails - LEFT */}
        {images.length > 1 && (
          <div className='hidden pt-2 pl-2 md:flex flex-col gap-2 w-20 overflow-y-auto overflow-x-hidden h-[28rem] flex-shrink-0 
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
  if (idx === selectedIndex) return;
  setSlideDirection(idx > selectedIndex? 'right' : 'left')
  setIsAnimating(true) // start animation
  setTimeout(() => {
    setSelectedIndex(idx)
    setIsAnimating(false) // end animation
  }, 150) // half of transition time
}}
                className={`w-14 h-14 bg-white rounded-xl border-2 p-1 flex-shrink-0 transition-all 
                  duration-200 ${selectedIndex === idx
                  ? "border-blue-600 shadow-lg scale-105 ring-2 ring-blue-100"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-md hover:scale-105"
                  }`}
              >
                <img 
                  src={img} 
                  alt={`Thumb ${idx + 1}`} 
                  className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${
                    externalLoading? 'opacity-30' : 'opacity-100'
                  }`} 
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image - AMAZON MOBILE: FIXED ASPECT RATIO */}
        <div
          className="flex-1 relative group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0 w-full 
          aspect-[4/5] md:aspect-auto md:h-[32rem] transition-all duration-300"
        >
          {stock === 0 && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 lg:top-5 lg:left-5 z-30">
              <div
                className="
                  flex items-center gap-2
                  rounded-full
                  bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500
                  text-white
                  px-3 py-1.5
                  sm:px-4 sm:py-2
                  text-[10px] sm:text-xs md:text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  
                  border border-white/20
                  backdrop-blur-md
                   
                "
              >

                <FaBan className="text-xs sm:text-sm animate-pulse" />
                <span className='animate-pulse'>SOLD OUT</span>
              </div>
            </div>
          )}
          <div
            className="w-full h-full flex items-center justify-center pt-12 pb-4 px-4 md:p-8"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
           <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* ADD SPINNER HERE */}
  {(externalLoading) && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )}
          <img
  key={selectedIndex}  
  src={images[selectedIndex]}
  alt='Product'
  className={`h-full w-auto max-h-[90%] max-w-[90%] object-contain cursor-pointer 
    transition-all duration-300 ease-in-out
    ${stock === 0? "grayscale opacity-80" : "group-hover:scale-105"}
    ${externalLoading? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
    ${isAnimating 
     ? slideDirection === 'right'? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8'
      : 'opacity-100 translate-x-0'
    }`}
  onClick={() => {
    setIsImageFullscreen(true);
  }}
/>
        </div>

            {/* Mobile Counter - TOP CENTER */}
            {images.length > 1 && (
              <div className='md:hidden absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 
              rounded-full'>
                {selectedIndex + 1} of {images.length}
              </div>
            )}
          </div>

          {/* Desktop Arrows - NO CIRCLE */}
          {images.length > 1 && (
            <>
              <button
               onClick={(e) => { e.stopPropagation(); prevImage() }}
                disabled={selectedIndex === 0}
                className='hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-3 text-gray-700 hover:text-black 
                disabled:opacity-20 disabled:cursor-not-allowed transition items-center justify-center'
                aria-label='Previous image'
              >
                <FaChevronLeft size={28} />
              </button>
              <button
             onClick={(e) => { e.stopPropagation(); nextImage() }}
                disabled={selectedIndex === images.length - 1}
                className='hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-3 text-gray-700 hover:text-black 
                disabled:opacity-20 disabled:cursor-not-allowed transition items-center justify-center'
                aria-label='Next image'
              >
                <FaChevronRight size={28} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Thumbnails - BOTTOM */}
        {images.length > 1 && (
          <div className='md:hidden bg-gray-50 border-t border-gray-200 -mx-4 relative'>
            <div className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x snap-mandatory 
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {images.map((img, idx) => (
                <button
                  key={idx}
                 onClick={(e) => {
  e.stopPropagation()
   
  setSlideDirection(idx > selectedIndex ? 'right' : 'left')  
  setSelectedIndex(idx)
  
}}
                  aria-label={`View image ${idx + 1}`}
                  className={`flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 p-1 snap-start transition-all 
                    duration-200 ${selectedIndex === idx
                      ? 'border-blue-600 ring-2 ring-blue-100 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                    }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className='w-full h-full object-contain rounded-lg'
                    loading='lazy'
                  />
                </button>
              ))}
            </div>
            <div className='absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent
             pointer-events-none' />
          </div>
        )}
      </div>

      {/* Fullscreen Modal - KEEP AS IS - WORKING FINE */}
      {isImageFullscreen && (
        <div
          className='fixed inset-0 bg-white z-50 flex flex-col md:flex-row overflow-hidden'
          // onClick={() => {
          //   setIsImageFullscreen(false);
          // }}
        >
          {/* Close - CIRCLE - BLACK ICON */}
          <button
            onClick={() => {
              setIsImageFullscreen(false);
            }}
            className='absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/65 backdrop-blur-md border border-white/60 shadow-md text-gray-700 hover:bg-white hover:text-black transition-all duration-200'
            aria-label='Close fullscreen'
          >
            <FaTimes size={22} />
          </button>

          {/* Desktop modal thumbs */}
          {images.length > 1 && (
            <div className='hidden md:flex flex-col gap-2 w-26 p-4 overflow-y-auto overflow-x-hidden bg-gray-50 border-r 
            border-gray-200 flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
    e.stopPropagation()
    if (idx === selectedIndex) return; // prevent spam
    setSlideDirection(idx > selectedIndex ? 'right' : 'left')
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedIndex(idx)
      setIsAnimating(false)
    }, 150)
  }}
                  className={`w-16 h-16 bg-white rounded-lg border-2 p-0.5 flex-shrink-0 transition-all ${selectedIndex === idx
                    ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg scale-105'
                    : 'border-gray-500 hover:border-white'
                    }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className='w-full h-full object-contain' />
                </button>
              ))}
            </div>
          )}

          {/* Fullscreen image - HARD HEIGHT CAP */}
          <div
            className='flex-1 flex items-center justify-center px-4 md:px-8 bg-white overflow-hidden'
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
           <div className="w-full max-w-[520px] h-[65vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
              {(externalLoading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
           <img
  key={`modal-${selectedIndex}`}
  src={images[selectedIndex]}
  alt='Product'
  className={`max-w-full max-h-full object-contain transition-all duration-300 ease-in-out ${
    externalLoading? 'opacity-0 scale-95' : 'opacity-100 scale-100'
  } ${
    isAnimating
    ? slideDirection === 'right'
      ? 'opacity-0 -translate-x-16'
      : 'opacity-0 translate-x-16'
    : 'opacity-100 translate-x-0'
  }`}
/>

              {/* Desktop modal arrows - BLACK ICONS */}
              {images.length > 1 && (
                <>
                  <button
                  onClick={(e) => { e.stopPropagation(); prevImage() }}
                    disabled={selectedIndex === 0}
                    className='hidden md:flex absolute left-32 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-700 hover:bg-white hover:text-black hover:shadow-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button
                  onClick={(e) => { e.stopPropagation(); nextImage() }}
                    disabled={selectedIndex === images.length - 1}
                    className='hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow-md text-gray-700 hover:bg-white hover:text-black hover:shadow-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <FaChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Mobile counter in modal */}
              {images.length > 1 && (
                <div className=' absolute
                    top-2
                    left-1/2
                    -translate-x-1/2
                    z-30
                    bg-white/80
                    backdrop-blur-md
                    rounded-full
                    px-3
                    py-1
                    shadow-sm'>
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Mobile thumbs in modal */}
          {images.length > 1 && (
            <div className='md:hidden bg-gray-50 border-t border-gray-200'>
              <div className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x 
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                   onClick={(e) => {
                    e.stopPropagation()
                    if (idx === selectedIndex) return;
                    setSlideDirection(idx > selectedIndex ? 'right' : 'left')
                    setIsAnimating(true)
                    setTimeout(() => {
                      setSelectedIndex(idx)
                      setIsAnimating(false)
                    }, 150)
                  }}
                    className={`flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 p-0.5 snap-start 
                      ${selectedIndex === idx
                        ? 'border-blue-600 scale-105 shadow-md'
                        : 'border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className='w-full h-full object-contain rounded-md' />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Product360