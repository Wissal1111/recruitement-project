import './TopNavBar.css'
import lucidImg from '../assets/images/lucid.png'
import { useState } from 'react'
import { Settings,Bell,Search } from "lucide-react";


import profileImg from '../assets/images/user.png';
import { useNavigate } from 'react-router-dom';

export default function TopNavBar({page}){
    const navigate=useNavigate();
    const [nb,setNb]=useState(1);
    return(
        <div className="top-navbar">
            <div className="lucid-logo">
                <img src={lucidImg} alt="lucid"/>
                <p>LucidCurator</p>
            </div>
            <ul className="main-elements">
                <li className={page === "home" ? "selected-menu" : ""} onClick={()=>navigate("/home")}>Home</li>
                <li className={page === "recruit" ? "selected-menu" : ""} onClick={()=>navigate("/recruit")}>Recruit</li>
                <li className={page === "participate" ? "selected-menu" : "" } onClick={()=>navigate("/participate")}>Participate</li>
            </ul>
           
            <div className="right-top">
                <div className="search">
                    <Search/>
                    <input type="text" placeholder='Search...' />
                </div>
                 <Bell/>
                 <Settings/>
                 <img src={profileImg} alt="profile" className='profile-pic'/>
            </div>
        </div>
    )
}