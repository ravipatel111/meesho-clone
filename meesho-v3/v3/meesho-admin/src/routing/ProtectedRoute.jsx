import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { token, user } = useSelector((s) => s.auth);
  if (!token || user?.role !== 'admin') return <Navigate to="/login" replace />;
  return children ?? <Outlet />;
};

export default ProtectedRoute;
