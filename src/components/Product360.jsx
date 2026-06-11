import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const Product360 = ({ images, selectedIndex, setSelectedIndex }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className='w-full flex flex-col md:flex-row min-w-0'>

      {/* Desktop Thumbnails - LEFT SIDEBAR */}
      {images.length > 1 && (
        <div className='hidden md:flex flex-col gap-2 w-14 overflow-y-auto scrollbar-thin h-[28rem] mr-3 flex-shrink-0'>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-14 h-14 bg-white rounded border-2 p-0.5 flex-shrink-0 transition-all ${
                selectedIndex === idx
              ? 'border-blue-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img}
                alt={`Thumb ${idx + 1}`}
                className='w-full h-full object-contain'
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container - Added max-w-full */}
      <div className='flex-1 relative group bg-white rounded-lg border border-gray-100 overflow-hidden aspect-square md:h-[28rem] md:aspect-auto min-w-0 w-full'>
        <div className='w-full h-full flex items-center justify-center p-4'>
          <img
            src={images[selectedIndex]}
            alt='Product'
            className='max-w-full max-h-full object-contain cursor-pointer'
            onClick={() => setIsFullscreen(true)}
          />
        </div>

        {/* Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity'
            >
              <FaChevronLeft className='text-gray-800 text-sm' />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity'
            >
              <FaChevronRight className='text-gray-800 text-sm' />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className='absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded'>
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Mobile Thumbnails - NO NEGATIVE MARGIN */}
      {images.length > 1 && (
        <div className='md:hidden mt-3 w-full'>
          <div className='flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 bg-gray-50 rounded border-2 p-0.5 transition-all snap-start ${
                  selectedIndex === idx
               ? 'border-blue-600'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumb ${idx + 1}`}
                  className='w-full h-full object-contain'
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className='fixed inset-0 bg-white z-50 flex flex-col md:flex-row overflow-hidden'>

          <button
            onClick={() => setIsFullscreen(false)}
            className='absolute top-4 right-4 text-gray-800 text-2xl z-20 hover:text-gray-600 bg-white rounded-full p-2 shadow-lg'
          >
            <FaTimes />
          </button>

          {images.length > 1 && (
            <div className='hidden md:flex flex-col gap-2 w-20 p-4 overflow-y-auto bg-gray-50 border-r border-gray-200 flex-shrink-0'>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-16 h-16 bg-white rounded border-2 p-0.5 flex-shrink-0 transition-all ${
                    selectedIndex === idx
                 ? 'border-blue-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    className='w-full h-full object-contain'
                  />
                </button>
              ))}
            </div>
          )}

          <div className='flex-1 min-h-0 relative flex items-center justify-center px-4 md:p-8'>
            <img
              src={images[selectedIndex]}
              alt='Product'
              className='max-w-full max-h-full object-contain'
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className='absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 text-gray-800 shadow-lg'
                >
                  <FaChevronLeft className='text-xl' />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className='absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 text-gray-800 shadow-lg'
                >
                  <FaChevronRight className='text-xl' />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className='md:hidden mt-auto bg-gray-50 border-t border-gray-200'>
              <div className='flex gap-2 overflow-x-auto p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`flex-shrink-0 w-14 h-14 bg-white rounded border-2 p-0.5 snap-start ${
                      selectedIndex === idx
                   ? 'border-blue-600'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      className='w-full h-full object-contain'
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Product360;