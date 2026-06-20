import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/AxiosInterceptor';

// ─── Thunks ───────────────────────────────────────────────

// ADMIN ACTIONS
export const adminFetchProducts = createAsyncThunk('product/adminFetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/admin/product/my');
    return res.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const adminCreateProduct = createAsyncThunk('product/adminCreate', async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/admin/product/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const adminUpdateProduct = createAsyncThunk('product/adminUpdate', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/admin/product/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

export const adminDeleteProduct = createAsyncThunk('product/adminDelete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/admin/product/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

// USER / PUBLIC ACTIONS
export const fetchUserProducts = createAsyncThunk('product/userFetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/product/all');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchUserProductById = createAsyncThunk('product/userFetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/product/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
  }
});

export const fetchUserProductsByCategory = createAsyncThunk('product/userFetchByCategory', async (categoryId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/product/category/${categoryId}`);
    return res.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products by category');
  }
});

export const searchUserProducts = createAsyncThunk('product/userSearch', async (params, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/product/search', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to search products');
  }
});

// ─── Slice ─────────────────────────────────────────────────

const productSlice = createSlice({
  name: 'product',
  initialState: {
    adminProducts: [],
    products: [],
    currentProduct: null,
    searchResults: {
      products: [],
      page: 1,
      totalPages: 0,
      totalProducts: 0,
    },
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearProductMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.isLoading = true; state.error = null; state.successMessage = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(adminFetchProducts.pending, pending)
      .addCase(adminFetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminProducts = action.payload || [];
      })
      .addCase(adminFetchProducts.rejected, rejected)

      .addCase(adminCreateProduct.pending, pending)
      .addCase(adminCreateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminProducts.unshift(action.payload);
        state.successMessage = 'Product created successfully';
      })
      .addCase(adminCreateProduct.rejected, rejected)

      .addCase(adminUpdateProduct.pending, pending)
      .addCase(adminUpdateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.adminProducts.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) {
          state.adminProducts[idx] = action.payload;
        }
        state.successMessage = 'Product updated successfully';
      })
      .addCase(adminUpdateProduct.rejected, rejected)

      .addCase(adminDeleteProduct.pending, pending)
      .addCase(adminDeleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminProducts = state.adminProducts.filter(p => p._id !== action.payload);
        state.successMessage = 'Product deleted successfully';
      })
      .addCase(adminDeleteProduct.rejected, rejected)

      // User / Public Extra Reducers
      .addCase(fetchUserProducts.pending, pending)
      .addCase(fetchUserProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload || [];
      })
      .addCase(fetchUserProducts.rejected, rejected)

      .addCase(fetchUserProductById.pending, pending)
      .addCase(fetchUserProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchUserProductById.rejected, rejected)

      .addCase(fetchUserProductsByCategory.pending, pending)
      .addCase(fetchUserProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload || [];
      })
      .addCase(fetchUserProductsByCategory.rejected, rejected)

      .addCase(searchUserProducts.pending, pending)
      .addCase(searchUserProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = {
          products: action.payload?.products || [],
          page: action.payload?.page || 1,
          totalPages: action.payload?.totalPages || 0,
          totalProducts: action.payload?.totalProducts || 0,
        };
      })
      .addCase(searchUserProducts.rejected, rejected);
  },
});

export const { clearProductMessages } = productSlice.actions;
export default productSlice.reducer;
