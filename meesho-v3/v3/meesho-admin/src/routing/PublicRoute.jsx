import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = () => {
  const { token, user } = useSelector((s) => s.auth);
  if (token && user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default PublicRoute;
