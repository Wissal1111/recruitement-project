import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRoles } from "../api/Role";
import Phases from "../components/create/Phases";

export default function PhasesPage() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [phases, setPhases] = useState([{ id: Date.now(), name: "" }]);

    const addPhase = () =>
        setPhases((prev) => [...prev, { id: Date.now(), name: "" }]);

    const removePhase = (id) =>
        setPhases((prev) => prev.filter((p) => p.id !== id));

    const updatePhase = (id, name) =>
    setPhases((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));

    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const hasCreator = roles.some((r) =>
                    typeof r === "string" ? r === "CREATOR" : r?.roleName === "CREATOR"
                );
                setIsCreator(hasCreator);
                if (!hasCreator) navigate("/recruit");
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
                <Phases
                    phases={phases}
                    onAdd={addPhase}
                    onDelete={removePhase}
                    onUpdate={updatePhase}
                    onBack={() => navigate(-1)}
                />
            </div>
        </div>
    );
}