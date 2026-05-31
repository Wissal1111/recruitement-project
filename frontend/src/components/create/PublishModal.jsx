import { useState, useEffect } from "react";
import { getAllInterests } from "../../api/Intrests";
import { createCriteria, updateCriteria, getCriteria } from "../../api/RecruitmentApi";
import { publishStudy } from "../../api/StudyApi";
import "./PublishModal.css";
import { Send } from "lucide-react";

const GENDER_OPTIONS = [
    { value: "",       label: "Any gender" },
    { value: "MALE",   label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER",  label: "Other" },
];

const EDUCATION_OPTIONS = [
    { value: "",                label: "Any level" },
    { value: "HIGH_SCHOOL",     label: "High School" },
    { value: "ASSOCIATE",       label: "Associate Degree" },
    { value: "BACHELOR",        label: "Bachelor's Degree" },
    { value: "MASTER",          label: "Master's Degree" },
    { value: "PHD",             label: "PhD" },
    { value: "OTHER",           label: "Other" },
];

function Spinner() {
    return (
        <svg className="pm__spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
            <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

export default function PublishModal({ study, onClose, onPublished }) {
    const [form, setForm] = useState({
        ageMin:         "",
        ageMax:         "",
        gender:         "",
        country:        "",
        educationLevel: "",
    });
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [allInterests,      setAllInterests]      = useState([]);
    const [loadingInterests,  setLoadingInterests]  = useState(true);
    const [loadingCriteria,   setLoadingCriteria]   = useState(true);
    const [submitting,        setSubmitting]        = useState(false);
    const [error,             setError]             = useState(null);
    const [criteriaExists,    setCriteriaExists]    = useState(false);

    // Load all interests + existing criteria in parallel
    useEffect(() => {
        Promise.all([
            getAllInterests().catch(() => ({ interests: [] })),
            getCriteria(study.studyId).catch(() => null),
        ]).then(([interestsData, existingCriteria]) => {
            const list = Array.isArray(interestsData)
                ? interestsData
                : interestsData?.interests ?? [];
            setAllInterests(list);

            if (existingCriteria) {
                setCriteriaExists(true);
                setForm({
                    ageMin:         existingCriteria.ageMin         ?? "",
                    ageMax:         existingCriteria.ageMax         ?? "",
                    gender:         existingCriteria.gender         ?? "",
                    country:        existingCriteria.country        ?? "",
                    educationLevel: existingCriteria.educationLevel ?? "",
                });
                setSelectedInterests(
                    (existingCriteria.interestIds ?? []).map(String)
                );
            }
        }).finally(() => {
            setLoadingInterests(false);
            setLoadingCriteria(false);
        });
    }, [study.studyId]);

    const set = (field) => (e) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const toggleInterest = (interestId) => {
        const id = String(interestId);
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePublish = async () => {
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                ageMin:         form.ageMin         ? parseInt(form.ageMin)  : null,
                ageMax:         form.ageMax         ? parseInt(form.ageMax)  : null,
                gender:         form.gender         || null,
                country:        form.country        || null,
                educationLevel: form.educationLevel || null,
                interestIds:    selectedInterests,
            };

            // Save or update criteria
            if (criteriaExists) {
                await updateCriteria(study.studyId, payload);
            } else {
                await createCriteria(study.studyId, payload);
            }

            // Flip status to PUBLISHED
            await publishStudy(study.studyId);

            onPublished();
            onClose();
        } catch (err) {
            setError(err?.message || "Failed to publish study. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const isLoading = loadingInterests || loadingCriteria;

    return (
        <div className="pm__overlay" onClick={onClose}>
            <div className="pm__modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="pm__header">
                    <div className="pm__header-text">
                        <h3>Publish Study</h3>
                        <p>Set eligibility criteria before publishing <strong>{study?.title}</strong></p>
                    </div>
                    <button className="pm__close" onClick={onClose} disabled={submitting}>×</button>
                </div>

                {isLoading ? (
                    <div className="pm__loading">
                        <Spinner />
                        <span>Loading criteria…</span>
                    </div>
                ) : (
                    <div className="pm__body">

                        {/* Eligibility Criteria */}
                        <div className="pm__section-label">Eligibility Criteria</div>

                        <div className="pm__row">
                            <div className="pm__field">
                                <label>Min Age</label>
                                <input
                                    type="number"
                                    value={form.ageMin}
                                    onChange={set("ageMin")}
                                    placeholder="e.g. 18"
                                    min={1} max={120}
                                />
                            </div>
                            <div className="pm__field">
                                <label>Max Age</label>
                                <input
                                    type="number"
                                    value={form.ageMax}
                                    onChange={set("ageMax")}
                                    placeholder="e.g. 60"
                                    min={1} max={120}
                                />
                            </div>
                        </div>

                        <div className="pm__field">
                            <label>Gender</label>
                            <select value={form.gender} onChange={set("gender")}>
                                {GENDER_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pm__field">
                            <label>Country</label>
                            <input
                                value={form.country}
                                onChange={set("country")}
                                placeholder="e.g. DZ, FR, US..."
                            />
                        </div>

                        <div className="pm__field">
                            <label>Education Level</label>
                            <select value={form.educationLevel} onChange={set("educationLevel")}>
                                {EDUCATION_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Interests */}
                        <div className="pm__section-label" style={{ marginTop: 8 }}>
                            Related Interests
                            <span className="pm__section-hint">Participants with these interests will be targeted</span>
                        </div>

                        <div className="pm__interests">
                            {allInterests.length === 0 ? (
                                <p className="pm__no-interests">No interests available.</p>
                            ) : (
                                allInterests.map(interest => {
                                    const id = String(interest.interestId);
                                    const selected = selectedInterests.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            className={`pm__interest-tag${selected ? " pm__interest-tag--selected" : ""}`}
                                            onClick={() => toggleInterest(id)}
                                        >
                                            {interest.name}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {error && <div className="pm__error">{error}</div>}
                    </div>
                )}

                {/* Footer */}
                {!isLoading && (
                    <div className="pm__footer">
                        <button
                            className="pm__btn pm__btn--cancel"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            className="pm__btn pm__btn--publish"
                            onClick={handlePublish}
                            disabled={submitting}
                        >
                            {submitting ? <Spinner /> : <Send size={14} strokeWidth={2.5} />}
                            {submitting ? "Publishing…" : "Save & Publish"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}