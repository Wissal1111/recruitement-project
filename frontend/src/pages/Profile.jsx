import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState } from "react";
import { clearSession } from "../utils/AuthSession"
import { useNavigate } from "react-router-dom";
import Info from "../components/profile/info/Info";
import Biography from "../components/profile/biography/Biography";
import BottomCards from "../components/profile/bottomcards/BottomCards";

export default function Profile(){
    const navigate=useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = () => {
  clearSession();
  navigate("/login");
};
return(
    <>
    <TopNavBar
                    page="home"
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                <SideBar
                    page="profile"
                    part="home"
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
    <div className="wrapper">
    <Info/>
    <Biography/>
    <BottomCards onLogout={logout}/>
</div>
    </>
)
}