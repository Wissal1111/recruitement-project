import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BecomecreatorIl from "../components/mysurveys/BecomeCreatorIl";
import { getMyRoles } from "../api/Role";

export default function MySurveys() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const hasCreator = roles.some((r) =>
    typeof r === "string" ? r === "CREATOR" : r?.roleName === "CREATOR"
);
                setIsCreator(hasCreator);
            })
            .catch((err) => console.log("roles error:", err))
            .finally(() => setLoading(false));
    }, []);
    if (loading) return null;

    return (
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
                <BecomecreatorIl />
            )}
        </div>
    );
}