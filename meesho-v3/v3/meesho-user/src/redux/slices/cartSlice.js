import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/AxiosInterceptor';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/user/cart/get');
    return {
      items: res.data.items || [],
      totalAmount: res.data.totalAmount || 0,
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/user/cart/add', { product: productId, quantity });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch('/user/cart/update', { product: productId, quantity });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cart item');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/user/cart/remove/item/${productId}`);
    return productId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove cart item');
  }
});

export const clearUserCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete('/user/cart/clear');
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCartMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.isLoading = true; state.error = null; state.successMessage = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchCart.pending, pending)
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchCart.rejected, rejected)

      .addCase(addToCart.pending, pending)
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Product added to cart';
      })
      .addCase(addToCart.rejected, rejected)

      .addCase(updateCartItem.pending, pending)
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateCartItem.rejected, rejected)

      .addCase(removeFromCart.pending, pending)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Product removed from cart';
      })
      .addCase(removeFromCart.rejected, rejected)

      .addCase(clearUserCart.pending, pending)
      .addCase(clearUserCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalAmount = 0;
      })
      .addCase(clearUserCart.rejected, rejected);
  },
});

export const { clearCartMessages } = cartSlice.actions;
export default cartSlice.reducer;
