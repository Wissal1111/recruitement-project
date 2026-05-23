import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BecomecreatorIl from "../components/mysurveys/BecomeCreatorIl";
import { getMyRoles } from "../api/Role";
import StudyInfo from "../components/create/StudyInfo";
import Questions from "../components/create/Questions";  // ADD

export default function CreateSurvey() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);

    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const hasCreator = roles.some((r) =>
                    typeof r === "string" ? r === "CREATOR" : r?.roleName === "CREATOR"
                );
                setIsCreator(hasCreator);
                if (!hasCreator) {
                    navigate("/recruit");
                }
            })
            .catch((err) => console.log("roles error:", err));
    }, []);

    return (
        <div className="dashboard">
            <TopNavBar
                page="recruit"
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <SideBar
                page="createsurvey"
                part="recruit"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="wrapper centered">
               
                    <StudyInfo
                        onDiscard={() => navigate(-1)}
                    />              
            </div>
        </div>
    );
}