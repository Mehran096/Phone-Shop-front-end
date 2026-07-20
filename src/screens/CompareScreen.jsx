import { useState, useEffect } from 'react';
import {  Link  } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import {
  replaceCompareProduct,
} from "../slices/compareSlice";

import CompareProducts from '../components/CompareProducts';
import { toast } from 'react-toastify';

 



const CompareScreen = () => {
const dispatch = useDispatch();
  const { products } = useSelector((state) => state.compare);

  const replaceProduct = (index, product) => {
  const alreadyExists = products.some(
    (p, i) => i !== index && p._id === product._id
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
        defaultImage: product.defaultImage,
        defaultPrice: product.defaultPrice,
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


  return (
    <>
      <div className="relative flex items-center justify-center mb-6 mt-5 px-4">
        <Link
          to="/"
          className="absolute left-4 text-blue-600"
        >
          <span className='text-sm'>← Go Back</span>
        </Link>


        <h1 className="font-bold text-center">
          <span className="text-xl lg:hidden">Compare</span>
          <span className="hidden lg:inline text-3xl">
            Compare Phones
          </span>
        </h1>
      </div>
     <CompareProducts
       
  products={products}
  onReplace={replaceProduct}
/>

    </>
  );
};

export default CompareScreen;