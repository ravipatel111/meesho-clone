import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './slices/authSlice';
import productReducer  from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import cartReducer     from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import userReducer     from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    product:  productReducer,
    category: categoryReducer,
    cart:     cartReducer,
    wishlist: wishlistReducer,
    user:     userReducer,
  },
});

export default store;
