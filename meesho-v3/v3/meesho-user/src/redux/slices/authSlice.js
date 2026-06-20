import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/AxiosInterceptor";

// ─── Helpers ──────────────────────────────────────────────
// We store only non-sensitive user metadata (role, name, email) in
// sessionStorage so it survives page refreshes within a tab but is
// cleared when the browser session ends.  The actual auth token is
// kept only in Redux state (in-memory) or as an HttpOnly cookie
// managed by the server.  We never store raw tokens in localStorage.

const SESSION_USER_KEY = "user_meesho_user";
const SESSION_TOKEN_KEY = "user_meesho_token";

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

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/auth/register", formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/auth/verify-otp", {
        email,
        otp,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/auth/verify-email", {
        email,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Email verification failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/auth/login", {
        email,
        password,
      });
      return res.data;
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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/auth/verify-email", {
        email,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const role = getState().auth.user?.role;
      const endpoint = "/user/auth/change-password";
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
      const endpoint = "/user/auth/logout";
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
  pendingOtp: null, // from register response - used to auto-fill VerifyOtp
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
      // Register
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload?.message || "Registered! Please verify your OTP.";
        // Save OTP from response for auto-fill (backend returns it directly)
        // This is intentional since nodemailer email is not active
        state.pendingOtp = action.payload?.otp ?? null;
      })
      .addCase(registerUser.rejected, rejected)

      // Verify OTP
      .addCase(verifyOtp.pending, pending)
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingOtp = null;
        state.successMessage =
          action.payload?.message || "OTP verified! You can now login.";
      })
      .addCase(verifyOtp.rejected, rejected)

      // Verify Email
      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action.payload?.message || "Email verified! You can now login.";
      })
      .addCase(verifyEmail.rejected, rejected)

      // Login
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const token = action.payload?.token || action.payload?.accessToken;

        let user = action.payload?.user || action.payload?.data;

        // Admin API returns only token
        if (!user && action.payload?.isAdmin) {
          user = { role: "admin" };
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

      // Forgot Password — resetToken kept in memory only
      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetToken = action.payload?.resetToken ?? null;
        state.successMessage =
          action.payload?.message || "Reset token generated";
      })
      .addCase(forgotPassword.rejected, rejected)

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
