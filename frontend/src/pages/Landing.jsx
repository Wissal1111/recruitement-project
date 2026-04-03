import { Link } from "react-router-dom";

export default function Landing() {
  return (
   <>
   <Link to="/login">Login</Link>
   <Link to="/signup">Sign Up</Link>
   </>
  );
}