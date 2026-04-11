import { Link } from "react-router-dom";
import LogoText from "../assets/icons/LogoText";
import "./SignCard.css";
function Feild({type, id, placeholder,label}) {
    return(
        <div className="feild">
            <label htmlFor={id}>{label}</label>
            <input type={type} id={id} placeholder={placeholder} />   
        </div>
    );
}
export default function SignCard({type}) {
    return(
        <div className="sign-card z-10">
         <LogoText/>
         <h1>{type === "login" ? "Welcome back!" : "Create an account"}</h1>
         <p>{type === "login" ? "Please enter your details to access your account." : "Fill in the details to create your account."}</p>
        <div className="feilds">
            {type === "signup" && 
            <div className="flex-inputs">
            <Feild type="text" id="firstname" label="First Name" placeholder="Enter your first name" />
            <Feild type="text" id="lastname" label="Last Name" placeholder="Enter your last name" />
            </div>}
            <Feild type="email" id="email" label="Email" placeholder="Enter your email" />
            {type === "signup" &&
            <div className="feild">
                <label htmlFor="role">Role</label>
            <select name="role" id="role">
                <option value="participant">Participant</option>
                <option value="creator">Creator</option>
                <option value="both">Both</option>
            </select> 
            </div>
             
        }
            <Feild type="password" id="password" label="Password" placeholder="Enter your password" />
            {type === "signup" && <Feild type="password" id="confirm-password" label="Confirm Password" placeholder="Enter your password again" />}
        </div>
        <button>{type === "login" ? "Log In" : "Sign Up"}</button>
        <span>{type === "login" ? "Don't have an account?" : "Already have an account?"} <Link to={type === "login" ? "/signup" : "/login"}>{type === "login" ? "Sign up for free" : "Log in"}</Link></span>
        </div>  
          );
}