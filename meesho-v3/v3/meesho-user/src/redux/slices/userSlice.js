import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/AxiosInterceptor';

export const fetchProfile = createAsyncThunk('user/profile', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/user/profile');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk('user/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put('/user/profile', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const deleteProfile = createAsyncThunk('user/deleteProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.delete('/user/profile');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete account');
  }
});

// ORDERS
export const fetchMyOrders = createAsyncThunk('user/orders', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/order/my');
    return res.data.orders;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const placeOrder = createAsyncThunk('user/placeOrder', async ({ product, quantity, addressId, paymentMethod }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/order/create', { product, quantity, addressId, paymentMethod });
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to place order');
  }
});

export const cancelUserOrder = createAsyncThunk('user/cancelOrder', async (orderId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/order/cancel/${orderId}`);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order');
  }
});

export const returnUserOrder = createAsyncThunk('user/returnOrder', async (orderId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/order/return/${orderId}`);
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to return order');
  }
});

// ADDRESSES
export const fetchAddresses = createAsyncThunk('user/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/user/address');
    return res.data.addresses;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch addresses');
  }
});

export const addUserAddress = createAsyncThunk('user/addAddress', async (addressData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/user/address/create', addressData);
    return res.data.address;
  } catch (err) {
    const data = err.response?.data;
    if (data && data.errors && Array.isArray(data.errors)) {
      return rejectWithValue({
        message: data.message || 'Failed to add address',
        errors: data.errors
      });
    }
    return rejectWithValue(data?.message || 'Failed to add address');
  }
});

export const deleteUserAddress = createAsyncThunk('user/deleteAddress', async (addressId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/user/address/${addressId}`);
    return addressId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    orders: [],
    addresses: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearUserMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; state.successMessage = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchProfile.pending, pending)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload?.user || action.payload?.data || action.payload;
      })
      .addCase(fetchProfile.rejected, rejected)

      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload?.user || action.payload?.data || action.payload;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateProfile.rejected, rejected)

      .addCase(deleteProfile.pending, pending)
      .addCase(deleteProfile.fulfilled, (state) => {
        state.isLoading = false;
        state.profile = null;
        state.successMessage = 'Your account has been deleted successfully.';
      })
      .addCase(deleteProfile.rejected, rejected)

      .addCase(fetchMyOrders.pending, pending)
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchMyOrders.rejected, rejected)

      .addCase(placeOrder.pending, pending)
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.successMessage = 'Order placed successfully!';
      })
      .addCase(placeOrder.rejected, rejected)

      .addCase(cancelUserOrder.pending, pending)
      .addCase(cancelUserOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
        state.successMessage = 'Order cancelled successfully!';
      })
      .addCase(cancelUserOrder.rejected, rejected)
      .addCase(returnUserOrder.pending, pending)
      .addCase(returnUserOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.orders.findIndex(o => o._id === action.payload._id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
        state.successMessage = 'Order returned successfully!';
      })
      .addCase(returnUserOrder.rejected, rejected)

      .addCase(fetchAddresses.pending, pending)
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload || [];
      })
      .addCase(fetchAddresses.rejected, rejected)

      .addCase(addUserAddress.pending, pending)
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses.unshift(action.payload);
        state.successMessage = 'Address added successfully!';
      })
      .addCase(addUserAddress.rejected, rejected)

      .addCase(deleteUserAddress.pending, pending)
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter(a => a._id !== action.payload);
        state.successMessage = 'Address deleted successfully!';
      })
      .addCase(deleteUserAddress.rejected, rejected);
  },
});

export const { clearUserMessages } = userSlice.actions;
export default userSlice.reducer;