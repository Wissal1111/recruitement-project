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
    const logout = () => {
  clearSession();
  navigate("/login");
};
return(
    <>
    <TopNavBar page="home"/>
    <SideBar page={"profile"} part={"home"}/>
    <div className="wrapper">
    <Info/>
    <Biography/>
    <BottomCards onLogout={logout}/>
</div>
    </>
)
}