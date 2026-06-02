import { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import { getMyApplications, cancelApplication } from "../../api/RecruitmentApi";
import { FileText, Clock, CheckCircle, XCircle, Ban, Calendar, Gift, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_MAP = {
    PENDING:  { bg: "#FFF7ED", color: "#C2410C", label: "Pending Review" },
    APPROVED: { bg: "#F0FDF4", color: "#15803D", label: "Approved" },
    REJECTED: { bg: "#FEF2F2", color: "#B91C1C", label: "Rejected" },
};

export default function MyApplications() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState({});
    const [rejectedOpen, setRejectedOpen] = useState(false);

    useEffect(() => {
        getMyApplications()
            .then(r => setApplications(r.data))
            .catch(() => setApplications([]))
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (applicationId) => {
        setCancelling(p => ({ ...p, [applicationId]: true }));
        try {
            await cancelApplication(applicationId);
            setApplications(p => p.filter(a => a.applicationId !== applicationId));
        } catch (e) {
            console.error("Cancel error:", e.response?.data || e.message);
        } finally {
            setCancelling(p => ({ ...p, [applicationId]: false }));
        }
    };

    const active = applications.filter(a => a.status !== "REJECTED");
    const rejected = applications.filter(a => a.status === "REJECTED");

    return (
        <div className="dashboard">
            <TopNavBar page="participate" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBarParticipant page="applications" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={20} color="var(--blue-text)" /> My Applications
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--content)" }}>
                        Track the status of your study applications.
                    </p>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : active.length === 0 && rejected.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {active.map(app => (
                                <ApplicationCard
                                    key={app.applicationId}
                                    app={app}
                                    onCancel={() => handleCancel(app.applicationId)}
                                    cancelling={cancelling[app.applicationId]}
                                />
                            ))}
                        </div>

                        {rejected.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <button
                                    onClick={() => setRejectedOpen(o => !o)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        background: "none", border: "none", cursor: "pointer",
                                        fontSize: 13, fontWeight: 600, color: "var(--content)",
                                        padding: "4px 0", marginBottom: 10
                                    }}>
                                    <XCircle size={14} />
                                    {rejected.length} rejected application{rejected.length !== 1 ? "s" : ""}
                                    {rejectedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {rejectedOpen && (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, opacity: 0.6 }}>
                                        {rejected.map(app => (
                                            <ApplicationCard key={app.applicationId} app={app} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function ApplicationCard({ app, onCancel, cancelling }) {
    const badge = STATUS_MAP[app.status] || STATUS_MAP.PENDING;
    const isPending = app.status === "PENDING";
    const isViaInvite = !!app.invitationId;

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    };

    return (
        <div style={{
            background: "#fff", borderRadius: "var(--medium-radius)",
            border: "1px solid #E8ECF4", padding: "18px 20px",
            display: "flex", flexDirection: "column", gap: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.15s"
        }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                    background: badge.bg, color: badge.color,
                    borderRadius: 20, padding: "3px 10px",
                    fontSize: 11, fontWeight: 600
                }}>
                    {badge.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isViaInvite && (
                        <span style={{
                            background: "#EEF0FF", color: "#4338CA",
                            borderRadius: 20, padding: "3px 10px",
                            fontSize: 11, fontWeight: 600
                        }}>
                            Via Invite
                        </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--content)" }}>
                        {formatDate(app.appliedAt)}
                    </span>
                </div>
            </div>

            {/* Title + reward */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)", lineHeight: 1.4 }}>
                    {app.studyTitle || "Untitled Study"}
                </div>
                {app.rewardAmount && (
                    <span style={{
                        background: "#F0FDF4", color: "#15803D",
                        borderRadius: 20, padding: "3px 10px",
                        fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0
                    }}>
                        {app.rewardAmount} pts
                    </span>
                )}
            </div>

            {/* Description */}
            {app.studyDescription && (
                <p style={{
                    margin: 0, fontSize: 12, color: "var(--content)",
                    lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>
                    {app.studyDescription}
                </p>
            )}

            {/* Rejection reason */}
            {app.status === "REJECTED" && app.rejectionReason && (
                <div style={{
                    background: "#FEF2F2", borderRadius: 8, padding: "8px 12px",
                    fontSize: 12, color: "#B91C1C"
                }}>
                    <strong>Reason:</strong> {app.rejectionReason}
                </div>
            )}

            {/* Meta */}
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--content)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Applied {formatDate(app.appliedAt)}
                </span>
                {app.reviewedAt && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> Reviewed {formatDate(app.reviewedAt)}
                    </span>
                )}
            </div>

            {/* Cancel button — only for pending */}
            {isPending && onCancel && (
                <button
                    onClick={onCancel}
                    disabled={cancelling}
                    style={{
                        background: "#FEF2F2", color: "#B91C1C",
                        border: "none", borderRadius: 8, padding: "9px",
                        fontWeight: 600, fontSize: 13,
                        cursor: cancelling ? "not-allowed" : "pointer",
                        opacity: cancelling ? 0.6 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}>
                    <Ban size={13} />
                    {cancelling ? "Cancelling..." : "Cancel Application"}
                </button>
            )}

            {app.status === "APPROVED" && (
                <div style={{
                    textAlign: "center", padding: "8px",
                    background: "#F0FDF4", borderRadius: 8,
                    color: "#15803D", fontWeight: 600, fontSize: 13
                }}>
                    <CheckCircle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                    Approved — check your participations
                </div>
            )}
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
            <FileText size={28} style={{ color: "var(--blue-text)", marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 6 }}>No applications yet</h3>
            <p style={{ color: "var(--content)", fontSize: 14 }}>
                Browse studies and apply to get started.
            </p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                    background: "#fff", borderRadius: "var(--medium-radius)",
                    padding: "18px 20px", border: "1px solid #E8ECF4", height: 180
                }}>
                    <div style={{ width: "40%", height: 12, background: "#F0F4FA", borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ width: "70%", height: 13, background: "#F0F4FA", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ width: "90%", height: 10, background: "#F0F4FA", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: "60%", height: 10, background: "#F0F4FA", borderRadius: 4, marginBottom: 18 }} />
                    <div style={{ width: "100%", height: 36, background: "#FEF2F2", borderRadius: 8 }} />
                </div>
            ))}
        </div>
    );
}