import { useState } from "react";
import {
    PlusCircle, Monitor, CalendarDays,
    Coins, HelpCircle, Pencil, Send, Check,X
} from "lucide-react";
import Phase from "./Phase";
import "./Phases.css";
import { useNavigate } from "react-router-dom";
import { getCriteria } from "../../api/RecruitmentApi";
import { publishStudy } from "../../api/StudyApi";

export default function Phases({ study, phases, onAdd, onDelete, onUpdate, onPublished }) {
    const navigate = useNavigate();

    // Confirm dialog state
    const [showConfirm,    setShowConfirm]    = useState(false);
    const [criteriaExists, setCriteriaExists] = useState(null); // null = unknown
    const [checking,       setChecking]       = useState(false);
    const [publishing,     setPublishing]     = useState(false);
    const [publishError,   setPublishError]   = useState(null);
    const [showNoCriteria, setShowNoCriteria] = useState(false);
    const isSinglePhase = phases.length === 1 && study?.isMultiPhase === false;

    const totalQuestions = phases.reduce(
        (acc, p) => acc + (p.questions?.length || 0),
        0
    );

    const endDate        = study?.endDate;
    const daysLeft       = endDate
        ? Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
    const deadlineUrgent = daysLeft !== null && daysLeft <= 30;

    const formatDate = (date) => {
        if (!date) return "--";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    };

    const budget = study?.totalBudget?.$numberDecimal
        ? Number(study.totalBudget.$numberDecimal)
        : study?.totalBudget || 0;

    const isPublished = study?.studyStatus === "PUBLISHED";
    const isCompleted = study?.studyStatus === "COMPLETED";
    const canPublish  = !isPublished && !isCompleted && phases.length > 0;

    // ── Handle "Publish Study" click ──────────────────────────────
    const handlePublishClick = async () => {
    setPublishError(null);
    setChecking(true);

    try {
        const existing = await getCriteria(study.studyId).catch(() => null);
        const hasCriteria = !!existing;

        setCriteriaExists(hasCriteria);

        if (!hasCriteria) {
            setShowNoCriteria(true);
        } else {
            setShowConfirm(true);
        }
    } catch {
        setShowNoCriteria(true);
    } finally {
        setChecking(false);
    }
};

    const handleConfirmPublish = async () => {
        setPublishing(true);
        setPublishError(null);
        try {
            await publishStudy(study.studyId);
            onPublished();
            setShowConfirm(false);
        } catch (err) {
            setPublishError(err?.message || "Failed to publish study.");
        } finally {
            setPublishing(false);
        }
    };

    const handleEditCriteria = () => {
        setShowConfirm(false);
        navigate(`/recruit/study/${study.studyId}/manage`);
    };

    return (
        <div className="phases">

            {/* Banner */}
            <div className="phases__banner">
                <div className="phases__banner-icon">
                    <Monitor size={20} strokeWidth={2} />
                </div>

                <div className="phases__banner-text">
                    <p className="phases__banner-eyebrow">Currently editing</p>
                    <p className="phases__banner-title">
                        {study?.title || "Untitled Study"}
                    </p>
                    <p className="phases__banner-meta">
                        {study?.studyCategory || "No category"}
                        &nbsp;·&nbsp;
                        {endDate ? `Deadline ${formatDate(endDate)}` : "No deadline set"}
                    </p>
                </div>

                <span className="phases__banner-status">
                    {study?.studyStatus || "DRAFT"}
                </span>

                <button
                    className="phases__banner-btn"
                    onClick={() => navigate(`/recruit/study/${study.studyId}/manage`)}
                >
                    <Pencil size={12} />
                    Manage Info
                </button>
            </div>

            {/* Header */}
            <div className="phases__header">
                <div>
                    <h1 className="phases__title">Phase Management</h1>
                    <p className="phases__subtitle">
                        Architect the lifecycle of your survey experience.
                    </p>
                </div>

                {canPublish && (
                    <button
                        className="phases__publish-btn"
                        onClick={handlePublishClick}
                        disabled={checking}
                    >
                        {checking
                            ? <span className="phases__publish-spinner" />
                            : <Send size={14} strokeWidth={2.5} />
                        }
                        {checking ? "Checking…" : "Publish Study"}
                    </button>
                )}

                {isPublished && (
                    <div className="phases__published-badge">
                        ✓ Published
                    </div>
                )}
            </div>

            {/* Phases list */}
            <div className="phases__list">
                {phases.map((phase, i) => (
                    <Phase
                        key={phase.id}
                        phase={phase}
                        index={i}
                        onDelete={() => onDelete(phase.id)}
                        onUpdate={(data) => onUpdate(phase.id, data)}
                    />
                ))}

                {!isSinglePhase && (
    <button className="phases__add-btn" onClick={onAdd}>
        <PlusCircle size={16} />
        ADD NEW PHASE
    </button>
)}
            </div>

            {/* Stats */}
            <div className="phases__stats">
                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <HelpCircle size={14} />
                        Total Questions
                    </div>
                    <p className="phases__stat-value">
                        {totalQuestions || "--"}
                        <span> questions</span>
                    </p>
                    <p className="phases__stat-sub">
                        Across {phases.length} phase{phases.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <Monitor size={14} />
                        Study Category
                    </div>
                    <p className="phases__stat-value">
                        {study?.studyCategory || "--"}
                    </p>
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <CalendarDays size={14} />
                        Deadline
                    </div>
                    <p className="phases__stat-value">
                        {endDate ? formatDate(endDate) : "--"}
                    </p>
                    {daysLeft !== null && (
                        <span className={`phases__deadline-pill ${deadlineUrgent ? "phases__deadline-pill--urgent" : ""}`}>
                            {deadlineUrgent ? "⚠ " : ""}
                            {daysLeft} days left
                        </span>
                    )}
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <Coins size={14} />
                        Total Points
                    </div>
                    <p className="phases__stat-value">
                        {budget}
                        <span> allocated</span>
                    </p>
                    <div className="phases__budget-bar-wrap">
                        <div className="phases__budget-bar-bg">
                            <div className="phases__budget-bar-fill" style={{ width: "40%" }} />
                        </div>
                        <div className="phases__budget-bar-labels">
                            <span>0 used</span>
                            <span>{budget} left</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className="phases__manage-btn"
                onClick={() => navigate(`/recruit/study/${study.studyId}/manage`)}
            >
                <Pencil size={14} />
                Manage Study Info
            </button>

            {/* ── Confirm Publish Dialog (criteria exists) ── */}
            {showConfirm && (
                <div className="phases__overlay" onClick={() => !publishing && setShowConfirm(false)}>
                    <div className="phases__confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="phases__confirm-icon">
                            <Send size={22} strokeWidth={2} />
                        </div>
                        <h3>Publish Study?</h3>
                        <p>
                            <strong>{study?.title}</strong> will be visible to eligible participants.
                            Your eligibility criteria are set.
                        </p>

                        {publishError && (
                            <div className="phases__confirm-error">{publishError}</div>
                        )}

                        <div className="phases__confirm-actions">
                            <button
                                className="phases__confirm-btn phases__confirm-btn--secondary"
                                onClick={handleEditCriteria}
                                disabled={publishing}
                            >
                                <Pencil size={13} /> Edit Criteria
                            </button>
                            <button
                                className="phases__confirm-btn phases__confirm-btn--publish"
                                onClick={handleConfirmPublish}
                                disabled={publishing}
                            >
                                {publishing
                                    ? <span className="phases__publish-spinner phases__publish-spinner--sm" />
                                    : <Send size={13} />
                                }
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
                    onClick={() =>
                        navigate(`/recruit/study/${study.studyId}/manage`)
                    }
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