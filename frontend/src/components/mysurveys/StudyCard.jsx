import { useState } from "react";
import { Monitor, Users, FlaskConical, MessageSquare, HelpCircle, Pencil, Trash2, RefreshCw } from "lucide-react";
import "./StudyCard.css";

const STATUS_COLORS = {
    ACTIVE:     { bg: "#E8F5E9", color: "#22C55E" },
    PUBLISHED:  { bg: "#EEF9FF", color: "#0EA5E9" },
    COMPLETED:  { bg: "#EEF0FA", color: "#4A4BD7" },
    ARCHIVED:   { bg: "#FFF8E1", color: "#F59E0B" },
    DRAFT:      { bg: "#F1F2F8", color: "#9192B0" },
};

const CATEGORY_ICONS = {
    USABILITY:  { icon: Monitor,       bg: "rgba(74,75,215,0.1)",  color: "#4A4BD7" },
    SURVEY:     { icon: HelpCircle,    bg: "rgba(14,165,233,0.1)", color: "#0EA5E9" },
    EXPERIMENT: { icon: FlaskConical,  bg: "rgba(179,0,26,0.08)",  color: "#B3001A" },
    INTERVIEW:  { icon: MessageSquare, bg: "rgba(34,197,94,0.1)",  color: "#22C55E" },
    OTHER:      { icon: Users,         bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
};

const STATUSES = ["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"];

export default function StudyCard({ study, onEdit, onDelete, onStatusChange }) {
    const [statusOpen, setStatusOpen] = useState(false);

    const statusStyle  = STATUS_COLORS[study.studyStatus]    || STATUS_COLORS.DRAFT;
    const categoryConf = CATEGORY_ICONS[study.studyCategory] || CATEGORY_ICONS.OTHER;
    const CategoryIcon = categoryConf.icon;

    const budgetNum = parseFloat(study.totalBudget) || 0;
    const spentNum  = parseFloat(study.spent)       || 0;
    const spentPct  = budgetNum > 0 ? Math.min((spentNum / budgetNum) * 100, 100) : 0;

    const formatDate  = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--";
    const formatMoney = (n) => `$${parseFloat(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    const nextStatuses = STATUSES.filter((s) => s !== study.studyStatus);

    return (
        <div className="sc" onClick={onEdit}>

            {/* Title cell */}
            <div className="sc__title-cell">
                <div className="sc__icon" style={{ background: categoryConf.bg }}>
                    <CategoryIcon size={16} strokeWidth={2} color={categoryConf.color} />
                </div>
                <div>
                    <p className="sc__title">{study.title}</p>
                    <p className="sc__sub">{study.studyCategory}&nbsp;·&nbsp;Ends {formatDate(study.endDate)}</p>
                </div>
            </div>

            {/* Status cell */}
            <div className="sc__status-cell">
                <span className="sc__status-chip" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    <span className="sc__status-dot" style={{ background: statusStyle.color }} />
                    {study.studyStatus}
                </span>
            </div>

            {/* Phases cell */}
            <div className="sc__phases-cell">
                {study.phases?.length ?? 0} phase{study.phases?.length !== 1 ? "s" : ""}
            </div>

            {/* Budget cell */}
            <div className="sc__budget-cell">
                <p className="sc__budget-amount">{formatMoney(study.totalBudget)}</p>
                <div className="sc__bar-bg">
                    <div className="sc__bar-fill" style={{ width: `${spentPct}%` }} />
                </div>
                <p className="sc__budget-spent">{Math.round(spentPct)}% SPENT</p>
            </div>

            {/* Actions cell */}
            <div className="sc__actions" onClick={(e) => e.stopPropagation()}>

                {/* Change status */}
                <div className="sc__action-wrap">
                    <button
                        className={`sc__action-btn ${statusOpen ? "sc__action-btn--active" : ""}`}
                        title="Change Status"
                        onClick={(e) => { e.stopPropagation(); setStatusOpen((v) => !v); }}
                    >
                        <RefreshCw size={13} strokeWidth={2} />
                    </button>
                    {statusOpen && (
                        <div className="sc__status-dropdown">
                            {nextStatuses.map((s) => (
                                <div
                                    key={s}
                                    className="sc__status-option"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStatusChange(study.studyId, s);
                                        setStatusOpen(false);
                                    }}
                                >
                                    <span className="sc__status-dot" style={{ background: STATUS_COLORS[s]?.color }} />
                                    <span style={{ color: STATUS_COLORS[s]?.color, fontWeight: 700 }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className="sc__action-btn"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                >
                    <Pencil size={13} strokeWidth={2} />
                </button>

                <button
                    className="sc__action-btn sc__action-btn--danger"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                    <Trash2 size={13} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}