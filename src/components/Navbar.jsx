import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { FaChevronDown } from 'react-icons/fa'
import { useGetBrandMenuProductsQuery } from '../slices/productsApiSlice' // V38.30

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [showAccessoryMenu, setShowAccessoryMenu] = useState(false)
    const [showBrandMenu, setShowBrandMenu] = useState(null)
    const [hoveredBrand, setHoveredBrand] = useState(null) // V38.30 KEY
    const dropdownRef = useRef(null)
    const timeoutRef = useRef(null)

   

    const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo']

    // REMOVED: const brandPhones = {...} We fetch this now

    // RTK Query - only fetches when hoveredBrand is set
    const {
        data: brandProducts = [],
        isLoading: loadingBrand
    } = useGetBrandMenuProductsQuery(hoveredBrand, {
        skip: !hoveredBrand
    })

    const accessoryTypes = [
    { name: 'Cases', dbValue: 'case', sub: ['iPhone Cases', 'Samsung Cases', 'Google Pixel Cases'] },
    { name: 'Chargers', dbValue: 'charger', sub: ['Chargers', 'Fast Chargers 20W+'] },
    { name: 'Cables', dbValue: 'cable', sub: ['Cables', 'USB-C Cables', 'Lightning Cables'] },
    { name: 'Screen Protectors', dbValue: 'glass', sub: ['Screen Protectors'] },
    { name: 'Audio', dbValue: 'audio', sub: ['Audio Adapters'] },
    { name: 'Holders & Stands', dbValue: 'holder', sub: ['Holders / Stands'] },
]

    const activeBrand = searchParams.get('brand')
    const activeCategory = location.pathname.startsWith('/category/') ? location.pathname.split('/')[2]
        : location.pathname.startsWith('/accessory/') ? location.pathname.split('/')[2]
            : location.pathname === '/accessories' ? 'all' : null

    useEffect(() => {
        setShowAccessoryMenu(false)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }, [location.pathname])

    useEffect(() => {
        const handleMouseLeave = () => {
            setShowAccessoryMenu(false)
            setShowBrandMenu(null)
            setHoveredBrand(null)
        }
        const el = dropdownRef.current
        if (el) el.addEventListener('mouseleave', handleMouseLeave)
        return () => el?.removeEventListener('mouseleave', handleMouseLeave)
    }, [])

    const handleBrandHover = (brand) => {
        clearTimeout(timeoutRef.current)
        setHoveredBrand(brand)
        setShowBrandMenu(brand)
    }

    const handleBrandLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowBrandMenu(null)
            setHoveredBrand(null)
        }, 150) // small delay so mouse can move to menu
    }

    const handleBrandClick = (brand) => {
        navigate(`/products?brand=${brand}`)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }

    const handleNewBrandClick = (brand) => {
        navigate(`/products?brand=${brand}&filter=new`)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }

    const handleBrandAccessoryClick = (brand) => {
        navigate(`/accessories?brand=${brand}`)
        setShowBrandMenu(null)
        setHoveredBrand(null)
    }
    const handleTypeClick = (dbValue) => {
    navigate(`/accessories?type=${encodeURIComponent(dbValue)}`)
    setShowAccessoryMenu(false)
}
    const handleSubCategoryClick = (subCat) => {
        const slug = subCat.toLowerCase().replace(/\s+/g, '-')
        navigate(`/category/${slug}`)
    }

    return (
        <div className='bg-gray-800 border-t border-gray-700 relative hidden lg:block' ref={dropdownRef}>
            <div className='container mx-auto px-4'>
                <div className='flex items-center h-10 text-sm'>

                    {/* PRODUCTS SECTION WITH BRAND HOVER */}
                    <span className='text-gray-400 mr-4 font-medium whitespace-nowrap'>Products:</span>
                    <div className='flex items-center space-x-1'>
                        {brands.map((brand) => (
                            <div
                                key={brand}
                                onMouseEnter={() => {
                                    handleBrandHover(brand)
                                    setShowAccessoryMenu(false) // CLOSE ACCESSORY
                                }}
                                onMouseLeave={handleBrandLeave}
                                className="relative"
                            >
                                <button
                                    onClick={() => handleBrandClick(brand)}
                                    className={`text-sm px-3 py-1.5 rounded-md transition-all whitespace-nowrap
                    ${activeBrand === brand
                                            ? 'bg-gray-700 text-white font-semibold'
                                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        }`}
                                >
                                    {brand}
                                </button>

                                {/* BRAND MEGA MENU WITH REAL PRODUCTS */}
                                {showBrandMenu === brand && (
                                    <div className="fixed top-[104px] left-0 w-full bg-[#1a1a1a] text-white shadow-2xl z-[9999] border-t border-gray-700">
                                        <div className="w-full px-4 py-4 grid grid-cols-[200px_1fr_1fr_240px] gap-3 max-w-[1300px] mx-auto">

                                            {/* COL 1: LINKS */}
                                            <div className="pr-2">
                                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">{brand}</p>
                                                <button onClick={() => handleBrandClick(brand)} className="text-[15px] font-semibold hover:text-blue-400 block mb-2 text-left">All {brand} Phones</button>
                                                <button
                                                    onClick={() => handleNewBrandClick(brand)}
                                                    className="text-[15px] font-semibold hover:text-blue-400 block mb-2 text-left"
                                                >
                                                    New {brand}
                                                </button>

                                                <button
                                                    onClick={() => handleBrandAccessoryClick(brand)}
                                                    className="text-[15px] font-semibold hover:text-blue-400 block mb-2 text-left"
                                                >
                                                    {brand} Accessories
                                                </button>
                                            </div>

                                            {/* COL 2-3: PRODUCTS WITH IMAGE + PRICE */}
                                            <div className="col-span-2">
                                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">Popular {brand} Phones</p>

                                                {loadingBrand ? (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {[...Array(6)].map((_, i) => (
                                                            <div key={i} className="animate-pulse">
                                                                <div className="bg-gray-700 rounded-md h-20 mb-2"></div>
                                                                <div className="bg-gray-700 h-4 rounded w-3/4 mb-1"></div>
                                                                <div className="bg-gray-700 h-4 rounded w-1/2"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : brandProducts.length === 0 ? (
                                                    <p className="text-gray-400 text-sm">No products found</p>
                                                ) : (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {brandProducts.map((product) => (
                                                            <button
                                                                key={product._id}
                                                                onClick={() => navigate(`/product/${product.slug}`)}
                                                                className="group text-left hover:bg-gray-800 p-1.5 rounded-lg transition-all"
                                                            >
                                                                <div className="bg-white rounded-md p-1.5 mb-1.5">
                                                                    <img src={product.image} alt={product.name} className="w-full h-28 object-contain" />
                                                                </div>
                                                                <p className="text-[12px] font-medium text-gray-200 group-hover:text-white line-clamp-2 h-9 leading-tight">
                                                                    {product.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-[13px] font-bold text-blue-400">${product.price}</p>
                                                                    {product.discountPercent > 0 && (
                                                                        <p className="text-[10px] text-gray-400 line-through">${product.originalPrice}</p>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>


                                            {/* COL 4: FEATURED BANNER */}
                                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 h-fit border border-gray-700">
                                                <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2 font-semibold">Featured {brand}</p>

                                                {/* Dynamic Banner Image */}
                                                <div className="relative rounded-md overflow-hidden mb-3 bg-white">
                                                    <img
                                                        src={`/images/${brand.toLowerCase()}.svg`}
                                                        alt={`${brand} deals`}
                                                        className="w-full h-32 object-contain p-2"
                                                        onError={(e) => e.target.src = `/images/${brand.toLowerCase()}.png`}
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                        <p className="text-[10px] text-white font-semibold">
                                                            Up to {{ Apple: '10%', Samsung: '25%', Google: '20%' }[brand] || '15%'} OFF
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleBrandClick(brand)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-4 py-2 rounded-md w-full transition-all"
                                                >
                                                    Shop All {brand}
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* DIVIDER + ACCESSORY MENU */}
                    <div className="w-px h-5 bg-gray-600 mx-5"></div>
                    <span className='text-gray-400 mr-3 font-medium whitespace-nowrap'>Accessory:</span>
                    <div
                        onMouseEnter={() => {
                            setShowAccessoryMenu(true)
                            setShowBrandMenu(null)
                            setHoveredBrand(null)
                        }}
                        className="relative"
                    >
                        <button
                            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all
                ${activeCategory ? 'bg-gray-700 text-white font-semibold' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
                        >
                            Shop <FaChevronDown className={`text-xs transition-transform duration-200 ${showAccessoryMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showAccessoryMenu && (
                            <div className="fixed top-[104px] left-0 w-full bg-[#1a1a1a] text-white shadow-2xl z-[99999] border-t border-gray-700">
                                <div className="container mx-auto px-8 py-5 grid grid-cols-4 gap-8 max-w-[1300px]">
                                    {/*...same accessory columns from V38.26... */}
                                    <div>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4 font-semibold">Shop by Type</p>
                                        <button onClick={() => { navigate('/accessories'); setShowAccessoryMenu(false) }} className="text-[15px] font-semibold hover:text-blue-400 block mb-2.5">All Accessories</button>
                                        {accessoryTypes.map((type) => (
                                            <button key={type.dbValue} onClick={() => handleTypeClick(type.dbValue)} className="text-[15px] font-semibold hover:text-blue-400 block mb-2.5">{type.name}</button>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4 font-semibold">Shop by Category</p>
                                        <div className="space-y-1">
                                            {accessoryTypes.map((type) => type.sub.map((subCat) => (
                                                <button key={subCat} onClick={() => handleSubCategoryClick(subCat)} className="text-[14px] text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded-md block w-full text-left">{subCat}</button>
                                            )))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4 font-semibold">More to Explore</p>
                                        <div className="space-y-1">
                                            <button className="text-[14px] text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded-md block w-full text-left">New Arrivals</button>
                                            <button className="text-[14px] text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded-md block w-full text-left">Best Sellers</button>
                                            <button className="text-[14px] text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded-md block w-full text-left">Deals</button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800 rounded-lg p-4 h-fit border border-gray-700">
                                        <p className="text-sm font-semibold">Featured</p>
                                        <p className="text-xs text-gray-400 mt-1 mb-3">iPhone 17 Cases</p>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-md w-full">Shop Now</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Navbar




