import './Loading.css'
import Logo from "../../assets/icons/Logo";

export default function Loading(){
    return(
         <div className="loading">
         <div className="loading-logo">
             <Logo />
         </div>
         <p>LucidCurator</p>
         <div className="loading-circle">
            
         </div>
        </div>
    )
}