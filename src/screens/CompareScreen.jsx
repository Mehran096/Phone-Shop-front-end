import { useState, useEffect, useRef } from 'react';
import {  Link  } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import {
  replaceCompareProduct,
  clearCompareSlot
} from "../slices/compareSlice";

import CompareProducts from '../components/CompareProducts';
import { 
  FaShareAlt,    
  FaFileExport,
  FaFilePdf,
  FaImage,
  FaPrint, } from "react-icons/fa";
import { toast } from 'react-toastify';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
 

const CompareScreen = () => {

  const compareRef = useRef(null);

const dispatch = useDispatch();
  const { products } = useSelector((state) => state.compare);
  const [showExportMenu, setShowExportMenu] = useState(false);
   

  const replaceProduct = (index, product) => {
  const alreadyExists = products.some(
    (p, i) => i !== index && p?._id === product._id
  );

  if (alreadyExists) {
    toast.warning("This phone is already in the comparison.");
    return;
  }

  dispatch(
    replaceCompareProduct({
      index,
      product: {
        _id: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        defaultImage:
    product.variants?.[0]?.colors?.[0]?.images?.[0]?.url ||
    product.defaultImage,
  defaultPrice:
    product.variants?.[0]?.colors?.[0]?.price ||
    product.defaultPrice,
        rating: product.rating,
        numReviews: product.numReviews,
        defaultStorage: product.variants?.[0].storage,
        defaultColor: product.variants?.[0].colors?.[0].name,
        specs: product.variants?.[0]?.specs || {},
        variants: product.variants,
      },
    })
  );
};

//handler for Export start
const handleExportPDF = async () => {
  setShowExportMenu(false);

  const element = compareRef.current;

  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;

    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pdfHeight;
  }

  pdf.save("phone-comparison.pdf");
};

const handleExportImage = async () => {
  setShowExportMenu(false);

  const element = compareRef.current;

  if (!element) return;

  const canvas = await html2canvas(element, {
  scale: window.devicePixelRatio > 2 ? 2 : 3,
  useCORS: true,
  backgroundColor: "#ffffff",
  scrollY: -window.scrollY,
});

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "phone-comparison.png";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Image exported successfully!");
};

const handlePrint = () => {
  setShowExportMenu(false);
  window.print();
};
//end Export handler
const clearSlot = (index) => {
  dispatch(clearCompareSlot(index));
};

//handler for share
const handleShare = async () => {
  const activeProducts = products.filter(Boolean);

  if (!activeProducts.length) {
    toast.warning("Please add at least one phone.");
    return;
  }

  const slugs = activeProducts.map((p) => p.slug).join(",");
  const compareUrl = `${window.location.origin}/compare?phones=${slugs}`;

  try {
    if (navigator.share && navigator.canShare?.({ url: compareUrl })) {
      await navigator.share({
        title: "Compare Phones",
        text: "Check out this phone comparison",
        url: compareUrl,
      });
      //console.log("navigator.share:", navigator.share);
    } else {
      await navigator.clipboard.writeText(compareUrl);
      toast.success("Comparison link copied!");
    }
  } catch (err) {
    console.log(err);
  }
};


  return (
    <>
      <div className="grid grid-cols-3 items-center mb-6 mt-5 px-4">
  {/* Left */}
  <div>
    <Link
      to="/"
      className="text-blue-600 text-sm"
    >
      ← Go Back
    </Link>
  </div>

  {/* Center */}
  <div className="text-center">
    <h1 className="font-bold">
      <span className="text-xl lg:hidden">Compare</span>
      <span className="hidden lg:inline text-3xl">
        Compare Phones
      </span>
    </h1>
  </div>

  {/* Right */}
  <div className="flex justify-end gap-2">
    {/* Share Button */}
   <button
  onClick={handleShare}
  className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 transition"
>
  <FaShareAlt />
  <span className="hidden sm:inline">Share</span>
</button>

    {/* Export Button */}
   <div className="relative">
  <button
    onClick={() => setShowExportMenu((prev) => !prev)}
    className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 transition"
  >
    <FaFileExport />
    <span className="hidden sm:inline">Export</span>
  </button>

  {showExportMenu && (
    <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-xl overflow-hidden z-50">
      <button
       onClick={handleExportPDF}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaFilePdf className="text-red-600" />
        Export PDF
      </button>

      <button
      onClick={handleExportImage}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaImage className="text-blue-600" />
        Export Image
      </button>

      <button
      onClick={handlePrint}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
      >
        <FaPrint className="text-gray-700" />
        Print
      </button>
    </div>
  )}
</div>
  </div>
</div>

<div ref={compareRef}>
<CompareProducts
  products={products}
  onReplace={replaceProduct}
  onClear={clearSlot}
/>
</div>

    </>
  );
};

export default CompareScreen;