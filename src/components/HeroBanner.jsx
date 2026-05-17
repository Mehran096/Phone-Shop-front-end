import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const slides = [
  {
    id: 1,
    title: 'iPhone 15 Pro',
    subtitle: 'Titanium. So strong. So light. So Pro.',
    cta: 'Learn more',
    link: '/',
    img: 'data:image/webp;base64,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',
  },
  {
    id: 2,
    title: 'Galaxy S24 Ultra',
    subtitle: 'Galaxy AI is here. Do more with less effort.',
    cta: 'Learn more',
    link: '/',
    img: 'data:image/webp;base64,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',
  },
  {
    id: 3,
    title: 'Pixel 8 Pro',
    subtitle: 'The Google phone. Powered by AI.',
    cta: 'Learn more',
    link: '/',
    img: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRroBWeklTjsWN2Nx4xfGftvCF8DP13kd_uVRI4rv801UAPhUu47sMhaXNP0k46EeCElfoROU_eQgQQBTqtk_PHweumRbsYDnRUdyiKo1iq&usqp=CAc',
  },
]

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index) => setCurrent(index)

  return (
    <div className="relative rounded-3xl overflow-hidden mb-12 h-[550px] md:h-[600px]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Dark gradient background like OnePlus */}
          <div className="h-full bg-gradient-to-b from-black via-gray-900 to-gray-800 flex-col items-center justify-center text-center px-6">
            
            {/* Text content - centered on top */}
            <div className="z-10 max-w-3xl">
              <p className="text-sm md:text-base text-gray-300 font-light tracking-wide">
                Exceptional Without Exception
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mt-2 tracking-tight">
                {slide.title}
              </h1>
              <p className="mt-3 text-base md:text-xl text-gray-400 font-light">
                {slide.subtitle}
              </p>
              <Link
                to={slide.link}
                className="inline-block mt-6 px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105"
              >
                {slide.cta}
              </Link>
            </div>

            {/* Product image - centered below */}
            <div className="mt-8 md:mt-12 z-10">
              <img
                src={slide.img}
                alt={slide.title}
                className="w-72 md:w-[420px] object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === current? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel