import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaTag } from 'react-icons/fa';
import {
  useGetAccessoriesQuery,
  useDeleteAccessoryMutation,
} from '../../slices/accessoriesApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';
import { toast } from 'react-toastify';

const AccessoryListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const pageNumber = searchParams.get('pageNumber') || 1;

  const { data, isLoading, error, refetch } = useGetAccessoriesQuery({ keyword, pageNumber });
  const [deleteAccessory, { isLoading: loadingDelete }] = useDeleteAccessoryMutation();
  const [searchKeyword, setSearchKeyword] = useState(keyword);
  const navigate = useNavigate();
  
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await deleteAccessory(id).unwrap();
        toast.success('Accessory deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ keyword: searchKeyword, pageNumber: 1 });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setSearchParams({});
  };

  // HELPER: Calculate min price and total stock for the accessory
  const getAccessoryStats = (accessory) => {
    let totalStock = 0;
    let minPrice = Infinity;
    let hasDiscount = false;

    accessory.variants?.forEach(model => {
      model.colorVariants?.forEach(color => {
        totalStock += Number(color.countInStock) || 0;
        minPrice = Math.min(minPrice, Number(color.price) || 0);
        if (color.discount?.isActive && color.discount?.value > 0) hasDiscount = true;
      })
    })

    return {
      totalStock,
      minPrice: minPrice === Infinity ? 0 : minPrice.toFixed(2),
      modelCount: accessory.variants?.length || 0,
      colorCount: accessory.variants?.reduce((acc, v) => acc + (v.colorVariants?.length || 0), 0) || 0,
      hasDiscount
    }
  }

  return (
    <div className='p-4'>
      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4'>
        <h1 className='text-2xl font-bold'>Accessories</h1>
        <Link 
          to='/admin/accessory/create'
          className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition'
        >
          <FaPlus /> Create Accessory
        </Link>
      </div>

      {/* SEARCH */}
      <form onSubmit={submitHandler} className='mb-6'>
        <div className='relative'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search accessories...'
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className='w-full pl-10 pr-10 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          {searchKeyword && (
            <FaTimes 
              onClick={clearSearch} 
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600' 
            />
          )}
        </div>
      </form>

      {(isLoading || loadingDelete) && <Loader />}
      {error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className='hidden md:block overflow-x-auto bg-white rounded-lg shadow'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>NAME</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>BRAND</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>CATEGORY</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>MODELS</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>COLORS</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>FROM PRICE</th>
                  <th className='py-3 px-4 border-b text-left text-sm font-semibold text-gray-700'>TOTAL STOCK</th>
                  <th className='py-3 px-4 border-b'></th>
                </tr>
              </thead>
              <tbody>
                {data?.accessories?.map((accessory) => {
                  const stats = getAccessoryStats(accessory);
                  return (
                    <tr key={accessory._id} className='hover:bg-gray-50'>
                      <td className='py-3 px-4 border-b text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          {stats.hasDiscount && <FaTag className='text-red-500' />}
                          {accessory.name}
                        </div>
                      </td>
                      <td className='py-3 px-4 border-b text-sm'>{accessory.brand}</td>
                      <td className='py-3 px-4 border-b'>
                        <span className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full'>
                          {accessory.category}
                        </span>
                      </td>
                      <td className='py-3 px-4 border-b text-sm'>{stats.modelCount}</td>
                      <td className='py-3 px-4 border-b text-sm'>{stats.colorCount}</td>
                      <td className='py-3 px-4 border-b text-sm font-semibold'>${stats.minPrice}</td>
                      <td className='py-3 px-4 border-b text-sm'>{stats.totalStock}</td>
                      <td className='py-3 px-4 border-b flex gap-3'>
                        <Link to={`/admin/accessory/${accessory._id}/edit`} className='text-blue-600 hover:text-blue-800'>
                          <FaEdit />
                        </Link>
                        <button onClick={() => deleteHandler(accessory._id)} className='text-red-600 hover:text-red-800'>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className='md:hidden space-y-4'>
            {data?.accessories?.map((accessory) => {
              const stats = getAccessoryStats(accessory);
              return (
                <div key={accessory._id} className='bg-white rounded-lg shadow p-4 border'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h3 className='font-semibold text-lg flex items-center gap-2'>
                        {stats.hasDiscount && <FaTag className='text-red-500 text-sm' />}
                        {accessory.name}
                      </h3>
                      <p className='text-xs text-gray-500'>Brand: {accessory.brand}</p>
                    </div>
                    <span className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full'>
                      {accessory.category}
                    </span>
                  </div>
                  
                  <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
                    <div>
                      <p className='text-gray-500'>Models</p>
                      <p className='font-medium'>{stats.modelCount}</p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Colors</p>
                      <p className='font-medium'>{stats.colorCount}</p>
                    </div>
                    <div>
                      <p className='text-gray-500'>From Price</p>
                      <p className='font-medium'>${stats.minPrice}</p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Total Stock</p>
                      <p className='font-medium'>{stats.totalStock}</p>
                    </div>
                  </div>

                  <div className='flex gap-3 pt-3 border-t'>
                    <Link 
                      to={`/admin/accessory/${accessory._id}/edit`} 
                      className='flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2'
                    >
                      <FaEdit /> Edit
                    </Link>
                    <button 
                      onClick={() => deleteHandler(accessory._id)}
                      className='flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2'
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className='mt-6'>
            <Paginate pages={data?.pages} page={data?.page} isAdmin={true} />
          </div>
        </>
      )}
    </div>
  );
};

export default AccessoryListScreen;