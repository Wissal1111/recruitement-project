import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRef } from "react";
import {
    ArrowLeft, Send, Pencil, Check, X, ChevronDown,
    Lock, Unlock, Users, DollarSign, ToggleLeft, ToggleRight,
    AlertTriangle, Loader2,HelpCircle
} from "lucide-react";
import { getStudyById, updateStudy, publishStudy } from "../../api/StudyApi";
import { updatePhase } from "../../api/PhasesApi";
import {
    createCriteria, updateCriteria, getCriteria
} from "../../api/RecruitmentApi";
import { getAllInterests as fetchInterests } from "../../api/Intrests";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import "./ManagePage.css";

const GENDER_OPTIONS = [
    { value: "", label: "Any gender" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
];

const EDUCATION_OPTIONS = [
    { value: "", label: "Any level" },
    { value: "HIGH_SCHOOL", label: "High School" },
    { value: "ASSOCIATE", label: "Associate Degree" },
    { value: "BACHELOR", label: "Bachelor's Degree" },
    { value: "MASTER", label: "Master's Degree" },
    { value: "PHD", label: "PhD" },
    { value: "OTHER", label: "Other" },
];

const STUDY_CATEGORIES = [
    "Academic Research", "Market Research", "UX Research",
    "Psychology", "Health & Medicine", "Social Science", "Other"
];

function Spinner({ size = 16 }) {
    return <Loader2 size={size} className="mp__spin" />;
}

export default function ManagePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const criteriaRef = useRef(null);

    // Study state
    const [study, setStudy]     = useState(null);
    const [phases, setPhases]   = useState([]);
    const [loading, setLoading] = useState(true);

    // Study info edit
    const [editingInfo, setEditingInfo] = useState(false);
    const [infoForm, setInfoForm]       = useState({});
    const [savingInfo, setSavingInfo]   = useState(false);

    // Criteria
    const [criteriaExists, setCriteriaExists]     = useState(false);
    const [criteriaForm, setCriteriaForm]         = useState({
        ageMin: "", ageMax: "", gender: "", country: "", educationLevel: ""
    });
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [allInterests, setAllInterests]           = useState([]);
    const [savingCriteria, setSavingCriteria]       = useState(false);
    const [criteriaOpen, setCriteriaOpen]           = useState(false);

    // Publish
    const [publishing, setPublishing]         = useState(false);
    const [showConfirm, setShowConfirm]       = useState(false);
    const [publishError, setPublishError]     = useState(null);
    const [criteriaError, setCriteriaError]   = useState(null);
    const [showNoCriteria, setShowNoCriteria] = useState(false);


    // Phase toggling
    const [togglingPhase, setTogglingPhase] = useState(null);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            getStudyById(id),
            getCriteria(id).catch(() => null),
            fetchInterests().catch(() => ({ interests: [] })),
        ]).then(([studyData, existingCriteria, interestsData]) => {
            console.log(existingCriteria)
            setStudy(studyData);
            const rawPhases = studyData?.phases || [];
            setPhases(normalizePhases(rawPhases));

            setInfoForm({
                title:         studyData?.title         || "",
                description:   studyData?.description   || "",
                studyCategory: studyData?.studyCategory || "",
                endDate:       studyData?.endDate
                    ? new Date(studyData.endDate).toISOString().split("T")[0]
                    : "",
            });

            const list = Array.isArray(interestsData)
                ? interestsData
                : interestsData?.interests ?? [];
            setAllInterests(list);

            // getCriteria returns an axios response — unwrap .data
            const criteria = existingCriteria?.data ?? existingCriteria;
            if (criteria) {
                setCriteriaExists(true);
                setCriteriaForm({
                    ageMin:         criteria.ageMin         ?? "",
                    ageMax:         criteria.ageMax         ?? "",
                    gender:         criteria.gender         ?? "",
                    country:        criteria.country        ?? "",
                    educationLevel: criteria.educationLevel ?? "",
                });
                setSelectedInterests(
                    (criteria.interestIds ?? []).map(String)
                );
                setCriteriaOpen(true);
            }
        }).finally(() => setLoading(false));
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

    // ─── Study Info ───────────────────────────────────────────────
    const handleSaveInfo = async () => {
        setSavingInfo(true);
        try {
            const updated = await updateStudy(id, infoForm);
            setStudy((prev) => ({ ...prev, ...infoForm }));
            setEditingInfo(false);
        } catch (err) {
            console.error("Failed to update study:", err);
        } finally {
            setSavingInfo(false);
        }
    };

    // ─── Criteria ─────────────────────────────────────────────────
    const handleSaveCriteria = async () => {
        setSavingCriteria(true);
        setCriteriaError(null);
        try {
            const payload = {
                ageMin:         criteriaForm.ageMin         ? parseInt(criteriaForm.ageMin)  : null,
                ageMax:         criteriaForm.ageMax         ? parseInt(criteriaForm.ageMax)  : null,
                gender:         criteriaForm.gender         || null,
                country:        criteriaForm.country        || null,
                educationLevel: criteriaForm.educationLevel || null,
                interestIds:    selectedInterests,
            };
            if (criteriaExists) {
                await updateCriteria(id, payload);
            } else {
                await createCriteria(id, payload);
                setCriteriaExists(true);
            }
        } catch (err) {
            setCriteriaError("Failed to save criteria.");
        } finally {
            setSavingCriteria(false);
        }
    };

    const toggleInterest = (interestId) => {
        const sid = String(interestId);
        setSelectedInterests((prev) =>
            prev.includes(sid) ? prev.filter((i) => i !== sid) : [...prev, sid]
        );
    };

    // ─── Phase open/closed toggle ─────────────────────────────────
    const handleTogglePhase = async (phase) => {
        const newStatus = phase.status === "ACTIVE" ? "PENDING" : "ACTIVE";
        setTogglingPhase(phase.id);
        try {
            await updatePhase(id, phase.id, {
                title:           phase.title          || " ",
                description:     phase.description    || "",
                phaseType:       phase.phaseType      || "NORMAL",
                rewardAmount:    Number(phase.rewardAmount)    || 0,
                maxParticipants: Number(phase.maxParticipants) || 0,
                status:          newStatus,
            });
            setPhases((prev) =>
                prev.map((p) => p.id === phase.id ? { ...p, status: newStatus } : p)
            );
        } catch (err) {
            console.error("Failed to toggle phase:", err);
        } finally {
            setTogglingPhase(null);
        }
    };

    // ─── Publish ──────────────────────────────────────────────────
    const handlePublish = async () => {
        setPublishing(true);
        setPublishError(null);
        try {
            // Save criteria first if open and modified
            if (criteriaOpen) {
                const payload = {
                    ageMin:         criteriaForm.ageMin         ? parseInt(criteriaForm.ageMin)  : null,
                    ageMax:         criteriaForm.ageMax         ? parseInt(criteriaForm.ageMax)  : null,
                    gender:         criteriaForm.gender         || null,
                    country:        criteriaForm.country        || null,
                    educationLevel: criteriaForm.educationLevel || null,
                    interestIds:    selectedInterests,
                };
                if (criteriaExists) {
                    await updateCriteria(id, payload);
                } else {
                    await createCriteria(id, payload);
                    setCriteriaExists(true);
                }
            }
            await publishStudy(id);
            setStudy((prev) => ({ ...prev, studyStatus: "PUBLISHED" }));
            setShowConfirm(false);
        } catch (err) {
            setPublishError(err?.message || "Failed to publish study.");
        } finally {
            setPublishing(false);
        }
    };

    const isPublished = study?.studyStatus === "PUBLISHED";
    const isCompleted = study?.studyStatus === "COMPLETED";
    const canPublish  = !isPublished && !isCompleted;

    if (loading) {
        return (
            <div className="dashboard">
                <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <SideBar page="createsurvey" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="mp__loading-screen">
                    <Spinner size={32} />
                    <p>Loading study…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="createsurvey" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper centered">
                <div className="mp">

                    {/* Top bar */}
                    <div className="mp__topbar">
                        <button className="mp__back" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} />
                            Back to Phases
                        </button>
                        <div className="mp__topbar-right">
                            <span className={`mp__status-badge mp__status-badge--${(study?.studyStatus || "DRAFT").toLowerCase()}`}>
                                {study?.studyStatus || "DRAFT"}
                            </span>
                            {canPublish && (
                                <button
    className="mp__publish-btn"
    onClick={() => {
        if (criteriaExists) {
            setShowConfirm(true);
        } else {
            setShowNoCriteria(true);
        }
    }}
    disabled={publishing}
>
                                    {publishing ? <Spinner size={14} /> : <Send size={14} strokeWidth={2.5} />}
                                    {publishing ? "Publishing…" : "Publish Study"}
                                </button>
                            )}
                            
                        </div>
                    </div>

                    <div className="mp__grid">

                        {/* ── LEFT COLUMN ── */}
                        <div className="mp__left">

                            {/* Study Info Card */}
                            <div className="mp__card">
                                <div className="mp__card-header">
                                    <div>
                                        <h2 className="mp__card-title">Study Info</h2>
                                        <p className="mp__card-sub">Basic details about your study</p>
                                    </div>
                                    {!editingInfo ? (
                                        <button className="mp__icon-btn" onClick={() => setEditingInfo(true)}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                    ) : (
                                        <div className="mp__edit-actions">
                                            <button className="mp__icon-btn mp__icon-btn--cancel" onClick={() => setEditingInfo(false)} disabled={savingInfo}>
                                                <X size={14} />
                                            </button>
                                            <button className="mp__icon-btn mp__icon-btn--save" onClick={handleSaveInfo} disabled={savingInfo}>
                                                {savingInfo ? <Spinner size={13} /> : <Check size={14} />}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="mp__info-body">
                                    {editingInfo ? (
                                        <div className="mp__form">
                                            <div className="mp__field">
                                                <label>Title</label>
                                                <input
                                                    value={infoForm.title}
                                                    onChange={(e) => setInfoForm(p => ({ ...p, title: e.target.value }))}
                                                    placeholder="Study title"
                                                />
                                            </div>
                                            <div className="mp__field">
                                                <label>Description</label>
                                                <textarea
                                                    value={infoForm.description}
                                                    onChange={(e) => setInfoForm(p => ({ ...p, description: e.target.value }))}
                                                    placeholder="Study description"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="mp__row">
                                                <div className="mp__field">
                                                    <label>Category</label>
                                                    <select
                                                        value={infoForm.studyCategory}
                                                        onChange={(e) => setInfoForm(p => ({ ...p, studyCategory: e.target.value }))}
                                                    >
                                                        <option value="">Select category</option>
                                                        {STUDY_CATEGORIES.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mp__field">
                                                    <label>End Date</label>
                                                    <input
                                                        type="date"
                                                        value={infoForm.endDate}
                                                        onChange={(e) => setInfoForm(p => ({ ...p, endDate: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mp__info-display">
                                            <div className="mp__info-row">
                                                <span className="mp__info-label">Title</span>
                                                <span className="mp__info-value">{study?.title || "—"}</span>
                                            </div>
                                            <div className="mp__info-row">
                                                <span className="mp__info-label">Description</span>
                                                <span className="mp__info-value mp__info-value--desc">{study?.description || "—"}</span>
                                            </div>
                                            <div className="mp__info-row">
                                                <span className="mp__info-label">Category</span>
                                                <span className="mp__info-value">{study?.studyCategory || "—"}</span>
                                            </div>
                                            <div className="mp__info-row">
                                                <span className="mp__info-label">End Date</span>
                                                <span className="mp__info-value">
                                                    {study?.endDate
                                                        ? new Date(study.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Eligibility Criteria Card */}
                            <div className="mp__card" ref={criteriaRef}>
                                <div className="mp__card-header mp__card-header--clickable" onClick={() => {
    setCriteriaOpen(o => {
        const next = !o;

        if (!o) {
            setTimeout(() => {
                criteriaRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
        }

        return next;
    });
}}>
                                    <div>
                                        <h2 className="mp__card-title">Eligibility Criteria</h2>
                                        <p className="mp__card-sub">
                                            {criteriaExists ? "Criteria set — participants will be filtered" : "No criteria set — open to everyone"}
                                        </p>
                                    </div>
                                    <div className="mp__card-header-right">
                                        {criteriaExists ? (
                                            <span className="mp__criteria-badge">Active</span>
                                        ) : <span className="mp__criteria-badge">Add Criteria Here</span>}
                                        <ChevronDown
                                            size={16}
                                            className={`mp__chevron ${criteriaOpen ? "mp__chevron--open" : ""}`}
                                        />
                                    </div>
                                </div>

                                {criteriaOpen && (
                                    <div className="mp__card-body">
                                        <div className="mp__form">
                                            <div className="mp__row">
                                                <div className="mp__field">
                                                    <label>Min Age</label>
                                                    <input
                                                        type="number"
                                                        value={criteriaForm.ageMin}
                                                        onChange={(e) => setCriteriaForm(p => ({ ...p, ageMin: e.target.value }))}
                                                        placeholder="e.g. 18"
                                                        min={1} max={120}
                                                    />
                                                </div>
                                                <div className="mp__field">
                                                    <label>Max Age</label>
                                                    <input
                                                        type="number"
                                                        value={criteriaForm.ageMax}
                                                        onChange={(e) => setCriteriaForm(p => ({ ...p, ageMax: e.target.value }))}
                                                        placeholder="e.g. 60"
                                                        min={1} max={120}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mp__field">
                                                <label>Gender</label>
                                                <select value={criteriaForm.gender} onChange={(e) => setCriteriaForm(p => ({ ...p, gender: e.target.value }))}>
                                                    {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            </div>

                                            <div className="mp__field">
                                                <label>Country</label>
                                                <input
                                                    value={criteriaForm.country}
                                                    onChange={(e) => setCriteriaForm(p => ({ ...p, country: e.target.value }))}
                                                    placeholder="e.g. DZ, FR, US…"
                                                />
                                            </div>

                                            <div className="mp__field">
                                                <label>Education Level</label>
                                                <select value={criteriaForm.educationLevel} onChange={(e) => setCriteriaForm(p => ({ ...p, educationLevel: e.target.value }))}>
                                                    {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            </div>

                                            {/* Interests */}
                                            <div>
                                                <div className="mp__section-label">Related Interests</div>
                                                <div className="mp__interests">
                                                    {allInterests.length === 0 ? (
                                                        <p className="mp__no-interests">No interests available.</p>
                                                    ) : (
                                                        allInterests.map(interest => {
                                                            const sid = String(interest.interestId);
                                                            const selected = selectedInterests.includes(sid);
                                                            return (
                                                                <button
                                                                    key={sid}
                                                                    type="button"
                                                                    className={`mp__interest-tag ${selected ? "mp__interest-tag--on" : ""}`}
                                                                    onClick={() => toggleInterest(sid)}
                                                                >
                                                                    {interest.name}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>

                                            {criteriaError && (
                                                <div className="mp__error">{criteriaError}</div>
                                            )}

                                            <button
                                                className="mp__save-criteria-btn"
                                                onClick={handleSaveCriteria}
                                                disabled={savingCriteria}
                                            >
                                                {savingCriteria ? <Spinner size={13} /> : <Check size={13} />}
                                                {criteriaExists ? "Update Criteria" : "Save Criteria"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN ── */}
                        <div className="mp__right">
                            <div className="mp__card">
                                <div className="mp__card-header">
                                    <div>
                                        <h2 className="mp__card-title">Phase Status</h2>
                                        <p className="mp__card-sub">Open or close phases for responses</p>
                                    </div>
                                </div>

                                <div className="mp__phases-list">
                                    {phases.length === 0 ? (
                                        <div className="mp__no-phases">
                                            <p>No phases yet. Add phases from the phases page.</p>
                                        </div>
                                    ) : (
                                        phases.map((phase, i) => {
                                            const isActive    = phase.status === "ACTIVE";
                                            const isCompleted = phase.status === "COMPLETED";
                                            const isToggling  = togglingPhase === phase.id;

                                            return (
                                                <div key={phase.id} className="mp__phase-row">
                                                    <div className="mp__phase-left">
                                                        <div className="mp__phase-order">P{i + 1}</div>
                                                        <div className="mp__phase-info">
                                                            <p className="mp__phase-title">
                                                                {phase.title || `Phase ${i + 1}`}
                                                            </p>
                                                            <div className="mp__phase-meta">
                                                                <span className="mp__phase-type">{phase.phaseType}</span>
                                                                <span className="mp__phase-dot">·</span>
                                                                <Users size={11} />
                                                                <span>{phase.maxParticipants} max</span>
                                                                <span className="mp__phase-dot">·</span>
                                                                <DollarSign size={11} />
                                                                <span>{phase.rewardAmount}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mp__phase-right">
                                                        <span className={`mp__phase-status mp__phase-status--${phase.status.toLowerCase()}`}>
                                                            {isActive ? <Unlock size={10} /> : isCompleted ? <Check size={10} /> : <Lock size={10} />}
                                                            {phase.status}
                                                        </span>

                                                        {!isCompleted && (
                                                            <button
                                                                className={`mp__toggle-btn ${isActive ? "mp__toggle-btn--active" : ""}`}
                                                                onClick={() => handleTogglePhase(phase)}
                                                                disabled={isToggling}
                                                                title={isActive ? "Close phase" : "Open phase"}
                                                            >
                                                                {isToggling
                                                                    ? <Spinner size={14} />
                                                                    : isActive
                                                                        ? <ToggleRight size={20} />
                                                                        : <ToggleLeft size={20} />
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Publish Dialog */}
            {showConfirm && (
                <div className="mp__overlay" onClick={() => !publishing && setShowConfirm(false)}>
                    <div className="mp__confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="mp__confirm-icon">
                            <Send size={22} strokeWidth={2} />
                        </div>
                        <h3>Publish Study?</h3>
                        <p>
                            Once published, <strong>{study?.title}</strong> will be visible to eligible participants.
                            {criteriaExists
                                ? " Your eligibility criteria are set."
                                : " No eligibility criteria are set — it will be open to everyone."}
                        </p>

                        {publishError && (
                            <div className="mp__error" style={{ marginBottom: 0 }}>{publishError}</div>
                        )}

                        <div className="mp__confirm-actions">
                            {criteriaExists ? (
                                <button
                                    className="mp__confirm-btn mp__confirm-btn--secondary"
                                    onClick={() => { setShowConfirm(false); setCriteriaOpen(true); }}
                                    disabled={publishing}
                                >
                                    <Pencil size={13} /> Edit Criteria
                                </button>
                            ) : (
                                <button
                                    className="mp__confirm-btn mp__confirm-btn--secondary"
                                    onClick={() => { setShowConfirm(false); setCriteriaOpen(true); }}
                                    disabled={publishing}
                                >
                                    <Pencil size={13} /> Set Criteria
                                </button>
                            )}
                            <button
                                className="mp__confirm-btn mp__confirm-btn--publish"
                                onClick={handlePublish}
                                disabled={publishing}
                            >
                                {publishing ? <Spinner size={13} /> : <Send size={13} />}
                                {publishing ? "Publishing…" : "Publish"}
                            </button>
                        </div>
                        <button
                            className="mp__confirm-close"
                            onClick={() => setShowConfirm(false)}
                            disabled={publishing}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
                        {showNoCriteria && (
    <div
        className="phases__overlay"
        onClick={() => setShowNoCriteria(false)}
    >
        <div
            className="phases__confirm"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="phases__confirm-icon">
                <HelpCircle size={22} />
            </div>

            <h3>No Eligibility Criteria Found</h3>

            <p>
                Before publishing this study, you must create at least one
                eligibility criterion to define who can participate.
            </p>

            <div className="phases__confirm-actions">
                <button
                    className="phases__confirm-btn phases__confirm-btn--secondary"
                    onClick={() => setShowNoCriteria(false)}
                >
                    Cancel
                </button>

                <button
                    className="phases__confirm-btn phases__confirm-btn--publish"
                    onClick={() => {
    setShowNoCriteria(false);
    setCriteriaOpen(true);

    setTimeout(() => {
        criteriaRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, 100);
}}
                >
                    <Pencil size={13} />
                    Add Criteria
                </button>
            </div>

            <button
                className="mp__confirm-close"
                onClick={() => setShowNoCriteria(false)}
            >
                <X size={16} />
            </button>
        </div>
    </div>
)}
        </div>
    );
}