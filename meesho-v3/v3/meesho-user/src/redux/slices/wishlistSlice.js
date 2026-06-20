import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/AxiosInterceptor';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/user/wishlist');
    return res.data.wishlist?.products || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
  }
});

export const addWishlistProduct = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/user/wishlist/add', { productId });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist');
  }
});

export const removeWishlistProduct = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/user/wishlist/delete/${productId}`);
    return productId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    products: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearWishlistMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.isLoading = true; state.error = null; state.successMessage = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchWishlist.pending, pending)
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchWishlist.rejected, rejected)

      .addCase(addWishlistProduct.pending, pending)
      .addCase(addWishlistProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Added to Wishlist';
      })
      .addCase(addWishlistProduct.rejected, rejected)

      .addCase(removeWishlistProduct.pending, pending)
      .addCase(removeWishlistProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => (p._id || p) !== action.payload);
        state.successMessage = 'Removed from Wishlist';
      })
      .addCase(removeWishlistProduct.rejected, rejected);
  },
});

export const { clearWishlistMessages } = wishlistSlice.actions;
export default wishlistSlice.reducer;
