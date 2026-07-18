import { useState, useEffect } from 'react';
import {  Link  } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';

import CompareProducts from '../components/CompareProducts';


const CompareScreen = () => {

  const { products } = useSelector((state) => state.compare);


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
      <CompareProducts products={products} />

    </>
  );
};

export default CompareScreen;