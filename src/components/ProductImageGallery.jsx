import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const ProductImageGallery = ({ images = [], selectedImage, onSelectImage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const thumbnailRef = useRef(null);

  // Sync index when selectedImage changes from outside
  useEffect(() => {
    const idx = images.findIndex(img => img === selectedImage);
    if (idx!== -1) setCurrentIndex(idx);
  }, [selectedImage, images]);

  const goPrev = () => {
    const newIndex = currentIndex === 0? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onSelectImage(images[newIndex]);
    scrollThumbnail(newIndex);
  };

  const goNext = () => {
    const newIndex = currentIndex === images.length - 1? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onSelectImage(images[newIndex]);
    scrollThumbnail(newIndex);
  };

  const scrollThumbnail = (index) => {
    const el = thumbnailRef.current?.children[index];
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const handleThumbnailClick = (img, index) => {
    setCurrentIndex(index);
    onSelectImage(img);
  };

  return (
    <div className="w-full">
      {/* MAIN IMAGE */}
      <div className="relative border-gray-200 rounded-lg p-4 bg-white shadow-sm group">
        <img
          src={selectedImage}
          alt="Product"
          className="w-full h-[450px] object-contain cursor-zoom-in transition"
          onClick={() => setIsModalOpen(true)}
        />

        {/* ARROWS */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
        >
          <FaChevronLeft size={18} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
        >
          <FaChevronRight size={18} />
        </button>
      </div>

      {/* THUMBNAILS - HORIZONTAL SCROLL 1 ROW */}
      <div
        ref={thumbnailRef}
        className="flex gap-3 mt-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(img, index)}
            className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg p-1 transition ${
              selectedImage === img
               ? 'border-blue-600'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <FaTimes size={28} />
            </button>
            <img
              src={selectedImage}
              alt="Zoom"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Modal arrows */}
            <button onClick={(e) => {e.stopPropagation(); goPrev()}} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full">
              <FaChevronLeft size={22} color="white" />
            </button>
            <button onClick={(e) => {e.stopPropagation(); goNext()}} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full">
              <FaChevronRight size={22} color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;