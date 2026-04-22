import "./AuthBackground.css";
import Blur from "../../assets/illustrations/Blur"
import Flower from "../../assets/illustrations/Flower";
import Bubbles from "../../assets/illustrations/Bubbles";
import Dots from "../../assets/illustrations/Dots";
export default function AuthBackground({children}) {
    return(
         <>
        <div className="back"></div>
        <div className="auth-background">
            <Blur c="blur-blue1"/>
            <Blur c="blur-blue2"/>
            <Flower c="flower"/>
            <Bubbles c="bubbles"/>
            <Dots c="dots"/>
            {children}
        </div>
         </>
    );
}