import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";



const PrivateRoute = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  return user && token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
