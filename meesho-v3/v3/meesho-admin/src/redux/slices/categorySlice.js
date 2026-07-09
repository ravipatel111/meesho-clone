import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/AxiosInterceptor';

// ─── Thunks ───────────────────────────────────────────────

// CATEGORIES
export const fetchCategories = createAsyncThunk('category/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/categories');
    return res.data.categories;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

export const createCategory = createAsyncThunk('category/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/admin/category', formData);
    return res.data.category;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create category');
  }
});

export const updateCategory = createAsyncThunk('category/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch(`/admin/update/category/${id}`, formData);
    return res.data.category;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update category');
  }
});

export const deleteCategory = createAsyncThunk('category/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/admin/delete/category/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
  }
});

// SUBCATEGORIES
export const fetchSubCategories = createAsyncThunk('category/fetchAllSub', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/subcategories');
    return res.data.subCategories;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch subcategories');
  }
});

export const createSubCategory = createAsyncThunk('category/createSub', async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/admin/subcategory', formData);
    return res.data.subCategory;  // backend returns { subCategory: {...} }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create subcategory');
  }
});

export const updateSubCategory = createAsyncThunk('category/updateSub', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch(`/admin/update/subcategory/${id}`, formData);
    return res.data.subCategory;  // backend returns { subCategory: {...} }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update subcategory');
  }
});

export const deleteSubCategory = createAsyncThunk('category/deleteSub', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/admin/delete/subcategory/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete subcategory');
  }
});

// ─── Slice ─────────────────────────────────────────────────

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    subCategories: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearCategoryMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.isLoading = true; state.error = null; state.successMessage = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchCategories.pending, pending)
      .addCase(fetchCategories.fulfilled, (state, action) => { state.isLoading = false; state.categories = action.payload || []; })
      .addCase(fetchCategories.rejected, rejected)

      .addCase(createCategory.pending, pending)
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.unshift(action.payload);
        state.successMessage = 'Category created successfully';
      })
      .addCase(createCategory.rejected, rejected)

      .addCase(updateCategory.pending, pending)
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(c => c._id !== action.payload._id);
        state.categories.unshift(action.payload);
        state.successMessage = 'Category updated successfully';
      })
      .addCase(updateCategory.rejected, rejected)

      .addCase(deleteCategory.pending, pending)
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(c => c._id !== action.payload);
        state.successMessage = 'Category deleted successfully';
      })
      .addCase(deleteCategory.rejected, rejected)

      .addCase(fetchSubCategories.pending, pending)
      .addCase(fetchSubCategories.fulfilled, (state, action) => { state.isLoading = false; state.subCategories = action.payload || []; })
      .addCase(fetchSubCategories.rejected, rejected)

      .addCase(createSubCategory.pending, pending)
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        // backend returns { subCategory: {...} } — thunk returns res.data.subCategory
        state.subCategories.unshift(action.payload);
        state.successMessage = 'Subcategory created successfully';
      })
      .addCase(createSubCategory.rejected, rejected)

      .addCase(updateSubCategory.pending, pending)
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subCategories = state.subCategories.filter(s => s._id !== action.payload._id);
        state.subCategories.unshift(action.payload);
        state.successMessage = 'Subcategory updated successfully';
      })
      .addCase(updateSubCategory.rejected, rejected)

      .addCase(deleteSubCategory.pending, pending)
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subCategories = state.subCategories.filter(s => s._id !== action.payload);
        state.successMessage = 'Subcategory deleted successfully';
      })
      .addCase(deleteSubCategory.rejected, rejected);
  },
});

export const { clearCategoryMessages } = categorySlice.actions;
export default categorySlice.reducer;
