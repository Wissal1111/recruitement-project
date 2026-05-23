import './TopNavBar.css'
import lucidImg from '../assets/images/lucid.png'
import { Settings, Bell, Search, Menu, X } from "lucide-react"
import profileImg from '../assets/images/user.png'
import { useNavigate } from 'react-router-dom'

export default function TopNavBar({ page, sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate()

    return (
        <>
            <div className="top-navbar">
                <div className="lucid-logo" onClick={() => navigate("/home")}>
                    <img src={lucidImg} alt="lucid" />
                    <p className="logo-text">LucidCurator</p>
                </div>

                <ul className="main-elements">
                    <li className={page === "home" ? "selected-menu" : ""} onClick={() => navigate("/home")}>Home</li>
                    <li className={page === "recruit" ? "selected-menu" : ""} onClick={() => navigate("/recruit")}>Recruit</li>
                    <li className={page === "participate" ? "selected-menu" : ""} onClick={() => navigate("/participate")}>Participate</li>
                </ul>

                <div className="right-top">
                    <div className="search">
                        <Search />
                        <input type="text" placeholder='Search...' />
                    </div>
                    <Bell />
                    <Settings />
                    <img src={profileImg} alt="profile" className='profile-pic' onClick={()=>navigate("/home/profile")} />
                    <button
                        className="hamburger"
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <div className="mobile-tab-bar">
                <div className={`mobile-tab ${page === "home" ? "active" : ""}`} onClick={() => navigate("/home")}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Home</span>
                </div>
                <div className={`mobile-tab ${page === "recruit" ? "active" : ""}`} onClick={() => navigate("/recruit")}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    <span>Recruit</span>
                </div>
                <div className={`mobile-tab ${page === "participate" ? "active" : ""}`} onClick={() => navigate("/participate")}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <span>Participate</span>
                </div>
            </div>
        </>
    )
}