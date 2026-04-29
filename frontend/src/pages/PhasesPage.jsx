import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyRoles } from "../api/Role";
import { getStudyById } from "../api/StudyApi"; 
import Phases from "../components/create/Phases";

export default function PhasesPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // 👈 get :id from URL

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [study, setStudy] = useState(null); // 👈 study data
    const [phases, setPhases] = useState([{ id: Date.now(), name: "" }]);

    const addPhase = () =>
        setPhases((prev) => [...prev, { id: Date.now(), name: "" }]);

    const removePhase = (id) =>
        setPhases((prev) => prev.filter((p) => p.id !== id));

    const updatePhase = (id, name) =>
        setPhases((prev) =>
            prev.map((p) => (p.id === id ? { ...p, name } : p))
        );

    // 🔐 role check
    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const hasCreator = roles.some((r) =>
                    typeof r === "string"
                        ? r === "CREATOR"
                        : r?.roleName === "CREATOR"
                );

                setIsCreator(hasCreator);
                if (!hasCreator) navigate("/recruit");
            })
            .catch((err) => console.log("roles error:", err));
    }, []);

    // 📡 fetch study by id
    useEffect(() => {
        if (!id) return;

        getStudyById(id)
            .then((data) => {
                setStudy(data);

                // OPTIONAL: if study already has phases from backend
                if (data?.phases?.length) {
                    setPhases(
                        data.phases.map((p) => ({
                            id: p.id || Date.now() + Math.random(),
                            name: p.name || "",
                        }))
                    );
                }
            })
            .catch((err) => console.log("study error:", err));
    }, [id]);

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
                    study={study}   // 👈 now you pass study info
                    phases={phases}
                    onAdd={addPhase}
                    onDelete={removePhase}
                    onUpdate={updatePhase}
                />
            </div>
        </div>
    );
}