import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BecomecreatorIl from "../components/mysurveys/BecomeCreatorIl";
import { getMyRoles } from "../api/Role";
import Surveys from "../components/mysurveys/Surveys";

const MOCK_STUDIES = [
    { studyId: "1", title: "Q4 Consumer Tech Sentiment Analysis", studyCategory: "USABILITY",  studyStatus: "ACTIVE",    totalBudget: 500,  spent: 300,  endDate: "2025-05-15", phases: [{}, {}, {}] },
    { studyId: "2", title: "Remote Work Behavioral Study 2024",   studyCategory: "INTERVIEW",  studyStatus: "COMPLETED", totalBudget: 1200, spent: 1200, endDate: "2025-01-30", phases: [{}, {}, {}, {}, {}] },
    { studyId: "3", title: "UX Friction Points — Checkout Flow",  studyCategory: "SURVEY",     studyStatus: "PUBLISHED", totalBudget: 850,  spent: 127,  endDate: "2025-06-01", phases: [{}, {}] },
    { studyId: "4", title: "Employee Engagement Experiment 2025", studyCategory: "EXPERIMENT", studyStatus: "ARCHIVED",  totalBudget: 500,  spent: 500,  endDate: "2025-12-01", phases: [{}, {}, {}, {}] },
];

export default function MySurveys() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator,   setIsCreator]   = useState(false);
    const [studies,     setStudies]     = useState(MOCK_STUDIES);

    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const hasCreator = roles.some((r) =>
                    typeof r === "string" ? r === "CREATOR" : r?.roleName === "CREATOR"
                );
                setIsCreator(hasCreator);
                console.log(hasCreator);
            })
            .catch((err) => console.log("roles error:", err));
    }, []);

    const handleStatusChange = (studyId, newStatus) =>
        setStudies((prev) => prev.map((s) => s.studyId === studyId ? { ...s, studyStatus: newStatus } : s));

    const handleDelete = (studyId) =>
        setStudies((prev) => prev.filter((s) => s.studyId !== studyId));

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
                        <Surveys
                            studies={studies}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                        />
                    </div>
                </>
            ) : (
                <BecomecreatorIl setIsCreator={setIsCreator} />
            )}
        </div>
    );
}