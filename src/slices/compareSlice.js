import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;

      // Already added
      const exists = state.products.find(
        (x) => x._id === product._id
      );

      if (exists) return;

      // Maximum 4 phones
      if (state.products.length >= 4) return;

      state.products.push(product);
    },

    clearCompareSlot: (state, action) => {
  state.products[action.payload] = null;
},

    removeFromCompare: (state, action) => {
      state.products = state.products.filter(
        (x) => x._id !== action.payload
      );
    },

    replaceCompareProduct: (state, action) => {
  const { index, product } = action.payload;

  state.products[index] = product;
},

    clearCompare: (state) => {
      state.products = [];
    },
  },
});

export const {
  addToCompare,
  removeFromCompare,
  replaceCompareProduct,
  clearCompareSlot,
  clearCompare,
} = compareSlice.actions;

export default compareSlice.reducer;