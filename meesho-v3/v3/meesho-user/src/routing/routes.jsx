import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layout/AuthLayout/AuthLayout';
import UserLayout from '../layout/UserLayout/UserLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const Login          = lazy(() => import('../pages/auth/login/Login'));
const Register       = lazy(() => import('../pages/auth/register/Register'));
const VerifyOtp      = lazy(() => import('../pages/auth/verifyOtp/VerifyOtp'));
const VerifyEmail    = lazy(() => import('../pages/auth/verifyEmail/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/auth/forgotPassword/ForgotPassword'));
const ResetPassword  = lazy(() => import('../pages/auth/resetPassword/ResetPassword'));
const ChangePassword = lazy(() => import('../pages/auth/changePassword/ChangePassword'));
const UserWebsite    = lazy(() => import('../pages/user/dashboard/UserWebsite'));

const wrap = (el) => <ErrorBoundary>{el}</ErrorBoundary>;

export const router = createBrowserRouter([
  // ── Public Auth ──────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',           element: wrap(<Login />) },
          { path: '/register',        element: wrap(<Register />) },
          { path: '/verify-otp',      element: wrap(<VerifyOtp />) },
          { path: '/verify-email',    element: wrap(<VerifyEmail />) },
          { path: '/forgot-password', element: wrap(<ForgotPassword />) },
          { path: '/reset-password',  element: wrap(<ResetPassword />) },
        ],
      },
    ],
  },

  // ── Protected User ────────────────────────────────────────
  {
    element: <ProtectedRoute><UserLayout /></ProtectedRoute>,
    children: [
      { path: '/home',                    element: wrap(<UserWebsite />) },
      { path: '/order-history',           element: wrap(<UserWebsite />) },
      { path: '/wishlist',                element: wrap(<UserWebsite />) },
      { path: '/settings',                element: wrap(<UserWebsite />) },
      { path: '/payments',                element: wrap(<UserWebsite />) },
      { path: '/product/:productId',      element: wrap(<UserWebsite />) },
      { path: '/checkout',                element: wrap(<UserWebsite />) },
      { path: '/change-password',         element: wrap(<ChangePassword />) },
    ],
  },

  // ── Fallbacks ─────────────────────────────────────────────
  { path: '/',  element: <Navigate to="/login" replace /> },
  { path: '*',  element: <Navigate to="/login" replace /> },
]);
