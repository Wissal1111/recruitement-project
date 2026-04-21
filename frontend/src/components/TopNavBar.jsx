import './TopNavBar.css'
import lucidImg from '../assets/images/lucid.png'
import { useState } from 'react'
import { Settings,Bell,Search } from "lucide-react";


import profileImg from '../assets/images/user.png';

export default function TopNavBar({page,setPage}){
    const [nb,setNb]=useState(1);
    return(
        <div className="top-navbar">
            <div className="lucid-logo">
                <img src={lucidImg} alt="lucid"/>
                <p>LucidCurator</p>
            </div>
            <ul className="main-elements">
                <li className={page === "home" ? "selected-menu" : ""} onClick={()=>setPage("home")}>Home</li>
<li className={page === "recruit" ? "selected-menu" : ""} onClick={()=>setPage("recruit")}>Recruit</li>
<li className={page === "participate" ? "selected-menu" : "" } onClick={()=>setPage("participate")}>Participate</li>
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