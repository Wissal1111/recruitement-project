import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronDown,
    Trash2,
    Settings,
    ArrowRight,
    Save,
    ChevronRight,
} from "lucide-react";
import "./Phase.css";

const PHASE_TYPES = ["SCREENING", "NORMAL"];
const STATUSES = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"];

const STATUS_COLORS = {
    PENDING:   { bg: "#FFF8E1", color: "#F59E0B" },
    ACTIVE:    { bg: "#E8F5E9", color: "#22C55E" },
    COMPLETED: { bg: "#EEF0FA", color: "#4A4BD7" },
    CANCELLED: { bg: "#FFF0F2", color: "#B3001A" },
};

export default function Phase({ phase, index, onDelete, onUpdate }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [form, setForm] = useState({
        title:           phase.title           || "",
        description:     phase.description     || "",
        phaseType:       phase.phaseType       || "NORMAL",
        rewardAmount:    phase.rewardAmount     || "",
        maxParticipants: phase.maxParticipants  || "",
        status:          phase.status          || "PENDING",
    });

    const handleChange = (e) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        onUpdate(updated);
    };

    const statusStyle = STATUS_COLORS[form.status] || STATUS_COLORS.PENDING;

    return (
        <div className={`phase ${expanded ? "phase--expanded" : ""}`}>

            {/* Row — always visible */}
            <div className="phase__row" onClick={() => setExpanded((v) => !v)}>
                <div className={`phase__badge ${expanded ? "phase__badge--active" : ""}`}>
                    {String(index + 1).padStart(2, "0")}
                </div>

                <div className="phase__content">
                    <p className="phase__name">
                        {form.title || "Untitled Phase"}
                    </p>
                    <span className="phase__meta">
                        {form.phaseType}
                        {form.maxParticipants ? ` • ${form.maxParticipants} participants` : ""}
                        {form.rewardAmount ? ` • $${form.rewardAmount} reward` : ""}
                    </span>
                </div>

                <div className="phase__row-right">
                    {/* Status badge */}
                    <span
                        className="phase__status-badge"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                        {form.status}
                    </span>

                    {/* Go to questions */}
                    <button
                        className="phase__questions-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recruit/create/phases/${phase.id}/questions`);
                        }}
                        title="Build Questions"
                    >
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>

                    <button
                        className="phase__icon-btn phase__icon-btn--danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        title="Delete"
                    >
                        <Trash2 size={15} strokeWidth={2} />
                    </button>

                    <button
                        className="phase__icon-btn phase__expand-btn"
                        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                        title="Expand"
                    >
                        <ChevronDown
                            size={16}
                            strokeWidth={2.5}
                            style={{
                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s",
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Expanded form */}
            {expanded && (
                <div className="phase__form" onClick={(e) => e.stopPropagation()}>
                    <hr className="phase__divider" />

                    <div className="phase__fields">
                        {/* Title */}
                        <div className="phase__field phase__field--full">
                            <label className="phase__label">Title</label>
                            <input
                                className="phase__input"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Phase title..."
                            />
                        </div>

                        {/* Description */}
                        <div className="phase__field phase__field--full">
                            <label className="phase__label">Description</label>
                            <textarea
                                className="phase__textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Briefly describe this phase..."
                            />
                        </div>

                        {/* Phase Type */}
                        <div className="phase__field">
                            <label className="phase__label">Phase Type</label>
                            <select className="phase__select" name="phaseType" value={form.phaseType} onChange={handleChange}>
                                {PHASE_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="phase__field">
                            <label className="phase__label">Status</label>
                            <select className="phase__select" name="status" value={form.status} onChange={handleChange}>
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reward Amount */}
                        <div className="phase__field">
                            <label className="phase__label">Reward Amount</label>
                            <div className="phase__input-prefix-wrap">
                                <span className="phase__input-prefix">$</span>
                                <input
                                    className="phase__input phase__input--prefixed"
                                    name="rewardAmount"
                                    value={form.rewardAmount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Max Participants */}
                        <div className="phase__field">
                            <label className="phase__label">Max Participants</label>
                            <input
                                className="phase__input"
                                name="maxParticipants"
                                type="number"
                                value={form.maxParticipants}
                                onChange={handleChange}
                                placeholder="e.g. 100"
                            />
                        </div>

                        {/* Save Changes */}
                        <div className="phase__field phase__field--full">
                            <button
                                className="phase__save-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(form);
                                    setExpanded(false);
                                }}
                            >
                                <Save size={13} strokeWidth={2.5} />
                                Save Changes
                            </button>
                        </div>

                        {/* Go to questions CTA */}
                        <div className="phase__field phase__field--full">
                            <button
                                className="phase__goto-questions"
                                onClick={() => navigate(`/recruit/create/phases/${phase.id}/questions`)}
                            >
                                Build Questions for this Phase
                                <ArrowRight size={13} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}