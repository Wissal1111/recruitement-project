import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyRoles } from "../../api/Role";
import { getStudyById } from "../../api/StudyApi";
import { addQuestion as apiAddQuestion, removeQuestion as apiRemoveQuestion, updateQuestion as apiUpdateQuestion } from "../../api/QuestionsApi";
import Questions from "../../components/create/Questions";

export default function QuestionsPage() {
    const navigate          = useNavigate();
    const { id, phaseId }   = useParams();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [questions,   setQuestions]   = useState([]);

    useEffect(() => {
        getMyRoles()
            .then((data) => {
                const roles = data?.roles || [];
                const hasCreator = roles.some((r) =>
                    typeof r === "string" ? r === "CREATOR" : r?.roleName === "CREATOR"
                );
                if (!hasCreator) navigate("/recruit");
            })
            .catch((err) => console.log("roles error:", err));
    }, []);

    useEffect(() => {
        if (!id || !phaseId) return;
        getStudyById(id)
            .then((data) => {
                const phase = data?.phases?.find((p) => p.phaseId === phaseId);
                if (phase?.questions?.length) {
                    setQuestions(normalizeQuestions(phase.questions));
                }
            })
            .catch((err) => console.log("study error:", err));
    }, [id, phaseId]);

    const normalizeQuestions = (raw) =>
        raw.map((q) => ({
            id:           q.questionId,
            text:         (q.text ?? "").trim(),
            questionType: q.questionType ?? "TEXT",
            isRequired:   q.isRequired   ?? false,
            orderIndex:   q.orderIndex   ?? 1,
            options:      q.options      ?? [],
        }));

    // ➕ Add
    const handleAddQuestion = async () => {
    try {
        const newQuestionData = {
            text:         " ",
            questionType: "TEXT",   // 👈 TEXT has no options requirement
            isRequired:   false,
            orderIndex:   questions.length + 1,
            options:      [],
        };

        const response     = await apiAddQuestion(id, phaseId, newQuestionData);
        const updatedPhase = response.study?.phases?.find((p) => p.phaseId === phaseId);
        const created      = updatedPhase?.questions?.[updatedPhase.questions.length - 1];

        setQuestions((prev) => [
            ...prev,
            {
                id:           created.questionId,
                text:         (created.text ?? "").trim(),
                questionType: created.questionType ?? "TEXT",
                isRequired:   created.isRequired   ?? false,
                orderIndex:   created.orderIndex   ?? prev.length + 1,
                options:      created.options      ?? [],
            },
        ]);
    } catch (err) {
        console.error("Failed to add question:", err);
    }
};

    // 🗑️ Delete
    const handleDeleteQuestion = async (questionId) => {
        try {
            await apiRemoveQuestion(id, phaseId, questionId);
            setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        } catch (err) {
            console.error("Failed to delete question:", err);
        }
    };

    // 📋 Duplicate
    const handleDuplicateQuestion = async (questionId) => {
        try {
            const source = questions.find((q) => q.id === questionId);
            if (!source) return;

            const response    = await apiAddQuestion(id, phaseId, {
                text:         source.text,
                questionType: source.questionType,
                isRequired:   source.isRequired,
                orderIndex:   questions.length + 1,
                options:      [...source.options],
            });

            const updatedPhase = response.study?.phases?.find((p) => p.phaseId === phaseId);
            const created      = updatedPhase?.questions?.[updatedPhase.questions.length - 1];

            setQuestions((prev) => [
                ...prev,
                {
                    id:           created.questionId,
                    text:         (created.text ?? "").trim(),
                    questionType: created.questionType ?? source.questionType,
                    isRequired:   created.isRequired   ?? source.isRequired,
                    orderIndex:   created.orderIndex   ?? prev.length + 1,
                    options:      created.options      ?? [],
                },
            ]);
        } catch (err) {
            console.error("Failed to duplicate question:", err);
        }
    };

    // 💾 Update (delete + re-add)
const handleUpdateQuestion = async (questionId, fields) => {
    const needsOptions = ["MULTIPLE_CHOICE", "SINGLE_CHOICE"].includes(fields.questionType);

    const mappedOptions = needsOptions
        ? (fields.options ?? []).map((opt, i) => ({
            label:      typeof opt === "string" ? opt : (opt.label || `Option ${i + 1}`),
            value:      typeof opt === "string" ? opt : (opt.value || `option_${i + 1}`),
            orderIndex: i + 1,
          })).filter((opt) => opt.label.trim())
        : [];

    const payload = {
        text:         fields.text         || " ",
        questionType: fields.questionType  || "TEXT",
        isRequired:   fields.isRequired    ?? false,
        orderIndex:   questions.find((q) => q.id === questionId)?.orderIndex ?? 1,
        options:      needsOptions && mappedOptions.length === 0
            ? [{ label: "Option 1", value: "option_1", orderIndex: 1 }]  // 👈 default if empty
            : mappedOptions,
    };

    await apiUpdateQuestion(id, phaseId, questionId, payload);

    setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...fields } : q))
    );
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
                <Questions
                    questions={questions}
                    onAdd={handleAddQuestion}
                    onDelete={handleDeleteQuestion}
                    onDuplicate={handleDuplicateQuestion}
                    onUpdate={handleUpdateQuestion}
                    onBack={() => navigate(-1)}
                />
            </div>
        </div>
    );
}