import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyRoles } from "../api/Role";
import { getStudyById } from "../api/StudyApi";
import { addPhase as apiAddPhase, updatePhase as apiUpdatePhase, deletePhase as apiDeletePhase } from "../api/PhasesApi";
import Phases from "../components/create/Phases";

export default function PhasesPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator,   setIsCreator]   = useState(false);
    const [study,       setStudy]       = useState(null);
    const [phases,      setPhases]      = useState([]);

    // 🔐 role check
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

    // 📡 fetch study by id
    useEffect(() => {
        if (!id) return;
        getStudyById(id)
            .then((data) => {
                setStudy(data);
                if (data?.phases?.length) {
                    setPhases(normalizePhases(data.phases));
                }
            })
            .catch((err) => console.log("study error:", err));
    }, [id]);

    const normalizePhases = (rawPhases) =>
    rawPhases.map((p) => ({
        id:              p.phaseId,
        title:           (p.title ?? "").trim(),   
        description:     p.description      ?? "",
        phaseType:       p.phaseType        ?? "NORMAL",
        rewardAmount:    parseFloat(p.rewardAmount?.$numberDecimal ?? p.rewardAmount ?? 0),
        maxParticipants: p.maxParticipants  ?? 0,
        status:          p.status           ?? "PENDING",
        phaseOrder:      p.phaseOrder       ?? 1,
        questions:       p.questions        ?? [],
    }));

    // ➕ Add empty phase to DB then add to state
    const handleAddPhase = async () => {
    try {
        const newPhaseData = {
            title:           "",
            description:     "",
            phaseType:       "NORMAL",
            rewardAmount:    0,
            maxParticipants: 0,
            status:          "PENDING",
            phaseOrder:      phases.length + 1,
        };

        const response = await apiAddPhase(id, newPhaseData);  // 👈 newPhaseData not phaseData

        const updatedPhases = response.study?.phases ?? [];
        const created = updatedPhases[updatedPhases.length - 1];

        setPhases((prev) => [
            ...prev,
            {
                id:              created.phaseId,
                title:           (created.title ?? "").trim(),
                description:     created.description     ?? "",
                phaseType:       created.phaseType       ?? "NORMAL",
                rewardAmount:    parseFloat(created.rewardAmount?.$numberDecimal ?? created.rewardAmount ?? 0),
                maxParticipants: created.maxParticipants ?? 0,
                status:          created.status          ?? "PENDING",
                phaseOrder:      created.phaseOrder      ?? prev.length + 1,
                questions:       created.questions       ?? [],
            },
        ]);
    } catch (err) {
        console.error("Failed to add phase:", err);
    }
};

    // 💾 Save (update) a phase in DB then update state
    const handleUpdatePhase = async (phaseId, fields) => {
        try {
            const current = phases.find((p) => p.id === phaseId);
            if (!current) return;

            const merged = { ...current, ...fields };

            const payload = {
                title:           merged.title          || " ",
                description:     merged.description    || "",
                phaseType:       merged.phaseType      || "NORMAL",
                rewardAmount:    merged.rewardAmount    === "" || merged.rewardAmount    == null ? 0 : Number(merged.rewardAmount),
                maxParticipants: merged.maxParticipants === "" || merged.maxParticipants == null ? 0 : Number(merged.maxParticipants),
                status:          merged.status         || "PENDING",
            };

            await apiUpdatePhase(id, phaseId, payload);

            setPhases((prev) =>
                prev.map((p) => (p.id === phaseId ? { ...p, ...fields } : p))
            );
        } catch (err) {
            console.error("Failed to update phase:", err);
        }
    };

    // 🗑️ Delete phase from DB then remove from state
    const handleDeletePhase = async (phaseId) => {
        try {
            await apiDeletePhase(id, phaseId);
            setPhases((prev) => prev.filter((p) => p.id !== phaseId));
        } catch (err) {
            console.error("Failed to delete phase:", err);
        }
    };

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
                    study={study}
                    phases={phases}
                    onAdd={handleAddPhase}
                    onDelete={handleDeletePhase}
                    onUpdate={handleUpdatePhase}
                />
            </div>
        </div>
    );
}