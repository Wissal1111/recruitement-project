import { useState } from "react";
import {
    PlusCircle, Monitor, CalendarDays,
    Coins, HelpCircle, Pencil, Send, X, AlertTriangle,
    ShoppingCart, XCircle
} from "lucide-react";
import Phase from "./Phase";
import "./Phases.css";
import { useNavigate } from "react-router-dom";
import { getCriteria } from "../../api/RecruitmentApi";
import { publishStudy, updateStudy } from "../../api/StudyApi";

function extractError(err) {
    const data = err?.response?.data;
    if (data) {
        if (typeof data === "string" && data.trim()) return data.trim();
        if (data.message) return data.message;
        if (data.error)   return data.error;
    }
    if (err?.message) return err.message;
    return "Something went wrong. Please try again.";
}

function isInsufficientPoints(err) {
    const msg = extractError(err).toLowerCase();
    return msg.includes("insufficient") ||
           msg.includes("not enough") ||
           msg.includes("point allocation failed") ||
           msg.includes("availablepoints") ||
           msg.includes("balance");
}

export default function Phases({ study, phases, onAdd, onDelete, onUpdate, onPublished }) {
    const navigate = useNavigate();

    const [showConfirm,       setShowConfirm]       = useState(false);
    const [showCancel,        setShowCancel]         = useState(false);
    const [criteriaExists,    setCriteriaExists]     = useState(null);
    const [checking,          setChecking]           = useState(false);
    const [publishing,        setPublishing]         = useState(false);
    const [cancelling,        setCancelling]         = useState(false);
    const [publishError,      setPublishError]       = useState(null);
    const [cancelError,       setCancelError]        = useState(null);
    const [insufficientPoints, setInsufficientPoints] = useState(false);

    const isSinglePhase  = phases.length === 1 && study?.isMultiPhase === false;
    const totalQuestions = phases.reduce((acc, p) => acc + (p.questions?.length || 0), 0);
    const hasPhases      = phases.length > 0;
    const hasQuestions   = totalQuestions > 0;

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
    const isCancelled = study?.studyStatus === "CANCELLED";
    const canPublish  = !isPublished && !isCompleted && !isCancelled && hasPhases && hasQuestions;
    const canCancel   = isPublished && !isCompleted && !isCancelled;

    const handlePublishClick = async () => {
        setPublishError(null);
        setInsufficientPoints(false);
        setChecking(true);
        try {
            const existing = await getCriteria(study.studyId).catch(() => null);
            setCriteriaExists(!!existing);
        } catch {
            setCriteriaExists(false);
        } finally {
            setChecking(false);
            setShowConfirm(true);
        }
    };

    const handleConfirmPublish = async () => {
        setPublishing(true);
        setPublishError(null);
        setInsufficientPoints(false);
        try {
            await publishStudy(study.studyId);
            onPublished();
            setShowConfirm(false);
        } catch (err) {
            if (isInsufficientPoints(err)) {
                setInsufficientPoints(true);
            } else {
                setPublishError(extractError(err));
            }
        } finally {
            setPublishing(false);
        }
    };

    const handleConfirmCancel = async () => {
        setCancelling(true);
        setCancelError(null);
        try {
            await updateStudy(study.studyId, { studyStatus: "CANCELLED" });
            onPublished(); // refresh parent
            setShowCancel(false);
        } catch (err) {
            setCancelError(extractError(err));
        } finally {
            setCancelling(false);
        }
    };

    const handleEditCriteria = () => {
        setShowConfirm(false);
        navigate(`/recruit/study/${study.studyId}/manage`);
    };

    const publishBlockReason = !hasPhases
        ? "Add at least one phase before publishing."
        : !hasQuestions
            ? "Add at least one question to a phase before publishing."
            : null;

    return (
        <div className="phases">

            {/* Banner */}
            <div className="phases__banner">
                <div className="phases__banner-icon">
                    <Monitor size={20} strokeWidth={2} />
                </div>
                <div className="phases__banner-text">
                    <p className="phases__banner-eyebrow">Currently editing</p>
                    <p className="phases__banner-title">{study?.title || "Untitled Study"}</p>
                    <p className="phases__banner-meta">
                        {study?.studyCategory || "No category"}
                        &nbsp;·&nbsp;
                        {endDate ? `Deadline ${formatDate(endDate)}` : "No deadline set"}
                    </p>
                </div>
                <span className="phases__banner-status">{study?.studyStatus || "DRAFT"}</span>
                <button
                    className="phases__banner-btn"
                    onClick={() => navigate(`/recruit/study/${study.studyId}/manage`)}
                >
                    <Pencil size={12} /> Manage Info
                </button>
            </div>

            {/* Header */}
            <div className="phases__header">
                <div>
                    <h1 className="phases__title">Phase Management</h1>
                    <p className="phases__subtitle">Architect the lifecycle of your survey experience.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        {/* Cancel button — only when published */}
                        {canCancel && (
                            <button
                                className="phases__cancel-btn"
                                onClick={() => { setCancelError(null); setShowCancel(true); }}
                            >
                                <XCircle size={14} strokeWidth={2.5} />
                                Cancel Study
                            </button>
                        )}

                        {!isPublished && !isCompleted && !isCancelled && (
                            <button
                                className="phases__publish-btn"
                                onClick={handlePublishClick}
                                disabled={checking || !canPublish}
                                style={{ opacity: canPublish ? 1 : 0.5, cursor: canPublish ? "pointer" : "not-allowed" }}
                            >
                                {checking
                                    ? <span className="phases__publish-spinner" />
                                    : <Send size={14} strokeWidth={2.5} />
                                }
                                {checking ? "Checking…" : "Publish Study"}
                            </button>
                        )}
                    </div>

                    {publishBlockReason && !isPublished && !isCompleted && !isCancelled && (
                        <p style={{ fontSize: 12, color: "#EF4444", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                            <AlertTriangle size={12} /> {publishBlockReason}
                        </p>
                    )}

                    {isPublished && (
                        <div className="phases__published-badge">✓ Published</div>
                    )}
                    {isCancelled && (
                        <div className="phases__cancelled-badge">✕ Cancelled</div>
                    )}
                </div>
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
                        <PlusCircle size={16} /> ADD NEW PHASE
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="phases__stats">
                <div className="phases__stat">
                    <div className="phases__stat-label"><HelpCircle size={14} />Total Questions</div>
                    <p className="phases__stat-value">{totalQuestions || "--"}<span> questions</span></p>
                    <p className="phases__stat-sub">Across {phases.length} phase{phases.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="phases__stat">
                    <div className="phases__stat-label"><Monitor size={14} />Study Category</div>
                    <p className="phases__stat-value">{study?.studyCategory || "--"}</p>
                </div>
                <div className="phases__stat">
                    <div className="phases__stat-label"><CalendarDays size={14} />Deadline</div>
                    <p className="phases__stat-value">{endDate ? formatDate(endDate) : "--"}</p>
                    {daysLeft !== null && (
                        <span className={`phases__deadline-pill ${deadlineUrgent ? "phases__deadline-pill--urgent" : ""}`}>
                            {deadlineUrgent ? "⚠ " : ""}{daysLeft} days left
                        </span>
                    )}
                </div>
                <div className="phases__stat">
                    <div className="phases__stat-label"><Coins size={14} />Total Points</div>
                    <p className="phases__stat-value">{budget}<span> allocated</span></p>
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
                <Pencil size={14} /> Manage Study Info
            </button>

            {/* ── Confirm Publish Dialog ── */}
            {showConfirm && (
                <div className="phases__overlay" onClick={() => !publishing && setShowConfirm(false)}>
                    <div className="phases__confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="phases__confirm-icon">
                            <Send size={22} strokeWidth={2} />
                        </div>
                        <h3>Publish Study?</h3>
                        <p>
                            <strong>{study?.title}</strong> will be visible to{" "}
                            {criteriaExists
                                ? "eligible participants based on your criteria."
                                : "all participants — no eligibility criteria set."}
                        </p>

                        {!criteriaExists && (
                            <div style={{
                                background: "#FFFBEB", border: "1px solid #FDE68A",
                                borderRadius: 8, padding: "10px 14px", fontSize: 13,
                                color: "#92400E", marginBottom: 4,
                                display: "flex", alignItems: "flex-start", gap: 8,
                            }}>
                                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                                <span>Without criteria, anyone can apply to this study. You can optionally add criteria before publishing.</span>
                            </div>
                        )}

                        {/* Insufficient points error */}
                        {insufficientPoints && (
                            <div style={{
                                background: "#FEF2F2", border: "1px solid #FECACA",
                                borderRadius: 8, padding: "12px 14px", fontSize: 13,
                                color: "#B91C1C", marginBottom: 4,
                                display: "flex", flexDirection: "column", gap: 8
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                                    <AlertTriangle size={14} />
                                    Insufficient points to publish this study
                                </div>
                                <p style={{ margin: 0, fontSize: 12 }}>
                                    This study requires <strong>{budget} pts</strong> to publish. Your wallet doesn't have enough available points.
                                </p>
                                <button
                                    onClick={() => { setShowConfirm(false); navigate("/home/wallet"); }}
                                    style={{
                                        background: "var(--linear-blue)", color: "#fff",
                                        border: "none", borderRadius: 8, padding: "8px 14px",
                                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                                        display: "flex", alignItems: "center", gap: 6,
                                        alignSelf: "flex-start"
                                    }}
                                >
                                    <ShoppingCart size={13} /> Buy Points
                                </button>
                            </div>
                        )}

                        {/* Generic error */}
                        {publishError && !insufficientPoints && (
                            <div className="phases__confirm-error" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                {publishError}
                            </div>
                        )}

                        <div className="phases__confirm-actions">
                            <button
                                className="phases__confirm-btn phases__confirm-btn--secondary"
                                onClick={handleEditCriteria}
                                disabled={publishing}
                            >
                                <Pencil size={13} />
                                {criteriaExists ? "Edit Criteria" : "Add Criteria"}
                            </button>
                            {!insufficientPoints && (
                                <button
                                    className="phases__confirm-btn phases__confirm-btn--publish"
                                    onClick={handleConfirmPublish}
                                    disabled={publishing}
                                >
                                    {publishing
                                        ? <span className="phases__publish-spinner phases__publish-spinner--sm" />
                                        : <Send size={13} />
                                    }
                                    {publishing ? "Publishing…" : "Publish Anyway"}
                                </button>
                            )}
                        </div>
                        <button
                            className="mp__confirm-close"
                            onClick={() => { setShowConfirm(false); setInsufficientPoints(false); setPublishError(null); }}
                            disabled={publishing}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Confirm Cancel Dialog ── */}
            {showCancel && (
                <div className="phases__overlay" onClick={() => !cancelling && setShowCancel(false)}>
                    <div className="phases__confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="phases__confirm-icon" style={{ background: "#FEF2F2" }}>
                            <XCircle size={22} strokeWidth={2} color="#DC2626" />
                        </div>
                        <h3 style={{ color: "var(--title)" }}>Cancel Study?</h3>
                        <p>
                            Are you sure you want to cancel <strong>{study?.title}</strong>?
                            This will stop all recruitment and release allocated points back to your wallet.
                        </p>

                        <div style={{
                            background: "#FFF7ED", border: "1px solid #FED7AA",
                            borderRadius: 8, padding: "10px 14px", fontSize: 13,
                            color: "#92400E", marginBottom: 4,
                            display: "flex", alignItems: "flex-start", gap: 8,
                        }}>
                            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>This action cannot be undone. Participants who have already applied will be notified.</span>
                        </div>

                        {cancelError && (
                            <div className="phases__confirm-error" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                {cancelError}
                            </div>
                        )}

                        <div className="phases__confirm-actions">
                            <button
                                className="phases__confirm-btn phases__confirm-btn--secondary"
                                onClick={() => setShowCancel(false)}
                                disabled={cancelling}
                            >
                                Keep Study
                            </button>
                            <button
                                className="phases__confirm-btn"
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                                style={{ background: "#DC2626", color: "#fff" }}
                            >
                                {cancelling
                                    ? <span className="phases__publish-spinner phases__publish-spinner--sm" />
                                    : <XCircle size={13} />
                                }
                                {cancelling ? "Cancelling…" : "Cancel Study"}
                            </button>
                        </div>
                        <button
                            className="mp__confirm-close"
                            onClick={() => setShowCancel(false)}
                            disabled={cancelling}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}