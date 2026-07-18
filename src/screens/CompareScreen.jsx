import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  addToCompare,
  removeFromCompare,
} from '../slices/compareSlice';

const CompareScreen = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.compare);
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

  const getSelectedColor = (product) => {
    const variant = getSelectedVariant(product);

    return (
      variant.colors.find(
        (color) => color.name === selectedVariants[product._id]?.color
      ) || variant.colors[0]
    );
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

  return (
    <>
      <div className="flex items-center justify-between mb-6 mt-5">
  <Link
    to="/"
    className="w-32 lg:w-44 text-blue-600 hover:underline ml-2"
  >
    ← <span className="hidden sm:inline">Back to Home</span>
  </Link>

  <h1 className="text-xl lg:text-3xl font-bold text-center flex">
    Compare Phones
  </h1>

  <div className="w-32 lg:w-42" />
</div>
      {/* Desktop */}
      <div className="hidden mx-2 lg:block overflow-x-auto rounded-xl border bg-white shadow-sm">
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

                    <button
                      onClick={() => dispatch(removeFromCompare(product._id))}
                      className="mt-4 text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
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
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-3 mx-2">

          {products.map((product) => {
            const variant = getSelectedVariant(product);
            const color = getSelectedColor(product);


            return (
              <div
                key={product._id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative bg-gray-50 p-6 flex justify-center">

                  <button
                    onClick={() => dispatch(removeFromCompare(product._id))}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50"
                  >
                    ✕
                  </button>

                  <img
                    src={variant.colors?.find(
                      (c) =>
                        c.name ===
                        (selectedVariants[product._id]?.color ||
                          variant.colors?.[0]?.name)
                    )?.images?.[0]?.url}
                    alt={product.name}
                    className="h-52 object-contain"
                  />



                </div>

                {/* Product Info */}
                <div className="p-4">

                  <h2 className="font-semibold text-lg">
                    {product.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {product.brand}
                  </p>

                  {/* Price */}
                  <div className="mt-3 text-2xl font-bold text-blue-600">
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
                      Storage
                    </label>

                    <select
                      className="w-full border rounded-lg p-2"
                      value={
                        selectedVariants[product._id]?.storage || ""
                      }
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
                      {product.variants.map((v) => (
                        <option
                          key={v.storage}
                          value={v.storage}
                        >
                          {v.storage}
                        </option>
                      ))}
                    </select>

                  </div>

                  {/* Color */}
                  <div>

                    <label className="block text-sm font-medium mb-1">
                      Color
                    </label>

                    <select
                      className="w-full border rounded-lg p-2"
                      value={
                        selectedVariants[product._id]?.color || ""
                      }
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

                  </div>

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

                </div>

                
              </div>
            );
          })}
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
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Chipset</span>
                        <span className="break-words text-gray-900">{variant.specs?.Chipset || "-"}</span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">RAM</span>
                        <span className="break-words text-gray-900">{variant.specs?.RAM || "-"}</span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Storage</span>
                        <span className="break-words text-gray-900">{variant.specs?.Storage || "-"}</span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Operating System</span>
                        <span className="break-words text-gray-900">{variant.specs?.OS || "-"}</span>
                      </div>
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

                    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                      <span className="font-medium text-gray-700">
                        Display
                      </span>

                      <span className="break-words text-gray-900">
                        {variant.specs?.Display || "-"}
                      </span>
                    </div>
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
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Rear Camera</span>
                        <span className="break-words text-gray-900">{variant.specs?.["Rear Camera"] || "-"}</span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Front Camera</span>
                        <span className="break-words text-gray-900">{variant.specs?.["Front Camera"] || "-"}</span>
                      </div>
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

                    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                      <span className="font-medium text-gray-700">Battery</span>
                      <span className="break-words text-gray-900">{variant.specs?.Battery || "-"}</span>
                    </div>
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
                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Build</span>
                        <span className="break-words text-gray-900">{variant.specs?.Build || "-"}</span>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                        <span className="font-medium text-gray-700">Other</span>
                        <span className="break-words text-gray-900">{variant.specs?.Other || "-"}</span>
                      </div>
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

                    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                      <span className="font-medium text-gray-700">Connectivity</span>
                      <span className="break-words text-gray-900">{variant.specs?.Connectivity || "-"}</span>
                    </div>
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

export default CompareScreen;