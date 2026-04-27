import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./studyinfo.css";

function SurveyIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#7073FF" fillOpacity="0.2" />
            <path d="M18.0556 24.8612H26.8056V19.0278H18.0556V24.8612ZM12.2223 27.7778C11.6876 27.7778 11.2298 27.5874 10.849 27.2067C10.4682 26.8259 10.2778 26.3681 10.2778 25.8334V14.1667C10.2778 13.632 10.4682 13.1742 10.849 12.7935C11.2298 12.4127 11.6876 12.2223 12.2223 12.2223H27.7778C28.3126 12.2223 28.7703 12.4127 29.1511 12.7935C29.5319 13.1742 29.7223 13.632 29.7223 14.1667V25.8334C29.7223 26.3681 29.5319 26.8259 29.1511 27.2067C28.7703 27.5874 28.3126 27.7778 27.7778 27.7778H12.2223ZM12.2223 25.8334H27.7778V14.1667H12.2223V25.8334Z" fill="#4A4BD7" />
        </svg>
    );
}

export default function StudyInfo({ onNext, onDiscard }) {  // ADD PROPS HERE
    const navigate = useNavigate();
    const [phase, setPhase] = useState("single");
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        budget: "",
        deadline: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="study-card">

            {/* Header */}
            <div className="study-card__header">
                <SurveyIcon />
                <h2 className="study-card__title">Study Identity</h2>
            </div>

            {/* Title */}
            <div className="study-card__field">
                <label className="study-card__label">Study Title</label>
                <input
                    className="study-card__input"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Q4 Consumer Tech Sentiment Analysis"
                />
            </div>

            {/* Description */}
            <div className="study-card__field">
                <label className="study-card__label">Description</label>
                <textarea
                    className="study-card__textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Briefly explain the goal of this study..."
                />
            </div>

            {/* Category + Budget */}
            <div className="study-card__row">
                <div>
                    <label className="study-card__label">Study Category</label>
                    <select
                        className="study-card__select"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select category</option>
                        <option value="USABILITY">Usability</option>
                        <option value="SURVEY">Survey</option>
                        <option value="EXPERIMENT">Experiment</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <div>
                    <label className="study-card__label">Total Budget</label>
                    <div className="study-card__budget-wrap">
                        <span className="study-card__budget-sym">$</span>
                        <input
                            className="study-card__input"
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Deadline */}
            <div className="study-card__field">
                <label className="study-card__label">Deadline</label>
                <input
                    type="date"
                    className="study-card__input"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                />
            </div>

            {/* Research Methodology */}
            <label className="study-card__label">Research Methodology</label>
            <div className="study-card__phases">
                <div
                    className={`study-card__phase ${phase === "single" ? "study-card__phase--selected" : ""}`}
                    onClick={() => setPhase("single")}
                >
                    <div className="study-card__phase-radio">
                        <div className="study-card__phase-dot" />
                    </div>
                    <div>
                        <p className="study-card__phase-name">Single Phase</p>
                        <p className="study-card__phase-desc">Standard one-time questionnaire for immediate results.</p>
                    </div>
                </div>

                <div
                    className={`study-card__phase ${phase === "multi" ? "study-card__phase--selected" : ""}`}
                    onClick={() => setPhase("multi")}
                >
                    <div className="study-card__phase-radio">
                        <div className="study-card__phase-dot" />
                    </div>
                    <div>
                        <p className="study-card__phase-name">Multi-Phase</p>
                        <p className="study-card__phase-desc">Sequential waves for longitudinal behavioral tracking.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="study-card__footer">
                <span className="study-card__autosave">
                    All changes are saved automatically in real-time.
                </span>
                <div className="study-card__footer-btns">
                    <button className="study-card__btn-next" onClick={onNext}>  {/* ADD onClick */}
                        Next: Build Questions
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </button>
                </div>
            </div>

        </div>
    );
}