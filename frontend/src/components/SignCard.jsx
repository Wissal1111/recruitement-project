import { Link } from "react-router-dom";
import LogoText from "../assets/icons/LogoText";
import "./SignCard.css";
function Feild({type, id, placeholder}) {
    return(
        <div className="feild">
            <label htmlFor={id}>{id}</label>
            <input type={type} id={id} placeholder={placeholder} />   
        </div>
    );
}
export default function SignCard() {
    return(
        <div className="sign-card z-10">
         <LogoText/>
         <h1>Welcome back!</h1>
         <p>Access your account to answer surveys and track yours </p>
        <div className="feilds">
            <Feild type="email" id="Email" placeholder="Enter your email" />
            <Feild type="password" id="Password" placeholder="Enter your password" />
        </div>
        <button>Log In</button>
        <span>Don't have an account? <Link to="/signup">Sign up for free</Link></span>
        </div>  
          );
}