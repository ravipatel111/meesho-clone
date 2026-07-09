import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/AxiosInterceptor';

export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/admin/users');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateUserRole = createAsyncThunk('admin/updateRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update role');
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/admin/user/${userId}`);
    return userId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
  }
});

export const blockUser = createAsyncThunk('admin/blockUser', async (userId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch(`/admin/user/block/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to block user');
  }
});

export const unblockUser = createAsyncThunk('admin/unblockUser', async (userId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch(`/admin/user/unblock/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to unblock user');
  }
});

// ADMIN ORDERS
export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/admin/orders');
    return res.data.orders;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const updateAdminOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/admin/order/${orderId}`, { status });
    return res.data.order;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    orders: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload?.users || action.payload?.data || action.payload || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload?.user || action.payload?.data;
        if (updated) {
          state.users = state.users.filter(u => (u._id || u.id) !== (updated._id || updated.id));
          state.users.unshift(updated);
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => (u._id || u.id) !== action.payload);
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        const updated = action.payload?.user || action.payload?.data;
        if (updated) {
          state.users = state.users.filter(u => (u._id || u.id) !== (updated._id || updated.id));
          state.users.unshift(updated);
        }
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const updated = action.payload?.user || action.payload?.data;
        if (updated) {
          state.users = state.users.filter(u => (u._id || u.id) !== (updated._id || updated.id));
          state.users.unshift(updated);
        }
      })
      .addCase(fetchAdminOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o._id !== action.payload._id);
        state.orders.unshift(action.payload);
      });
  },
});

export default adminSlice.reducer;