import QuestionCard from "./QuestionCard";
import "./Questions.css";

export default function Questions({ questions, onAdd, onDelete, onDuplicate, onBack }) {
    return (
        <div className="create-questions">
            

            {questions.map((q, i) => (
                <QuestionCard
                    key={q.id}
                    orderIndex={i + 1}
                    onDelete={() => onDelete(q.id)}
                    onDuplicate={() => onDuplicate(q.id)}
                />
            ))}

            <div className="add-question-btn">
                <button className="create-questions__add-btn" onClick={onAdd}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Question
            </button>
            </div>

            <button className="create-questions__back-btn" onClick={onBack}>
                ← Back to Study Identity
            </button>
        </div>
    );
}