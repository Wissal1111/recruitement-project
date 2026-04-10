import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './TopNavBar.css'
import Sandwitch from '../assets/icons/Sandwitch';
export default function TopNavBar(){
    const [list,setList]=useState("Features");
    const navigate=useNavigate();
    return(
      <nav className="navbar">
        <div className="mobile-menu-logo">
        <div className="sandwitch"><Sandwitch/></div>
        <h1 className="logo">LucidCurator</h1>
        </div>
        <ul className="nav-elements">
            <Link>
            <li className={list==="Features" && "selected-element"} onClick={()=>{setList("Features")}}>Features</li>
            </Link>
            <Link>
            <li className={list==="Methodology" && "selected-element"} onClick={()=>{setList("Methodology")}}>Methodology</li>
            </Link>
            <Link>
            <li className={list==="Showcase" && "selected-element"} onClick={()=>{setList("Showcase")}}>Showcase</li>
            </Link>
            <Link>
            <li className={list==="Pricing" && "selected-element"} onClick={()=>{setList("Pricing")}}>Pricing</li>
            </Link>
        </ul>
        <div className="btns">
            <button className="btn transparent" onClick={()=>{navigate("/login")}}>
  Log In
</button>

<button className="btn linear" onClick={()=>{navigate("/signup")}}>
  Get Started
</button>
</div>
      </nav>
    );
}