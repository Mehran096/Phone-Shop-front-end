import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  addToCompare,
  removeFromCompare,
} from '../slices/compareSlice';
import { FaChevronDown, FaTrophy } from 'react-icons/fa';

const CompareProducts = ({ products, showRemove = true, }) => {
  const dispatch = useDispatch();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showDifferences, setShowDifferences] = useState(false);
  //const { products } = useSelector((state) => state.compare);
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const obj = {};

    products.forEach((product) => {
      obj[product._id] = {
        storage: product.defaultStorage,
        color: product.defaultColor,
      };
    });

    return obj;
  });
  //for mobile screen only /start
  const [openSections, setOpenSections] = useState({
    overview: true,
    performance: false,
    display: false,
    camera: false,
    battery: false,
    design: false,
    connectivity: false,
  });
  //for mobile screen only /end
  useEffect(() => {
    const obj = {};

    products.forEach((product) => {
      obj[product._id] = {
        storage: product.defaultStorage,
        color: product.defaultColor,
      };
    });

    setSelectedVariants(obj);
  }, [products]);

  const getSelectedVariant = (product) => {
    const selected = selectedVariants[product._id];

    return (
      product.variants.find(
        (v) => v.storage === selected?.storage
      ) || product.variants[0]
    );
  };

  //for mobile screen only
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSelectedColor = (product) => {
    const variant = getSelectedVariant(product);

    return (
      variant.colors.find(
        (color) => color.name === selectedVariants[product._id]?.color
      ) || variant.colors[0]
    );
  };

  //for spesc highlights
  const comparableSpecs = [
    "RAM",
    "Storage",
    "Battery",
    "Refresh Rate",
    "Charging",
    "Brightness",
    "Display",
    "OS",
    "Chipset",
    "Rear Camera",
    "Front Camera",
    "Build",
    "Other",
    "Connectivity",
  ];

  //handler for specs
  const extractNumber = (value) => {
    if (!value) return 0;

    const match = value.toString().match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const isBestValue = (specKey, value) => {
    if (!comparableSpecs.includes(specKey)) return false;

    const values = products.map((product) => {
      const variant = getSelectedVariant(product);
      return extractNumber(variant.specs?.[specKey]);
    });

    const max = Math.max(...values);

    return extractNumber(value) === max && max > 0;
  };

  //handler for specs difference
  const shouldShowRow = (specKey) => {
    if (!showDifferences) return true;

    const values = products.map((product) => {
      const variant = getSelectedVariant(product);
      return (variant.specs?.[specKey] || "").trim();
    });

    return new Set(values).size > 1;
  };




  //const variant = getSelectedVariant(product);
  //console.log(products);
  const TableRow = ({ title, renderValue }) => (
    <tr className="border-b last:border-b-0">
      <td className="bg-gray-50 font-semibold text-gray-800 px-5 py-4 min-w-[260px] text-center">
        {title}
      </td>

      {products.map((product) => (
        <td
          key={product._id}
          className="px-5 py-4 text-center"
        >
          {renderValue(product)}
        </td>
      ))}
    </tr>
  );

  //for mobile screen
  const MobileSection = ({
    title,
    sectionKey,
    openSections,
    setOpenSections,
    children,
  }) => {
    const open = openSections[sectionKey];

    return (
      <div className="border-t">

        <button
          onClick={() =>
            setOpenSections((prev) => ({
              ...prev,
              [sectionKey]: !prev[sectionKey],
            }))
          }
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 font-semibold"
        >
          <span>{title}</span>

          <span className="text-xl">
            {open ? "−" : "+"}
          </span>
        </button>

        {open && (
          <div className="p-4 space-y-3">
            {children}
          </div>
        )}

      </div>
    );
  };

  //custom drop down for mobile
  const CustomDropdown = ({ value, onChange, options, label, displayMap = {} }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={ref} className="relative w-full md:w-auto md:min-w-[160px]">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 border-gray-300 rounded-lg px-4 py-3 text-base bg-white 
            hover:border-gray-400 transition"
        >
          <span className="text-gray-900">
            {options.find((opt) => opt.value === value)?.label || label}
          </span>
          <FaChevronDown size={18} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[999] 
            max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm text-gray-900
                                    hover:bg-gray-100 ${value === opt.value ? 'bg-gray-100 font-medium' : ''
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-[1200px] w-full border-collapse">
          <thead className='w-56'>
            <TableRow
              title="image"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product, variant);

                return (
                  <div className="flex flex-col items-center py-4">
                    <img
                      src={
                        color?.images?.[0]?.url ||
                        product.defaultImage
                      }
                      alt={product.name}
                      className="h-52 w-auto object-contain"
                    />

                    {showRemove && (
                      <button
                        onClick={() => dispatch(removeFromCompare(product._id))}
                        className="mt-4 text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              }}
            />
            <TableRow
              title="Name"
              renderValue={(product) => (
                <span className="font-medium">
                  {product.name}
                </span>
              )}
            />

            <TableRow
              title="Brand"
              renderValue={(product) => product.brand}
            />
            <TableRow
              title="Starting Price"
              renderValue={(product) => {

                const color = getSelectedColor(product);
                return `$${color.price}`;
              }}

            />

            <TableRow
              title="Rating"
              renderValue={(product) => (
                <>
                  ⭐ {product.rating?.toFixed(1) || 0}
                </>
              )}
            />
            <TableRow
              title="Reviews"
              renderValue={(product) => product.numReviews}
            />
            <TableRow
              title="Storage"
              renderValue={(product) => <select
                className="mt-2 w-full border rounded-md p-2"
                value={selectedVariants[product._id]?.storage || ""}
                onChange={(e) =>
                  setSelectedVariants((prev) => ({
                    ...prev,
                    [product._id]: {
                      ...prev[product._id],
                      storage: e.target.value,
                    },
                  }))
                }
              >
                {product.variants.map((variant) => (

                  <option
                    key={variant.storage}
                    value={variant.storage}
                  >
                    {variant.storage}
                  </option>
                ))}
              </select>}
            />
            <TableRow
              title="Colors"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);

                return (
                  <select
                    className="mt-2 border rounded-md p-2  w-full"
                    value={selectedVariants[product._id]?.color || ""}
                    onChange={(e) =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [product._id]: {
                          ...prev[product._id],
                          color: e.target.value,
                        },
                      }))
                    }
                  >
                    {variant.colors.map((color) => (
                      <option
                        key={color.name}
                        value={color.name}
                      >
                        {color.name}
                      </option>
                    ))}
                  </select>
                );
              }}
            />
            <TableRow
              title="Display"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);

                return variant.specs?.Display || "-";
              }}
            />

            <TableRow
              title="RAM"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);

                return variant.specs?.RAM || "-";
              }}
            />

            <TableRow
              title="Rear Camera"

              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                return variant.specs?.["Rear Camera"] || "-";
              }}

            />

            <TableRow
              title="Front Camera"

              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                return variant.specs?.["Front Camera"] || "-";
              }}


            />

            <TableRow
              title="Battery"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                return variant.specs?.Battery || "-";
              }}

            />

            <TableRow
              title="Chipset"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                return variant.specs?.Chipset || "-";
              }}
            />

            <TableRow
              title="Operating System"
              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                return variant.specs?.OS || "-";
              }}
            />

            <TableRow
              title="Build"

              renderValue={(product) => {
                const variant = getSelectedVariant(product);
                return variant.specs?.Build || "-";
              }}
            />


          </thead>

        </table>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Performance</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Chipset"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);

                  return variant.specs?.Chipset || "-";
                }}

              />

              <TableRow
                title="RAM"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);

                  return variant.specs?.RAM || "-";
                }}
              />

              <TableRow
                title="Storage"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);

                  return variant.specs?.Storage || "-";
                }}
              />

              <TableRow
                title="Operating System"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);

                  return variant.specs?.OS || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Display</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Display"
                renderValue={(product) => {
                  const variant = getSelectedVariant(product);

                  return variant.specs?.Display || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Camera</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Rear Camera"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);
                  return variant.specs?.["Rear Camera"] || "-";
                }}
              />

              <TableRow
                title="Front Camera"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);
                  return variant.specs?.["Front Camera"] || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Battery</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Battery"
                renderValue={(product) => {
                  const variant = getSelectedVariant(product);
                  return variant.specs?.Battery || "-";
                }}
              />

            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Design</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Build"
                renderValue={(product) => {
                  const variant = getSelectedVariant(product);
                  return variant.specs?.Build || "-";
                }}
              />

              <TableRow
                title="Other"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);
                  return variant.specs?.Other || "-";
                }}
              />

              {/* <TableRow
        title="Colors"
        renderValue={(product) =>
          product.defaultColor?.join(", ") || "-"
        }
      /> */}

            </tbody>
          </table>
        </div>
        <div className="mt-10 mb-10">
          <h2 className="text-2xl font-bold mb-4 ml-2">Connectivity</h2>

          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>

              <TableRow
                title="Connectivity"

                renderValue={(product) => {
                  const variant = getSelectedVariant(product);
                  return variant.specs?.Connectivity || "-";
                }}

              />

            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
    MOBILE LAYOUT
========================= */}
      <div className="lg:hidden bg-gray-100">

        <div className="grid grid-cols-2 gap-2">

          {products.map((product) => {
            const variant = getSelectedVariant(product);
            const color = getSelectedColor(product);


            return (
              <div
                key={product._id}
                className="w-full bg-white rounded-xl border shadow-md overflow-visible"
              >
                {/* Product Image */}
                <div className="relative bg-gray-50 pt-8 pb-6 flex justify-center">
                  {showRemove && (
                    <button
                      onClick={() => dispatch(removeFromCompare(product._id))}
                      className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                  <img
                    src={variant.colors?.find(
                      (c) =>
                        c.name ===
                        (selectedVariants[product._id]?.color ||
                          variant.colors?.[0]?.name)
                    )?.images?.[0]?.url}
                    alt={product.name}
                    className="h-40 w-auto object-contain"
                  />



                </div>

                {/* Product Info */}
                <div className="p-4">

                  <h2 className="font-semibold text-lg line-clamp-2">
                    {product.name}
                  </h2>

                  {/* <p className="text-sm text-gray-500">
                    {product.brand}
                  </p> */}

                  {/* Price */}
                  <div className="mt-2 text-2xl font-bold text-blue-600">
                    ${getSelectedColor(product)?.price?.toLocaleString() || 0}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">

                    <span className="text-yellow-500">
                      ★
                    </span>

                    <span className="font-medium">
                      {product.rating?.toFixed(1) || 0}
                    </span>

                    <span className="text-gray-500">
                      ({product.numReviews})
                    </span>

                  </div>

                </div>

                {/* Variant Selectors */}
                <div className="border-t p-4 space-y-4">

                  {/* Storage */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Storage
                    </label>

                    <div className="relative border rounded-lg">
                      <CustomDropdown
                        value={selectedVariants[product._id]?.storage || ""}
                        onChange={(storage) =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [product._id]: {
                              ...prev[product._id],
                              storage,
                            },
                          }))
                        }
                        options={product.variants.map((v) => ({
                          value: v.storage,
                          label: v.storage,
                        }))}
                        label="storage"
                      />


                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Color
                    </label>
                    <div className="relative border rounded-lg">
                      <CustomDropdown
                        value={selectedVariants[product._id]?.color || ""}
                        onChange={(color) =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [product._id]: {
                              ...prev[product._id],
                              color,
                            },
                          }))
                        }
                        options={variant.colors.map((color) => ({
                          value: color.name,
                          label: color.name,
                        }))}
                        label="Color"
                      />
                    </div>
                  </div>
                  {showRemove && (
                    <MobileSection
                      title="Overview"
                      sectionKey="overview"
                      openSections={openSections}
                      setOpenSections={setOpenSections}
                    >

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Reviews
                        </span>

                        <span>
                          {product.numReviews}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Storage
                        </span>

                        <span>
                          {variant.storage}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Color
                        </span>

                        <span>
                          {selectedVariants[product._id]?.color ||
                            variant.colors?.[0]?.name}
                        </span>
                      </div>

                    </MobileSection>
                  )}

                </div>


              </div>
            );
          })}
        </div>


        {/* sticky header */}
        <div
          className={`
    sticky top-16 z-40 lg:hidden
    transition-all duration-300 ease-in-out mt-2
    ${showStickyHeader
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
            }
  `}
        >
          <div className="bg-white border-b shadow-sm">
            <div className="grid grid-cols-2 gap-2 px-2 py-2">
              {products.map((product) => {
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product);

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-2 bg-white border rounded-lg p-2 shadow-sm"
                  >
                    <img
                      src={color?.images?.[0]?.url || product.defaultImage}
                      alt={product.name}
                      className="w-10 h-10 object-contain flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">
                        {product.name}
                      </p>

                      <p className="text-[11px] text-gray-500 truncate">
                        {variant.storage} • {color?.name}
                      </p>
                      <p className="text-xs font-bold text-blue-600">
                        ${color?.price || product.price}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Specifications Difference */}

        <div className="flex items-center justify-between mx-2 mt-2 mb-4">
          <h2 className="text-lg font-bold">
            Specifications
          </h2>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDifferences}
              onChange={() =>
                setShowDifferences((prev) => !prev)
              }
              className="w-4 h-4 accent-blue-600"
            />

            <span className="text-sm font-medium">
              Show only differences
            </span>
          </label>
        </div>

        {/* Specifications */}
        <div className="space-y-6 mt-8 mx-2">

          {/* Performance */}
          <div className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Performance</h2>

            <div className="space-y-4 p-4">
              {products.map((product) => {
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2 text-sm">

                      {shouldShowRow("Chipset") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Chipset</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Chipset", variant.specs?.Chipset)
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.Chipset || "-"}

                            {isBestValue("Chipset", variant.specs?.Chipset) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5  text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {shouldShowRow("RAM") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">RAM</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("RAM", variant.specs?.RAM)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                              }`}
                          >
                            {variant.specs?.RAM || "-"}
                            {isBestValue("RAM", variant.specs?.RAM) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                      {shouldShowRow("Storage") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Storage</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Storage", variant.specs?.Storage)
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.Storage || "-"}
                            {isBestValue("Storage", variant.specs?.Storage) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                      {shouldShowRow("OS") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Operating System</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("OS", variant.specs?.OS)
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.OS || "-"}
                            {isBestValue("OS", variant.specs?.OS) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Display */}
          <div className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Display</h2>

            <div className="space-y-4 p-4">
              {products.map((product) => {
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>
                    {shouldShowRow("Display") && (
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">
                          Display
                        </span>

                        <span
                          className={`break-words rounded px-2 py-1 ${isBestValue("Display", variant.specs?.Display)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                            }`}
                        >
                          {variant.specs?.Display || "-"}
                          {isBestValue("Display", variant.specs?.Display) && (
                            <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                              <FaTrophy className="text-[10px]" />
                              Best
                            </span>
                          )}
                        </span>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Camera */}
          <div className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Camera</h2>

            <div className="space-y-4 p-4">
              {products.map((product) => {
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2 text-sm">
                      {shouldShowRow("Rear Camera") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Rear Camera</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Rear Camera", variant.specs?.["Rear Camera"])
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.["Rear Camera"] || "-"}
                            {isBestValue("Rear Camera", variant.specs?.["Rear Camera"]) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                      {shouldShowRow("Front Camera") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Front Camera</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Front Camera", variant.specs?.["Front Camera"])
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.["Front Camera"] || "-"}

                            {isBestValue("Front Camera", variant.specs?.["Front Camera"]) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>

                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Battery */}
          <div className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Battery</h2>

            <div className="space-y-4 p-4">
              {products.map((product) => {
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>
                    {shouldShowRow("Battery") && (
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Battery</span>
                        <span
                          className={`break-words rounded px-2 py-1 ${isBestValue("Battery", variant.specs?.Battery)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                            }`}
                        >
                          {variant.specs?.Battery || "-"}
                          {isBestValue("Battery", variant.specs?.Battery) && (
                            <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                              <FaTrophy className="text-[10px]" />
                              Best
                            </span>
                          )}
                        </span>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design */}
          <div className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Design</h2>

            <div className="space-y-4 p-4">
              {products.map((product) => {
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2 text-sm">
                      {shouldShowRow("Build") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Build</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Build", variant.specs?.Build)
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.Build || "-"}
                            {isBestValue("Build", variant.specs?.Build) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {shouldShowRow("Other") && (
                        <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                          <span className="font-medium text-gray-700">Other</span>
                          <span
                            className={`break-words rounded px-2 py-1 ${isBestValue("Other", variant.specs?.Other)
                                ? "bg-green-100 text-green-700 font-semibold"
                                : "text-gray-900"
                              }`}
                          >{variant.specs?.Other || "-"}
                            {isBestValue("Other", variant.specs?.Other) && (
                              <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                                <FaTrophy className="text-[10px]" />
                                Best
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connectivity */}
          <div className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Connectivity</h2>

            <div className="space-y-4 p-4">
              {products.map((product) => {
                const variant = getSelectedVariant(product);

                return (
                  <div key={product._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{product.name}</h3>
                    {shouldShowRow("Connectivity") && (
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Connectivity</span>
                        <span
                          className={`break-words rounded px-2 py-1 ${isBestValue("Connectivity", variant.specs?.Connectivity)
                              ? "bg-green-100 text-green-700 font-semibold"
                              : "text-gray-900"
                            }`}
                        >{variant.specs?.Connectivity || "-"}
                          {isBestValue("Connectivity", variant.specs?.Connectivity) && (
                            <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 text-[10px] font-semibold text-white">
                              <FaTrophy className="text-[10px]" />
                              Best
                            </span>
                          )}

                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>


      </div>

    </>
  );
};

export default CompareProducts;