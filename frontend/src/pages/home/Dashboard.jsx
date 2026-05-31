import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { useState } from "react";
import { clearSession } from "../../utils/AuthSession";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = () => {
        clearSession();
        navigate("/login");
    };

    return (
        <div className="dashboard">
            <TopNavBar
                page="home"
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <SideBar
                page="dashboard"
                part="home"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="wrapper">

            </div>
        </div>
    );
}