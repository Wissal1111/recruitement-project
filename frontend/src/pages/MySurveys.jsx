import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState } from "react";
import { clearSession } from "../utils/AuthSession"
import { useNavigate } from "react-router-dom";
import { getSession } from "../utils/AuthSession";
import Creator from "../assets/icons/Creator";
import BecomecreatorIl from "../components/mysurveys/BecomeCreatorIl";

export default function MySurveys(){
    const navigate=useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = getSession();
    const roles = user?.roles || [];
const isCreator = roles.some((r) =>
  typeof r === "string" ? r === "CREATOR" : r?.role?.name === "CREATOR"
);

console.log("USER:", user);
console.log("USER ROLES:", roles);
console.log("IS CREATOR:", isCreator);

return(
    <div className="dashboard">
         <TopNavBar
                            page="recruit"
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                        />
         {isCreator ? (
             <>
                 <SideBar
                            page="mysurveys"
                            part="recruit"
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                        />
                 <div className="wrapper">
                 </div>
             </>
         ) : (
  <BecomecreatorIl/>
)}
    </div>
)
}