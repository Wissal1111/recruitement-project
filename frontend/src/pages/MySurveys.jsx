import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState } from "react";
import { clearSession } from "../utils/AuthSession"
import { useNavigate } from "react-router-dom";

export default function MySurveys(){
    const navigate=useNavigate();

return(
    <div className="dashboard">
    <TopNavBar page="recruit"/>
    <SideBar page={"mysurveys"} part={"recruit"}/>
    <div className="wrapper">
   

    </div>
    </div>
)
}