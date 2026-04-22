import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState } from "react";
import { clearSession } from "../utils/AuthSession"
import { useNavigate } from "react-router-dom";

export default function MySurveys(){
    const navigate=useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);


return(
    <div className="dashboard">
         <TopNavBar
                            page="recruit"
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
                        <SideBar
                            page="mysurveys"
                            part="recruit"
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                        />
   
    <div className="wrapper">
   

    </div>
    </div>
)
}