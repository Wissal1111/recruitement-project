import { Navigate } from "react-router-dom";
import { getSession } from "../utils/authSession";

const PublicRoute = ({ children }) => {
  const { accessToken } = getSession();

  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;