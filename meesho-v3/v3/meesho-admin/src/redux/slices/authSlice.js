import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/AxiosInterceptor";

// ─── Helpers ──────────────────────────────────────────────
// We store only non-sensitive user metadata (role, name, email) in
// sessionStorage so it survives page refreshes within a tab but is
// cleared when the browser session ends.  The actual auth token is
// kept only in Redux state (in-memory) or as an HttpOnly cookie
// managed by the server.  We never store raw tokens in localStorage.

const SESSION_USER_KEY = "admin_meesho_user";
const SESSION_TOKEN_KEY = "admin_meesho_token";

const loadUser = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUser = (user) => {
  try {
    if (user) sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch {
    /* quota exceeded — silently ignore */
  }
};

const loadToken = () => {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

const saveToken = (token) => {
  try {
    if (token) sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    /* quota exceeded — silently ignore */
  }
};

const clearSession = () => {
  sessionStorage.removeItem(SESSION_USER_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  // Also clear legacy localStorage keys from old versions
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("pendingOtp");
  localStorage.removeItem("resetToken");
};

// ─── Thunks ───────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/auth/login", {
        email,
        password,
      });
      return { ...res.data, isAdmin: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/auth/reset-password", {
        token,
        password,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Password reset failed",
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const role = getState().auth.user?.role;
      const endpoint = "/admin/auth/change-password";
      const res = await axiosInstance.post(endpoint, {
        oldPassword,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Password change failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const role = getState().auth.user?.role;
      const endpoint = "/admin/auth/logout";
      await axiosInstance.post(endpoint);
    } catch {
      // Still clear local state even if API call fails
    }
  },
);

// ─── Initial State ─────────────────────────────────────────
// Token is stored in sessionStorage (cleared when browser tab closes).
// This survives page refresh within the same session but not across new tabs.
// User metadata (role, name) is also stored in sessionStorage.

const initialState = {
  token: loadToken(), // from sessionStorage — survives refresh, cleared on tab close
  user: loadUser(), // non-sensitive metadata from sessionStorage
  isLoading: false,
  error: null,
  successMessage: null,
  pendingEmail: null,
  resetToken: null, // in-memory only
};

// ─── Slice ─────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.pendingEmail = null;
      state.resetToken = null;
      clearSession();
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setPendingEmail(state, action) {
      state.pendingEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    };
    const rejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    builder

      // Login
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const token = action.payload?.token || action.payload?.accessToken;

        let user = action.payload?.user || action.payload?.data;

        // Ensure user always has role: admin
        // If admin logs in via env credentials, _id may be undefined — that is fine
        if (!user) {
          user = { role: "admin" };
        } else {
          user = { ...user, role: "admin" };
        }

        // Store token
        state.token = token ?? null;
        state.user = user ?? null;

        // Persist token and user metadata to sessionStorage
        if (token) saveToken(token);
        if (user) saveUser(user);
      })
      .addCase(loginUser.rejected, rejected)

      // Reset Password
      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload?.message || "Password reset! You can now login.";
        state.resetToken = null;
      })
      .addCase(resetPassword.rejected, rejected)

      // Change Password
      .addCase(changePassword.pending, pending)
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload?.message || "Password changed successfully!";
      })
      .addCase(changePassword.rejected, rejected)

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.pendingEmail = null;
        state.resetToken = null;
        clearSession();
      })

      // Sync updateProfile from userSlice to auth state and sessionStorage
      .addCase("user/updateProfile/fulfilled", (state, action) => {
        const updatedUser =
          action.payload?.user || action.payload?.data || action.payload;
        if (updatedUser) {
          state.user = { ...state.user, ...updatedUser };
          saveUser(state.user);
        }
      });
  },
});

export const { logout, clearMessages, setPendingEmail } = authSlice.actions;
export default authSlice.reducer;
