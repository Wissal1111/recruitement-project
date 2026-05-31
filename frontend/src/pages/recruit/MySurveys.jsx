import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BecomecreatorIl from "../../components/mysurveys/BecomeCreatorIl";
import { getMyRoles } from "../../api/Role";
import { getMyStudies, deleteStudy } from "../../api/StudyApi";
import Surveys from "../../components/mysurveys/Surveys";
import SurveysSkeleton from "../../components/mysurveys/SurveysSkeleton";

const normalizeStudy = (s) => ({
    ...s,
    totalBudget: parseFloat(s.totalBudget?.$numberDecimal ?? s.totalBudget ?? 0),
    spent:       parseFloat(s.spent?.$numberDecimal       ?? s.spent       ?? 0),
});

export default function MySurveys() {
    const navigate = useNavigate();
    const [sidebarOpen,  setSidebarOpen]  = useState(false);
    const [isCreator,    setIsCreator]    = useState(false);
    const [studies,      setStudies]      = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [studiesCount, setStudiesCount] = useState(
        () => parseInt(localStorage.getItem("studiesCount") || "5")
    );

    useEffect(() => {
        Promise.all([getMyRoles(), getMyStudies()])
            .then(([rolesData, studiesData]) => {
                const roles = rolesData?.roles || [];
                const hasCreator = roles.some((r) =>
                    typeof r === "string" ? r === "CREATOR" : r?.roleName === "CREATOR"
                );
                setIsCreator(hasCreator);

                const normalized = (studiesData?.studies || []).map(normalizeStudy);
                setStudies(normalized);

                const count = studiesData?.count ?? normalized.length;
                setStudiesCount(count);
                localStorage.setItem("studiesCount", count);
            })
            .catch((err) => console.error("MySurveys init error:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (studyId) => {
        try {
            await deleteStudy(studyId);
            setStudies((prev) => prev.filter((s) => s.studyId !== studyId));
            setStudiesCount((prev) => {
                const next = prev - 1;
                localStorage.setItem("studiesCount", next);
                return next;
            });
        } catch (err) {
            console.error("Failed to delete study:", err);
        }
    };

    if (loading) return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="mysurveys" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="wrapper">
                <SurveysSkeleton count={studiesCount} />
            </div>
        </div>
    );

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {isCreator ? (
                <>
                    <SideBar page="mysurveys" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    <div className="wrapper">
                        <Surveys
                            studies={studies}
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