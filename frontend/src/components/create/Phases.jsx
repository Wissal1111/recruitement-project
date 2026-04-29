import {
    PlusCircle, Copy, Monitor, CalendarDays,
    DollarSign, HelpCircle, Pencil, Clock
} from "lucide-react";
import Phase from "./Phase";
import "./Phases.css";

export default function Phases({ phases, onAdd, onDelete, onUpdate, onBack, study }) {
    const totalQuestions = phases.reduce((acc, p) => acc + (p.questions?.length || 0), 0);

    const daysLeft = study?.deadline
        ? Math.ceil((new Date(study.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const deadlineUrgent = daysLeft !== null && daysLeft <= 30;

    const formatDeadline = (date) => {
        if (!date) return "--";
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="phases">

            {/* Survey context banner */}
            <div className="phases__banner">
                <div className="phases__banner-icon">
                    <Monitor size={20} strokeWidth={2} color="rgba(255,255,255,0.9)" />
                </div>
                <div className="phases__banner-text">
                    <p className="phases__banner-eyebrow">Currently editing</p>
                    <p className="phases__banner-title">{study?.title || "Untitled Study"}</p>
                    <p className="phases__banner-meta">
                        {study?.category || "No category"}
                        &nbsp;·&nbsp;
                        {study?.deadline ? `Deadline ${formatDeadline(study.deadline)}` : "No deadline set"}
                    </p>
                </div>
                <span className="phases__banner-status">{study?.studyStatus || "DRAFT"}</span>
                <button className="phases__banner-btn" onClick={onBack}>
                    <Pencil size={12} strokeWidth={2.5} />
                    Manage Info
                </button>
            </div>

            {/* Header */}
            <div className="phases__header">
                <h1 className="phases__title">Phase Management</h1>
                <p className="phases__subtitle">
                    Architect the lifecycle of your editorial survey experience.
                </p>
            </div>

            {/* Phase list */}
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
                    <PlusCircle size={16} strokeWidth={2.5} />
                    ADD NEW PHASE
                </button>
            </div>

            {/* Stats grid */}
            <div className="phases__stats">

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <HelpCircle size={14} strokeWidth={2} color="var(--blue-text)" />
                        Total Questions
                    </div>
                    <p className="phases__stat-value">
                        {totalQuestions > 0 ? totalQuestions : "--"}
                        <span> questions</span>
                    </p>
                    <p className="phases__stat-sub">Across {phases.length} phase{phases.length !== 1 ? "s" : ""}</p>
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <Monitor size={14} strokeWidth={2} color="var(--blue-text)" />
                        Study Category
                    </div>
                    <p className="phases__stat-value" style={{ fontSize: 20 }}>
                        {study?.category || "--"}
                    </p>
                    {study?.studyCategory && (
                        <span className="phases__category-badge">{study.studyCategory}</span>
                    )}
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <CalendarDays size={14} strokeWidth={2} color="var(--blue-text)" />
                        Deadline
                    </div>
                    <p className="phases__stat-value" style={{ fontSize: 20 }}>
                        {study?.deadline ? formatDeadline(study.deadline) : "--"}
                    </p>
                    {daysLeft !== null && (
                        <span className={`phases__deadline-pill ${deadlineUrgent ? "phases__deadline-pill--urgent" : ""}`}>
                            {deadlineUrgent ? "⚠ " : ""}{daysLeft} days left
                        </span>
                    )}
                </div>

                <div className="phases__stat">
                    <div className="phases__stat-label">
                        <DollarSign size={14} strokeWidth={2} color="var(--blue-text)" />
                        Total Budget
                    </div>
                    <p className="phases__stat-value">
                        {study?.totalBudget ? `$${study.totalBudget}` : "--"}
                        <span> allocated</span>
                    </p>
                    <div className="phases__budget-bar-wrap">
                        <div className="phases__budget-bar-bg">
                            <div className="phases__budget-bar-fill" style={{ width: "40%" }} />
                        </div>
                        <div className="phases__budget-bar-labels">
                            <span>$0 used</span>
                            <span>${study?.totalBudget || 0} left</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Manage study info */}
            <button className="phases__manage-btn" onClick={onBack}>
                <Pencil size={14} strokeWidth={2.5} />
                Manage Study Info
            </button>

        </div>
    );
}