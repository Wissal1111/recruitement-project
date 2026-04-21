import { Navigate } from "react-router-dom";
import { getSession } from "../utils/authSession";

const ProtectedRoute = ({ children }) => {
  const { accessToken } = getSession();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;