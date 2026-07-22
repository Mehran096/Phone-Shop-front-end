import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  addToCompare,
  removeFromCompare,
} from '../slices/compareSlice';
import { FaChevronDown, FaTrophy } from 'react-icons/fa';
import CompareSearch from './CompareSearch';

const CompareProducts = ({ products, showRemove = true, onReplace, onClear }) => {
  const dispatch = useDispatch();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showDifferences, setShowDifferences] = useState(false);
  //const { products } = useSelector((state) => state.compare);
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const obj = {};

    products.filter(Boolean).forEach((product) => {
      obj[product._id] = {
        storage: product.defaultStorage,
        color: product.defaultColor,
      };
    });

    return obj;
  });

  //for sticky specs scrolling
  const performanceRef = useRef(null);
  const displayRef = useRef(null);
  const cameraRef = useRef(null);
  const batteryRef = useRef(null);
  const connectivityRef = useRef(null);
  const designRef = useRef(null);
  const phoneRef = useRef(null);

  const scrollToSection = (ref) => {
    const offset = 180;
   window.scrollTo({
    top: ref.current.offsetTop - offset,
    behavior: "smooth",
  });
  };
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

    products.filter(Boolean).forEach((product) => {
      obj[product._id] = {
        storage: product.defaultStorage,
        color: product.defaultColor,
      };
    });

    setSelectedVariants(obj);
  }, [products]);

  const getSelectedVariant = (product) => {
    if (!product) return null;

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
    if (!product) return null
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
    const getValidProducts = () => products.filter(Boolean);
    if (!comparableSpecs.includes(specKey)) return false;

    // Special handling for Chipset
    if (specKey === "Chipset") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getChipsetRank(variant.specs?.Chipset);
      });

      const max = Math.max(...values);

      return getChipsetRank(value) === max && max > 0;
    }

    if (specKey === "Storage") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getStorageScore(variant.specs?.Storage);
      });

      const max = Math.max(...values);

      return getStorageScore(value) === max && max > 0;
    }

    if (specKey === "RAM") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getRamScore(variant.specs?.RAM);
      });

      const max = Math.max(...values);

      return getRamScore(value) === max && max > 0;
    }

    if (specKey === "Battery") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getBatteryScore(variant.specs?.Battery);
      });

      const max = Math.max(...values);

      return getBatteryScore(value) === max && max > 0;
    }

    if (specKey === "Display") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getDisplayScore(variant.specs?.Display);
      });

      const max = Math.max(...values);

      return getDisplayScore(value) === max && max > 0;
    }

    if (specKey === "Rear Camera") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getRearCameraScore(variant.specs?.["Rear Camera"]);
      });

      const max = Math.max(...values);

      return getRearCameraScore(value) === max && max > 0;
    }

    if (specKey === "Front Camera") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getRearCameraScore(variant.specs?.["Front Camera"]);
      });

      const max = Math.max(...values);

      return getRearCameraScore(value) === max && max > 0;
    }

    if (specKey === "Build") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getBuildScore(variant.specs?.Build);
      });

      const max = Math.max(...values);

      return getBuildScore(value) === max && max > 0;
    }

    if (specKey === "Connectivity") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getConnectivityScore(variant.specs?.Connectivity);
      });

      const max = Math.max(...values);

      return getConnectivityScore(value) === max && max > 0;
    }

    if (specKey === "OS") {
      const values = getValidProducts().map((product) => {
        const variant = getSelectedVariant(product);
        return getOSScore(variant.specs?.OS);
      });

      const max = Math.max(...values);

      return getOSScore(value) === max && max > 0;
    }



    // Default numeric comparison
    const values = products
      .map((product) => {
        if (!product) return null;

        const variant = getSelectedVariant(product);
        return variant?.specs?.[specKey];
      })
      .filter(Boolean);

    const max = Math.max(...values);

    return extractNumber(value) === max && max > 0;
  };




  const CHIPSET_RANKS = {
    // Apple
    "Apple A19": 100,
    "Apple A19 Pro": 101,
    "Apple A18": 96,
    "Apple A18 Pro": 98,
    "Apple A17 Pro": 94,
    "Apple A16 Bionic": 90,
    "Apple A15 Bionic": 86,
    "Apple A14 Bionic": 82,
    "Apple A13 Bionic": 78,

    // Snapdragon
    "Snapdragon 8 Elite": 99,
    "Snapdragon 8 Gen 4": 97,
    "Snapdragon 8 Gen 3": 95,
    "Snapdragon 8 Gen 2": 91,
    "Snapdragon 8 Gen 1": 87,
    "Snapdragon 888": 83,
    "Snapdragon 870": 80,
    "Snapdragon 865": 76,

    // MediaTek
    "Dimensity 9400": 98,
    "Dimensity 9300": 95,
    "Dimensity 9200": 91,
    "Dimensity 9000": 88,

    // Google
    "Google Tensor G5": 96,
    "Google Tensor G4": 92,
    "Google Tensor G3": 88,
    "Google Tensor G2": 84,

    // Samsung
    "Exynos 2500": 96,
    "Exynos 2400": 92,
    "Exynos 2200": 86,
  };

  const DISPLAY_PANEL_RANKS = {
    "super retina xdr oled": 100,
    "dynamic amoled 2x": 98,
    "ltpo amoled": 96,
    "amoled": 92,
    "oled": 88,
    "ips lcd": 70,
    "lcd": 60,
  };

  const BUILD_MATERIAL_RANKS = {
    "grade 5 titanium": 100,
    "titanium": 95,
    "ceramic": 90,
    "stainless steel": 85,
    "aluminum": 75,
    "glass": 65,
    "plastic": 50,
  };

  const getBuildScore = (build = "") => {
    const text = build.toLowerCase();

    for (const material of Object.keys(BUILD_MATERIAL_RANKS)) {
      if (text.includes(material)) {
        return BUILD_MATERIAL_RANKS[material];
      }
    }

    return 0;
  };

  const getDisplayScore = (display = "") => {
    const text = display.toLowerCase();

    let score = 0;

    // Panel Quality
    for (const panel in DISPLAY_PANEL_RANKS) {
      if (text.includes(panel)) {
        score += DISPLAY_PANEL_RANKS[panel];
        break;
      }
    }

    // Refresh Rate
    const refresh = text.match(/(\d+)\s*hz/i);
    if (refresh) {
      score += Number(refresh[1]);
    }

    // Peak Brightness
    const brightness = text.match(/(\d+)\s*nits?/i);
    if (brightness) {
      score += Math.round(Number(brightness[1]) / 100);
    }

    return score;
  };



  const getChipsetRank = (chipset = "") => {
    for (const key of Object.keys(CHIPSET_RANKS)) {
      if (chipset.toLowerCase().includes(key.toLowerCase())) {
        return CHIPSET_RANKS[key];
      }
    }

    return 0;
  };

  const getRamScore = (ram = "") => {
    const size = parseInt(ram) || 0;

    let typeBonus = 0;

    const lowerRam = ram.toLowerCase();

    if (lowerRam.includes("lpddr5x")) typeBonus = 3;
    else if (lowerRam.includes("lpddr5")) typeBonus = 2;
    else if (lowerRam.includes("lpddr4x")) typeBonus = 1;

    return size * 10 + typeBonus;
  };

  const getStorageScore = (storage = "") => {
    const lower = storage.toLowerCase();

    let size = parseFloat(storage) || 0;

    if (lower.includes("tb")) {
      size *= 1024;
    }

    return size;
  };

  const getBatteryScore = (battery = "") => {
    const lower = battery.toLowerCase();

    // Battery capacity (mAh)
    const capacityMatch = lower.match(/(\d+)\s*mah/);
    const capacity = capacityMatch ? parseInt(capacityMatch[1]) : 0;

    // Charging speed (W)
    const chargingMatch = lower.match(/(\d+)\s*w/);
    const charging = chargingMatch ? parseInt(chargingMatch[1]) : 0;

    // Weight:
    // Capacity is more important than charging speed
    return capacity + charging * 5;
  };

  const getRearCameraScore = (camera = "") => {
    const text = camera.toLowerCase();

    let score = 0;

    // Main camera MP
    const mainMatch = text.match(/(\d+)\s*mp/);
    if (mainMatch) {
      score += parseInt(mainMatch[1]);
    }

    // OIS
    if (text.includes("ois")) score += 20;

    // Telephoto
    if (text.includes("telephoto")) score += 20;

    // Periscope
    if (text.includes("periscope")) score += 30;

    // Ultrawide
    if (text.includes("ultra wide")) score += 15;

    // Optical Zoom
    const zoom = text.match(/(\d+)x/);
    if (zoom) {
      score += parseInt(zoom[1]) * 5;
    }

    return score;
  };

  const getFrontCameraScore = (camera = "") => {
    const text = camera.toLowerCase();

    let score = 0;

    const mp = text.match(/(\d+)\s*mp/);
    if (mp) score += parseInt(mp[1]);

    if (text.includes("autofocus")) score += 15;
    if (text.includes("ois")) score += 20;
    if (text.includes("4k")) score += 10;

    return score;
  };

  const getConnectivityScore = (connectivity = "") => {
    const text = connectivity.toLowerCase();

    let score = 0;

    // Cellular
    if (text.includes("5g")) score += 30;

    // Wi-Fi
    if (text.includes("wi-fi 7")) score += 25;
    else if (text.includes("wi-fi 6e")) score += 20;
    else if (text.includes("wi-fi 6")) score += 15;

    // Bluetooth
    if (text.includes("bluetooth 5.4")) score += 15;
    else if (text.includes("bluetooth 5.3")) score += 14;
    else if (text.includes("bluetooth 5.2")) score += 13;
    else if (text.includes("bluetooth 5.1")) score += 12;

    // USB
    if (text.includes("usb-c 4")) score += 20;
    else if (text.includes("usb-c 3.2")) score += 18;
    else if (text.includes("usb-c 3.1")) score += 16;
    else if (text.includes("usb-c 2")) score += 10;

    // Extras
    if (text.includes("nfc")) score += 8;
    if (text.includes("satellite")) score += 10;
    if (text.includes("uwb")) score += 8;

    return score;
  };

  const getOSScore = (os = "") => {
    const text = os.toLowerCase();

    let score = 0;

    // OS Version
    const version = text.match(/(ios|android)\s*(\d+)/i);
    if (version) {
      score += parseInt(version[2]) * 2;
    }

    // Software Updates
    const updates = text.match(/(\d+)\s*years?/i);
    if (updates) {
      score += parseInt(updates[1]) * 5;
    }

    // AI Features
    if (
      text.includes("apple intelligence") ||
      text.includes("galaxy ai") ||
      text.includes("gemini")
    ) {
      score += 20;
    }

    return score;
  };

  // console.log(getChipsetRank("Apple A19 Pro"));
  // console.log(getChipsetRank("Apple A14 Bionic"));
  // console.log(getChipsetRank("Snapdragon 8 Elite"));

  const SCORE_WEIGHTS = {
    Chipset: 25,
    RAM: 10,
    Storage: 8,
    Display: 15,
    "Rear Camera": 15,
    "Front Camera": 5,
    Battery: 10,
    OS: 5,
    Build: 4,
    Connectivity: 3,
  };


  const calculateScore = (variant) => {
    if (!variant) return 0;
    let score = 0;

    if (isBestValue("Chipset", variant.specs?.Chipset))
      score += SCORE_WEIGHTS.Chipset;

    if (isBestValue("RAM", variant.specs?.RAM))
      score += SCORE_WEIGHTS.RAM;

    if (isBestValue("Storage", variant.specs?.Storage))
      score += SCORE_WEIGHTS.Storage;

    if (isBestValue("Display", variant.specs?.Display))
      score += SCORE_WEIGHTS.Display;

    if (isBestValue("Rear Camera", variant.specs?.["Rear Camera"]))
      score += SCORE_WEIGHTS["Rear Camera"];

    if (isBestValue("Front Camera", variant.specs?.["Front Camera"]))
      score += SCORE_WEIGHTS["Front Camera"];

    if (isBestValue("Battery", variant.specs?.Battery))
      score += SCORE_WEIGHTS.Battery;

    if (isBestValue("OS", variant.specs?.OS))
      score += SCORE_WEIGHTS.OS;

    if (isBestValue("Build", variant.specs?.Build))
      score += SCORE_WEIGHTS.Build;

    if (isBestValue("Connectivity", variant.specs?.Connectivity))
      score += SCORE_WEIGHTS.Connectivity;

    return score;
  };

  const score1 =
    products.length > 0
      ? calculateScore(getSelectedVariant(products[0]))
      : 0;

  const score2 =
    products.length > 1
      ? calculateScore(getSelectedVariant(products[1]))
      : 0;

  const winner =
    score1 > score2
      ? products[0]
      : score2 > score1
        ? products[1]
        : null;


  //progress bar helper
  const getScoreColor = (score) => {
    if (score >= 80)
      return {
        bar: "bg-green-500",
        text: "text-green-600",
      };

    if (score >= 60)
      return {
        bar: "bg-yellow-500",
        text: "text-yellow-600",
      };

    if (score >= 40)
      return {
        bar: "bg-blue-500",
        text: "text-blue-600",
      };

    return {
      bar: "bg-red-500",
      text: "text-red-600",
    };
  };

  const score1Style = getScoreColor(score1);
  const score2Style = getScoreColor(score2);

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

  //   const replaceProduct = (index, newProduct) => {
  //   console.log("Replace:", index, newProduct);
  // };
  const TableRow = ({ title, renderValue }) => (
    <tr className="border-b last:border-b-0">
      <td className="bg-gray-50 font-semibold text-gray-800 px-5 py-4 min-w-[260px] text-center">
        {title}
      </td>

      {products.map((product, index) => (
        <td
          key={product ? `${product._id}-${index}` : `empty-${index}`}
          className="w-70 min-w-[320px] max-w-[320px] px-5 py-4 text-center align-top"
        >
          {renderValue(product, index)}
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

            {showRemove && (
              <TableRow
                title="Search"
                renderValue={(product, index) => (

                  <CompareSearch
                    currentSlug={product?.slug || null}
                    compareProductIds={products
                      .filter(Boolean)
                      .map((p) => p._id)}
                    onSelect={(selectedProduct) =>
                      onReplace(index, selectedProduct)
                    }
                  />

                )}
              />
            )}
            <TableRow
              title="image"
              renderValue={(product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div className="flex flex-col items-center py-4 px-10">
                      <span className="text-gray-400 italic">
                        No phone selected.
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product, variant);

                return (
                  <div className="w-full flex flex-col items-center py-4">
                    <img
                      src={
                        color?.images?.[0]?.url ||
                        product.defaultImage
                      }
                      alt={product.name}
                      className="w-56 h-56 object-contain"
                    />

                    {showRemove && (
                      <button
                        onClick={() => onClear(index)}
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
              renderValue={(product) =>
                product ? (
                  <span className="font-medium">
                    {product.name}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">
                    No phone selected
                  </span>
                )
              }
            />

            <TableRow
              title="Brand"
              renderValue={(product) =>
                product ? product.brand || "-" : "-"
              }
            />

            <TableRow
              title="Starting Price"
              renderValue={(product) => {
                if (!product) return "-";

                const color = getSelectedColor(product);
                return `$${color?.price || 0}`;
              }}
            />

            <TableRow
              title="Rating"
              renderValue={(product) =>
                product ? (
                  <>⭐ {product.rating?.toFixed(1) || "0.0"}</>
                ) : (
                  "-"
                )
              }
            />

            <TableRow
              title="Reviews"
              renderValue={(product) =>
                product ? product.numReviews : "-"
              }
            />
            <TableRow
              title="Storage"
              renderValue={(product) => {
                if (!product) return "-";

                return (
                  <select
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
                  </select>
                );
              }}
            />
            <TableRow
              title="Colors"
              renderValue={(product) => {
                if (!product) return "-";
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
                if (!product) return "-";

                const variant = getSelectedVariant(product);
                return variant?.specs?.Display || "-";
              }}
            />

            <TableRow
              title="RAM"
              renderValue={(product) => {
                if (!product) return "-";

                const variant = getSelectedVariant(product);
                return variant?.specs?.RAM || "-";
              }}
            />

            <TableRow
              title="Rear Camera"
              renderValue={(product) => {
                if (!product) return "-";

                const variant = getSelectedVariant(product);
                return variant?.specs?.["Rear Camera"] || "-";
              }}
            />

            <TableRow
              title="Front Camera"

              renderValue={(product) => {
                if (!product) return "-";
                const variant = getSelectedVariant(product);
                return variant?.specs?.["Front Camera"] || "-";
              }}


            />

            <TableRow
              title="Battery"
              renderValue={(product) => {
                if (!product) return "-";
                const variant = getSelectedVariant(product);
                return variant?.specs?.Battery || "-";
              }}

            />

            <TableRow
              title="Chipset"
              renderValue={(product) => {
                if (!product) return "-";
                const variant = getSelectedVariant(product);
                return variant?.specs?.Chipset || "-";
              }}
            />

            <TableRow
              title="Operating System"
              renderValue={(product) => {
                if (!product) return "-";
                const variant = getSelectedVariant(product);
                return variant?.specs?.OS || "-";
              }}
            />

            <TableRow
              title="Build"

              renderValue={(product) => {
                if (!product) return "-";
                const variant = getSelectedVariant(product);
                return variant?.specs?.Build || "-";
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
                  if (!product) {
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Chipset || "Search and add a phone to compare.";
                }}

              />

              <TableRow
                title="RAM"

                renderValue={(product) => {
                  if (!product) return "-";
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.RAM || "-";
                }}
              />

              <TableRow
                title="Storage"

                renderValue={(product) => {
                  if (!product) return "-";
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Storage || "-";
                }}
              />

              <TableRow
                title="Operating System"

                renderValue={(product) => {
                  if (!product) return "-";
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.OS || "-";
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
                  if (!product) {
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);

                  return variant?.specs?.Display || "-";
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
                  if (!product) {
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.["Rear Camera"] || "-";
                }}
              />

              <TableRow
                title="Front Camera"

                renderValue={(product) => {
                  if (!product) return "-";
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.["Front Camera"] || "-";
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
                  if (!product) {
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Battery || "-";
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
                  if (!product) {
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Build || "-";
                }}
              />

              <TableRow
                title="Other"

                renderValue={(product) => {
                  if (!product) return "-";
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Other || "-";
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
                  if (!product) {
                    return (
                      <div className="flex flex-col items-center py-4">
                        <span className="text-gray-400 italic">
                          No phone selected
                          Search and add a phone to compare.
                        </span>
                      </div>
                    );
                  }
                  const variant = getSelectedVariant(product);
                  return variant?.specs?.Connectivity || "-";
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

          {products.slice(0, 2).map((product, index) => {
            const variant = product ? getSelectedVariant(product) : null;
            const color = product ? getSelectedColor(product) : null;
            const score = variant ? calculateScore(variant) : 0;
            const compareProductIds = products.filter(Boolean).map((p) => p._id);



            return (
              <div
                ref={phoneRef}
                key={product ? `${product._id}-${index}` : `empty-${index}`}
                className="w-full bg-white rounded-xl border shadow-md overflow-visible"
              >
                {!product ? (

                  <div className="p-2 border-b">
                    <CompareSearch
                      currentSlug={null}
                      compareProductIds={compareProductIds}
                      onSelect={(selectedProduct) =>
                        onReplace(index, selectedProduct)
                      }
                    />
                  </div>

                ) : (
                  <>
                    {/* Product Image */}
                    <div className="relative bg-gray-50 pt-8 pb-6 flex justify-center">
                      {showRemove && (
                        <button
                          onClick={() => onClear(index)}
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

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            Comparison Score
                          </span>

                          <span className="font-bold text-blue-600">
                            {score}
                          </span>
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${score}%`,
                            }}
                          />
                        </div>
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
                  </>
                )}

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
            <div className="grid grid-cols-2 gap-2 px-2 py-1">
              {products.slice(0, 2).map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <CompareSearch
                        currentSlug={null}
                        compareProductIds={compareProductIds}
                        onSelect={(selectedProduct) =>
                          onReplace(index, selectedProduct)
                        }
                      />
                    </div>
                  );
                }
                const variant = getSelectedVariant(product);
                const color = getSelectedColor(product);


                return (

                  <div
                    key={product._id}
                    onClick={() => scrollToSection(phoneRef)}
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
        {/* specs sticky bar */}
        <div className="sticky top-[132px] z-30 bg-white border-b shadow-sm">
          <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap">

            <button
              onClick={() => scrollToSection(performanceRef)}
              className="px-5 py-1 font-medium hover:text-blue-600"
            >
              Performance
            </button>

            <button
              onClick={() => scrollToSection(displayRef)}
              className="px-5 py-1 font-medium hover:text-blue-600"
            >
              Display
            </button>

            <button
              onClick={() => scrollToSection(cameraRef)}
              className="px-5 py-1 font-medium hover:text-blue-600"
            >
              Camera
            </button>

            <button
              onClick={() => scrollToSection(batteryRef)}
              className="px-5 py-1 font-medium hover:text-blue-600"
            >
              Battery
            </button>

            <button
              onClick={() => scrollToSection(designRef)}
              className="px-5 py-1 font-medium hover:text-blue-600"
            >
              Design
            </button>

            <button
              onClick={() => scrollToSection(connectivityRef)}
              className="px-5 py-1 font-medium hover:text-blue-600"
            >
              Connectivity
            </button>

          </div>
        </div>
        {/* Specifications total score */}
        <div className="mx-2  mb-6 rounded-xl border bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-bold text-center">
            Comparison Score
          </h2>
          {winner ? (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
              🏆 <span className="font-semibold text-green-700">
                {winner.name} is the overall winner
              </span>
            </div>
          ) : (
            <div className="mb-4 rounded-lg bg-gray-100 p-3 text-center text-gray-600">
              Both phones are evenly matched.
            </div>
          )}


          <div className="grid grid-cols-2 gap-4">
            {/* Product 1 */}
            <div className="text-center">
              <h3 className="text-sm font-semibold truncate">
                {products?.[0]?.name}
              </h3>

              <p className={`text-3xl font-bold ${score1Style.text}`}>
                {score1}/100
              </p>

              <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${score1Style.bar}`}
                  style={{ width: `${score1}%` }}
                />
              </div>
            </div>

            {/* Product 2 */}
            <div className="text-center">
              <h3 className="text-sm font-semibold truncate">
                {products?.[1]?.name}
              </h3>

              <p className={`text-3xl font-bold ${score2Style.text}`}>
                {score2}/100
              </p>

              <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${score2Style.bar}`}
                  style={{ width: `${score2}%` }}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Specifications Difference */}

        <div className="flex items-center justify-between mx-2 mt-2 mb-4">
          <h2 className="text-sm sm:text-lg font-bold">
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
          <div ref={performanceRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Performance</h2>

            <div className="space-y-4 p-4">
              {products.map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
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
          <div ref={displayRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Display</h2>

            <div className="space-y-4 p-4">
              {products.map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        Search and add a phone to compare.
                      </span>
                    </div>
                  );
                }
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
          <div ref={cameraRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Camera</h2>

            <div className="space-y-4 p-4">
              {products.map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
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
          <div ref={batteryRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Battery</h2>

            <div className="space-y-4 p-4">
              {products.map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
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
          <div ref={designRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Design</h2>

            <div className="space-y-4 p-4">
              {products.map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
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
          <div ref={connectivityRef} className="bg-white rounded-xl shadow border">
            <h2 className="text-lg font-bold p-4 border-b">Connectivity</h2>

            <div className="space-y-4 p-4">
              {products.map((product, index) => {
                const compareProductIds = products.filter(Boolean).map((p) => p._id);
                if (!product) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="bg-white border rounded-lg p-2 shadow-sm"
                    >
                      <span className="text-gray-400 italic">
                        No phone selected
                      </span>
                    </div>
                  );
                }
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