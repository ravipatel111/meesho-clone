import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './slices/authSlice';
import adminReducer    from './slices/adminSlice';
import productReducer  from './slices/productSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    admin:    adminReducer,
    product:  productReducer,
    category: categoryReducer,
  },
});

export default store;
