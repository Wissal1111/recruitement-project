import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStudy } from "../../api/StudyApi";
import "./studyinfo.css";

function SurveyIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#7073FF" fillOpacity="0.2" />
            <path d="M18.0556 24.8612H26.8056V19.0278H18.0556V24.8612ZM12.2223 27.7778C11.6876 27.7778 11.2298 27.5874 10.849 27.2067C10.4682 26.8259 10.2778 26.3681 10.2778 25.8334V14.1667C10.2778 13.632 10.4682 13.1742 10.849 12.7935C11.2298 12.4127 11.6876 12.2223 12.2223 12.2223H27.7778C28.3126 12.2223 28.7703 12.4127 29.1511 12.7935C29.5319 13.1742 29.7223 13.632 29.7223 14.1667V25.8334C29.7223 26.8259 29.5319 26.8259 29.1511 27.2067C28.7703 27.5874 28.3126 27.7778 27.7778 27.7778H12.2223ZM12.2223 25.8334H27.7778V14.1667H12.2223V25.8334Z" fill="#4A4BD7" />
        </svg>
    );
}

const validate = (form) => {
    const errors = {};
    if (!form.title.trim())                                errors.title     = "Study title is required.";
    if (!form.category)                                    errors.category  = "Please select a category.";
    if (form.budget === "" || isNaN(Number(form.budget)))  errors.budget    = "A valid budget is required.";
    else if (Number(form.budget) < 0)                      errors.budget    = "Budget cannot be negative.";
    if (!form.startDate)                                   errors.startDate = "Start date is required.";
    if (!form.deadline)                                    errors.deadline  = "End date is required.";
    if (form.startDate && form.deadline && form.deadline <= form.startDate)
                                                           errors.deadline  = "End date must be after start date.";
    return errors;
};

export default function StudyInfo({ onDiscard }) {
    const navigate = useNavigate();

    const [phase,     setPhase]     = useState("single");
    const [errors,    setErrors]    = useState({});
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        title:       "",
        description: "",
        category:    "",
        budget:      "",
        startDate:   "",
        deadline:    "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);
    };

    const handleFocus = (e) => {
        const { name } = e.target;
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleNext = async () => {
        setSubmitted(true);
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        try {
            const studyData = {
                title:         form.title,
                description:   form.description,
                totalBudget:   Number(form.budget),
                studyCategory: form.category,
                startDate:     form.startDate,
                endDate:       form.deadline,
                isMultiPhase:  phase === "multi",
            };

            const response = await createStudy(studyData);
            const studyId  = response.studyId;

            if (phase === "multi") {
                navigate(`./study/${studyId}/phases/`);
            } else {
                // Single phase — récupère le phaseId auto-créé
                const phases = response.phases || [];
                if (phases.length > 0) {
                    const phaseId = phases[0].phaseId;
                    navigate(`./study/${studyId}/phases/${phaseId}/questions`);
                } else {
                    // Fallback si pas de phase auto-créée
                    navigate(`./study/${studyId}/phases/`);
                }
            }
        } catch (error) {
            console.error("Failed to create study:", error.response?.data || error.message);
        }
    };

    return (
        <div className="si">

            <div className="si__header">
                <SurveyIcon />
                <h2 className="si__title">Study Identity</h2>
            </div>

            {/* Title */}
            <div className="si__field">
                <label className="si__label">
                    Study Title <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <input
                    className={`si__input ${errors.title ? "si__input--error" : ""}`}
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    placeholder="e.g. Q4 Consumer Tech Sentiment Analysis"
                />
                {errors.title && <p className="si__error">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="si__field">
                <label className="si__label">Description</label>
                <textarea
                    className="si__textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    placeholder="Briefly explain the goal of this study..."
                />
            </div>

            {/* Category + Budget */}
            <div className="si__row">
                <div>
                    <label className="si__label">
                        Study Category <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <select
                        className={`si__select ${errors.category ? "si__input--error" : ""}`}
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        onFocus={handleFocus}
                    >
                        <option value="" disabled>Select category</option>
                        <option value="USABILITY">Usability</option>
                        <option value="SURVEY">Survey</option>
                        <option value="EXPERIMENT">Experiment</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OTHER">Other</option>
                    </select>
                    {errors.category && <p className="si__error">{errors.category}</p>}
                </div>

                {/* Budget */}
                <div>
                    <label className="si__label">
                        Total Budget <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <div className="si__budget-wrap">
                        <span className="si__budget-sym">$</span>
                        <input
                            className={`si__input ${errors.budget ? "si__input--error" : ""}`}
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            placeholder="0.00"
                            type="number"
                            min="0"
                        />
                    </div>
                    {errors.budget && <p className="si__error">{errors.budget}</p>}
                </div>
            </div>

            {/* Start Date + End Date */}
            <div className="si__row">
                <div>
                    <label className="si__label">
                        Start Date <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                        type="date"
                        className={`si__input ${errors.startDate ? "si__input--error" : ""}`}
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        onFocus={handleFocus}
                    />
                    {errors.startDate && <p className="si__error">{errors.startDate}</p>}
                </div>

                <div>
                    <label className="si__label">
                        End Date <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                        type="date"
                        className={`si__input ${errors.deadline ? "si__input--error" : ""}`}
                        name="deadline"
                        value={form.deadline}
                        onChange={handleChange}
                        onFocus={handleFocus}
                    />
                    {errors.deadline && <p className="si__error">{errors.deadline}</p>}
                </div>
            </div>

            {/* Research Methodology */}
            <label className="si__label">Research Methodology</label>

            <div className="si__phases">
                <div
                    className={`si__phase ${phase === "single" ? "si__phase--selected" : ""}`}
                    onClick={() => setPhase("single")}
                >
                    <div className="si__phase-radio">
                        <div className="si__phase-dot" />
                    </div>
                    <div>
                        <p className="si__phase-name">Single Phase</p>
                        <p className="si__phase-desc">Standard one-time questionnaire for immediate results.</p>
                    </div>
                </div>

                <div
                    className={`si__phase ${phase === "multi" ? "si__phase--selected" : ""}`}
                    onClick={() => setPhase("multi")}
                >
                    <div className="si__phase-radio">
                        <div className="si__phase-dot" />
                    </div>
                    <div>
                        <p className="si__phase-name">Multi-Phase</p>
                        <p className="si__phase-desc">Sequential waves for longitudinal behavioral tracking.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="si__footer">
                <span className="si__autosave">
                    All changes are saved automatically in real-time.
                </span>
                <div className="si__footer-btns">
                    <button className="si__btn-next" onClick={handleNext}>
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