import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../layout/AuthLayout/AuthLayout";
import AdminLayout from "../layout/AdminLayout/AdminLayout";
import ErrorBoundary from "../components/ErrorBoundary";

const Login = lazy(() => import("../pages/auth/login/Login"));
const ChangePassword = lazy(
  () => import("../pages/auth/changePassword/ChangePassword"),
);
const AdminDashboard = lazy(
  () => import("../pages/admin/dashboard/AdminDashboard"),
);
const AdminProducts = lazy(
  () => import("../pages/admin/products/AdminProducts"),
);
const AdminOrders = lazy(() => import("../pages/admin/orders/AdminOrders"));
const AdminCategories = lazy(
  () => import("../pages/admin/categories/AdminCategories"),
);
const AdminUsers = lazy(() => import("../pages/admin/users/AdminUsers"));
const AdminPayments = lazy(
  () => import("../pages/admin/payments/AdminPayments"),
);
const SubAdmins = lazy(
  () => import("../pages/admin/subadmins/SubAdmins"),
);

const wrap = (el) => <ErrorBoundary>{el}</ErrorBoundary>;

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "/login", element: wrap(<Login />) }],
      },
    ],
  },

  // ── Protected ────────────────────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: wrap(<AdminDashboard />) },
      { path: "/products", element: wrap(<AdminProducts />) },
      { path: "/orders", element: wrap(<AdminOrders />) },
      { path: "/categories", element: wrap(<AdminCategories />) },
      { path: "/users", element: wrap(<AdminUsers />) },
      { path: "/payments", element: wrap(<AdminPayments />) },
      { path: "/subadmins", element: wrap(<SubAdmins />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/change-password",
            element: wrap(<ChangePassword />),
          },
        ],
      },
    ],
  },

  // ── Fallbacks ─────────────────────────────────────────────
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
