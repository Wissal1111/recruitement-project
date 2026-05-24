import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getMyParticipations, completeParticipation } from "../../api/RecruitmentApi";
import { Activity, CheckCircle2, XCircle, Trophy } from "lucide-react";

const STATUS_MAP = {
    ACTIVE:        { bg: "#EFF6FF", text: "#1D4ED8", label: "Active", icon: Activity },
    COMPLETED:     { bg: "#F0FDF4", text: "#15803D", label: "Completed", icon: CheckCircle2 },
    DROPPED:       { bg: "#FEF2F2", text: "#B91C1C", label: "Dropped", icon: XCircle },
    DISQUALIFIED:  { bg: "#FFF7ED", text: "#C2410C", label: "Disqualified", icon: XCircle },
};

export default function MyParticipations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        getMyParticipations()
            .then(res => setParticipations(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleComplete = async (id) => {
        setActionLoading(p => ({ ...p, [id]: true }));
        try {
            await completeParticipation(id);
            setParticipations(p => p.map(part =>
                part.participationId === id ? { ...part, status: "COMPLETED" } : part
            ));
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(p => ({ ...p, [id]: false }));
        }
    };

    const filtered = filter === "ALL" ? participations : participations.filter(p => p.status === filter);
    const active = participations.filter(p => p.status === "ACTIVE").length;
    const completed = participations.filter(p => p.status === "COMPLETED").length;

    return (
        <div className="dashboard">
            <TopNavBar page="home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="activity" part="home" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <Activity size={20} color="var(--blue-text)" /> My Participations
                    </h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>Track your study participation progress</p>
                </div>

                {/* Summary Cards */}
                {participations.length > 0 && (
                    <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                        {[
                            { label: "Active", value: active, bg: "#EFF6FF", color: "#1D4ED8", icon: Activity },
                            { label: "Completed", value: completed, bg: "#F0FDF4", color: "#15803D", icon: Trophy },
                            { label: "Total", value: participations.length, bg: "var(--background-blue)", color: "var(--blue-text)", icon: CheckCircle2 },
                        ].map(({ label, value, bg, color, icon: Icon }) => (
                            <div key={label} style={{
                                background: "#fff", borderRadius: "var(--medium-radius)",
                                padding: "16px 20px", border: "1px solid #E8ECF4",
                                display: "flex", alignItems: "center", gap: 14, minWidth: 140,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, background: bg,
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Icon size={18} color={color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--title)" }}>{value}</div>
                                    <div style={{ fontSize: 12, color: "var(--content)" }}>{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                {participations.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                        {["ALL", "ACTIVE", "COMPLETED", "DROPPED"].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                background: filter === f ? "var(--linear-blue)" : "#fff",
                                color: filter === f ? "#fff" : "var(--content)",
                                border: `1.5px solid ${filter === f ? "transparent" : "#E8ECF4"}`,
                                borderRadius: 8, padding: "7px 16px", cursor: "pointer",
                                fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                            }}>
                                {f}
                            </button>
                        ))}
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {filtered.map(part => (
                            <ParticipationCard
                                key={part.participationId}
                                part={part}
                                onComplete={() => handleComplete(part.participationId)}
                                loading={actionLoading[part.participationId]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ParticipationCard({ part, onComplete, loading }) {
    const s = STATUS_MAP[part.status] || STATUS_MAP.ACTIVE;
    const Icon = s.icon;

    return (
        <div style={{
            background: "#fff", borderRadius: "var(--medium-radius)",
            border: "1px solid #E8ECF4", padding: "20px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            transition: "box-shadow 0.15s"
        }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
             onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
        >
            <div style={{
                width: 44, height: 44, borderRadius: 12, background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
                <Icon size={20} color={s.text} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)", marginBottom: 4 }}>
                    Phase: {part.phaseId?.slice(0, 8)}...
                </div>
                <div style={{ fontSize: 12, color: "var(--content)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span>Started: {new Date(part.startedAt).toLocaleDateString("en-GB")}</span>
                    {part.completedAt && (
                        <span>Completed: {new Date(part.completedAt).toLocaleDateString("en-GB")}</span>
                    )}
                </div>
            </div>

            {/* Progress bar for ACTIVE */}
            {part.status === "ACTIVE" && (
                <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--content)", marginBottom: 5, textAlign: "right" }}>
                        In Progress
                    </div>
                    <div style={{ height: 6, background: "#E8ECF4", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "60%", background: "var(--linear-blue)", borderRadius: 3, animation: "pulse 2s infinite" }} />
                    </div>
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
            background: s.bg, color: s.text,
            padding: "4px 12px", borderRadius: 20,
            fontSize: 12, fontWeight: 600
        }}>{s.label}</span>

                {part.status === "ACTIVE" && (
                    <button
                        onClick={onComplete}
                        disabled={loading}
                        style={{
                            background: "var(--linear-blue)", color: "#fff",
                            border: "none", borderRadius: 8, padding: "8px 16px",
                            fontWeight: 600, fontSize: 13, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 5,
                            opacity: loading ? 0.6 : 1
                        }}>
                        <CheckCircle2 size={14} />
                        {loading ? "..." : "Complete"}
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{
            textAlign: "center", padding: "70px 20px",
            background: "#fff", borderRadius: "var(--radius)",
            border: "1px solid #E8ECF4"
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--background-blue)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
            }}>
                <Activity size={28} color="var(--blue-text)" />
            </div>
            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 6 }}>No participations yet</h3>
            <p style={{ color: "var(--content)", fontSize: 14 }}>
                Accept an invitation or apply to a study to get started.
            </p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1,2].map(i => (
                <div key={i} style={{
                    background: "#fff", borderRadius: "var(--medium-radius)",
                    padding: "20px 24px", border: "1px solid #E8ECF4", height: 84,
                    display: "flex", alignItems: "center", gap: 16
                }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F0F4FA" }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ width: "45%", height: 13, background: "#F0F4FA", borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ width: "30%", height: 10, background: "#F0F4FA", borderRadius: 4 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}