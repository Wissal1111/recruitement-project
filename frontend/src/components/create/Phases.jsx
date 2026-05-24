import {
    PlusCircle, Copy, Monitor, CalendarDays,
    DollarSign, HelpCircle, Pencil
} from "lucide-react";
import Phase from "./Phase";
import "./Phases.css";
import { useNavigate } from "react-router-dom";

export default function Phases({
    study,
    phases,
    onAdd,
    onDelete,
    onUpdate
}) {
    const navigate=useNavigate();
    const totalQuestions = phases.reduce(
        (acc, p) => acc + (p.questions?.length || 0),
        0
    );

    // ✅ FIX: use endDate instead of deadline
    const endDate = study?.endDate;

    const daysLeft = endDate
        ? Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const deadlineUrgent = daysLeft !== null && daysLeft <= 30;

    const formatDate = (date) => {
        if (!date) return "--";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // 💰 FIX Decimal budget safely
    const budget = study?.totalBudget?.$numberDecimal
        ? Number(study.totalBudget.$numberDecimal)
        : study?.totalBudget || 0;

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
                        {endDate
                            ? `Deadline ${formatDate(endDate)}`
                            : "No deadline set"}
                    </p>
                </div>

                <span className="phases__banner-status">
                    {study?.studyStatus || "DRAFT"}
                </span>

                <button className="phases__banner-btn" onClick={()=>navigate(`/recruit/create/${study.studyId}`)}>
                    <Pencil size={12} />
                    Manage Info
                </button>
            </div>

            {/* Header */}
            <div className="phases__header">
                <h1 className="phases__title">Phase Management</h1>
                <p className="phases__subtitle">
                    Architect the lifecycle of your survey experience.
                </p>
            </div>

            {/* Phases */}
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

                <button className="phases__add-btn" onClick={onAdd}>
                    <PlusCircle size={16} />
                    ADD NEW PHASE
                </button>
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
                        <span className={`phases__deadline-pill ${
                            deadlineUrgent ? "phases__deadline-pill--urgent" : ""
                        }`}>
                            {deadlineUrgent ? "⚠ " : ""}
                            {daysLeft} days left
                        </span>
                    )}
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <DollarSign size={14} />
                        Total Budget
                    </div>

                    <p className="phases__stat-value">
                        ${budget}
                        <span> allocated</span>
                    </p>

                    <div className="phases__budget-bar-wrap">
                        <div className="phases__budget-bar-bg">
                            <div className="phases__budget-bar-fill" style={{ width: "40%" }} />
                        </div>
                        <div className="phases__budget-bar-labels">
                            <span>$0 used</span>
                            <span>${budget} left</span>
                        </div>
                    </div>
                </div>

            </div>

            <button className="phases__manage-btn" onClick={()=>navigate(`/recruit/create/${study.studyId}`)}>
                <Pencil size={14} />
                Manage Study Info
            </button>

        </div>
    );
}