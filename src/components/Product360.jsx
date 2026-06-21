import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'

const Product360 = ({ images, selectedIndex, setSelectedIndex }) => {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const minSwipeDistance = 50

  // Amazon: NO LOOPING - stops at ends
  const nextImage = () => {
    setSelectedIndex((prev) => (prev < images.length - 1? prev + 1 : prev))
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev > 0? prev - 1 : prev))
  }

  // Mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart ||!touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) nextImage()
    if (distance < -minSwipeDistance) prevImage()
  }

  // Desktop keyboard + ESC for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, isFullscreen])

  return (
    <>
      <div className='w-full flex flex-col md:flex-row min-w-0 gap-4'>
        {/* Desktop Thumbnails - LEFT */}
        {images.length > 1 && (
          <div className='hidden md:flex flex-col gap-2 w-14 overflow-y-auto overflow-x-hidden h-[28rem] flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-14 h-14 bg-white rounded border-2 p-0.5 flex-shrink-0 transition-all ${
                  selectedIndex === idx
                ? 'border-blue-600 shadow-md scale-105'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className='w-full h-full object-contain' />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className='flex-1 relative group bg-white rounded-lg border border-gray-100 overflow-hidden aspect-square md:h-[28rem] md:aspect-auto min-w-0 w-full'>
          <div
            className='w-full h-full flex items-center justify-center p-4'
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[selectedIndex]}
              alt='Product'
              className='max-w-full max-h-full object-contain cursor-pointer'
              onClick={() => setIsFullscreen(true)}
            />

            {/* Mobile Counter - TOP CENTER */}
            {images.length > 1 && (
              <div className='md:hidden absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full'>
                {selectedIndex + 1} of {images.length}
              </div>
            )}
          </div>

          {/* Desktop Arrows - NO CIRCLE */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                disabled={selectedIndex === 0}
                className='hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-3 text-gray-700 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition items-center justify-center'
                aria-label='Previous image'
              >
                <FaChevronLeft size={28} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                disabled={selectedIndex === images.length - 1}
                className='hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-3 text-gray-700 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition items-center justify-center'
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
            <div className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 p-0.5 snap-start transition-all duration-200 ${
                    selectedIndex === idx
                ? 'border-blue-600 scale-105 shadow-md'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className='w-full h-full object-contain rounded-md'
                    loading='lazy'
                  />
                </button>
              ))}
            </div>
            <div className='absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none' />
          </div>
        )}
      </div>

      {/* Fullscreen Modal - WHITE BACKGROUND */}
      {isFullscreen && (
        <div
          className='fixed inset-0 bg-white z-50 flex flex-col md:flex-row overflow-hidden'
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close - NO CIRCLE - BLACK ICON */}
          <button
            onClick={() => setIsFullscreen(false)}
            className='absolute top-4 right-4 z-20 p-3 text-gray-700 hover:text-black transition'
            aria-label='Close fullscreen'
          >
            <FaTimes size={28} />
          </button>

          {/* Desktop modal thumbs */}
          {images.length > 1 && (
            <div className='hidden md:flex flex-col gap-2 w-20 p-4 overflow-y-auto overflow-x-hidden bg-gray-50 border-r border-gray-200 flex-shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(idx)
                  }}
                  className={`w-14 h-14 bg-white rounded border-2 p-0.5 flex-shrink-0 transition-all ${
                    selectedIndex === idx
                ? 'border-blue-600 scale-105 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className='w-full h-full object-contain' />
                </button>
              ))}
            </div>
          )}

          {/* Fullscreen image + swipe */}
          <div
            className='flex-1 relative flex items-center justify-center p-4 bg-white'
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]}
              alt='Product'
              className='max-w-full max-h-full object-contain'
            />

            {/* Desktop modal arrows - BLACK ICONS */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  disabled={selectedIndex === 0}
                  className='hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-4 text-gray-700 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition'
                  aria-label='Previous image'
                >
                  <FaChevronLeft size={36} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  disabled={selectedIndex === images.length - 1}
                  className='hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-4 text-gray-700 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed transition'
                  aria-label='Next image'
                >
                  <FaChevronRight size={36} />
                </button>
              </>
            )}

            {/* Mobile counter in modal */}
            {images.length > 1 && (
              <div className='md:hidden absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full'>
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Mobile thumbs in modal */}
          {images.length > 1 && (
            <div className='md:hidden bg-gray-50 border-t border-gray-200'>
              <div className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIndex(idx)
                    }}
                    className={`flex-shrink-0 w-14 h-14 bg-white rounded-lg border-2 p-0.5 snap-start ${
                      selectedIndex === idx
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