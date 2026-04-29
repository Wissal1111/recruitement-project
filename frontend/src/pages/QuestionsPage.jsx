import SideBar from "../components/SideBar";
import TopNavBar from "../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BecomecreatorIl from "../components/mysurveys/BecomeCreatorIl";
import { getMyRoles } from "../api/Role";
import StudyInfo from "../components/create/StudyInfo";
import Questions from "../components/create/Questions";  // ADD

export default function QuestionsPage() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [step, setStep] = useState("identity");
    const [questions, setQuestions] = useState([{ id: Date.now() }]);

    const addQuestion = () =>
        setQuestions((prev) => [...prev, { id: Date.now() }]);

    const removeQuestion = (id) =>
        setQuestions((prev) => prev.filter((q) => q.id !== id));

    const duplicateQuestion = (id) =>
        setQuestions((prev) => [...prev, { id: Date.now() }]);

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
              
                    <Questions
                        questions={questions}
                        onAdd={addQuestion}
                        onDelete={removeQuestion}
                        onDuplicate={duplicateQuestion}
                        onBack={()=>navigate(-1)}
                    />
              
            </div>
        </div>
    );
}