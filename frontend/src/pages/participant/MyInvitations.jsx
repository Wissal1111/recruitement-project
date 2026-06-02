import { useState, useEffect } from "react";
import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import TopNavBar from "../../components/TopNavBar";
import { getMyInvitations, acceptInvitation, declineInvitation } from "../../api/RecruitmentApi";
import { Clock, Calendar, CheckCircle, XCircle, Mail, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyInvitations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const navigate = useNavigate();
    const [expiredOpen, setExpiredOpen] = useState(false);

    const session = JSON.parse(localStorage.getItem("session") || "{}");
    const firstName = session?.user?.firstName || "there";

    useEffect(() => {
        getMyInvitations()
           .then(r => {
        console.log("Invitation sample:", r.data[0]);  // ← add this
        setInvitations(r.data);
    })
            .catch(() => setInvitations([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAccept = async (id) => {
    setActionLoading(p => ({ ...p, [id]: "accept" }));

    try {
        const invitation = invitations.find(i => i.invitationId === id);

        await acceptInvitation(id);

        // update UI instantly
        setInvitations(inv =>
            inv.map(i =>
                i.invitationId === id
                    ? { ...i, status: "ACCEPTED" }
                    : i
            )
        );
        if (invitation?.studyId) {
            navigate(`/participate/responses/${invitation.studyId}`);
        }

    } catch (e) {
        console.error("Accept error:", e.response?.data || e.message);
    } finally {
        setActionLoading(p => ({ ...p, [id]: null }));
    }
};

    const handleDecline = async (id) => {
        setActionLoading(p => ({ ...p, [id]: "decline" }));
        try {
            await declineInvitation(id);
            setInvitations(inv => inv.map(i =>
                i.invitationId === id ? { ...i, status: "DECLINED" } : i
            ));
        } catch (e) {
            console.error("Decline error:", e.response?.data || e.message);
        } finally {
            setActionLoading(p => ({ ...p, [id]: null }));
        }
    };

    const active = invitations.filter(i => i.status !== "EXPIRED");
    const expired = invitations.filter(i => i.status === "EXPIRED");
    const pending = invitations.filter(i => i.status === "PENDING");

    return (
        <div className="dashboard">
            <TopNavBar page="participate" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBarParticipant page="invitations" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--title)", marginBottom: 4 }}>
                            Hello, {firstName}!
                        </h2>
                        <p style={{ fontSize: 14, color: "var(--content)" }}>
                            You have{" "}
                            <span style={{ color: "var(--blue-text)", fontWeight: 700 }}>
                                {pending.length} pending invitation{pending.length !== 1 ? "s" : ""}
                            </span>{" "}
                            waiting for your response.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : active.length === 0 && expired.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Active invitations */}
                        {active.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--content)", fontSize: 14 }}>
                                <Inbox size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                                <p>No active invitations right now.</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                {active.map(inv => (
                                    <InvitationCard
                                        key={inv.invitationId}
                                        inv={inv}
                                        onAccept={() => handleAccept(inv.invitationId)}
                                        onDecline={() => handleDecline(inv.invitationId)}
                                        loading={actionLoading[inv.invitationId]}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Expired — collapsible */}
                        {expired.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <button
                                    onClick={() => setExpiredOpen(o => !o)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        background: "none", border: "none", cursor: "pointer",
                                        fontSize: 13, fontWeight: 600, color: "var(--content)",
                                        padding: "4px 0", marginBottom: 10
                                    }}>
                                    <Clock size={14} />
                                    {expired.length} expired invitation{expired.length !== 1 ? "s" : ""}
                                    {expiredOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {expiredOpen && (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, opacity: 0.6 }}>
                                        {expired.map(inv => (
                                            <InvitationCard key={inv.invitationId} inv={inv} />
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

function daysLeft(expiresAt) {
    if (!expiresAt) return null;
    return Math.ceil((new Date(expiresAt) - Date.now()) / 86400000);
}

function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function InvitationCard({ inv, onAccept, onDecline, loading }) {
    const isPending = inv.status === "PENDING";
    const days = daysLeft(inv.expiresAt);

    const expiryColor = days === null ? "var(--content)"
        : days <= 1 ? "#DC2626"
        : days <= 3 ? "#D97706"
        : "var(--content)";

    const expiryLabel = days === null ? null
        : days <= 0 ? "Expires today"
        : days === 1 ? "Expires tomorrow"
        : `Expires in ${days}d`;

    const statusBadge = {
        PENDING:  { bg: "#EEF0FF", color: "#4338CA", label: "Pending" },
        ACCEPTED: { bg: "#F0FDF4", color: "#15803D", label: "Accepted" },
        DECLINED: { bg: "#F5F5F5", color: "#6B7280", label: "Declined" },
        EXPIRED:  { bg: "#FEF2F2", color: "#B91C1C", label: "Expired" },
    }[inv.status] || { bg: "#EEF0FF", color: "#4338CA", label: inv.status };

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
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                    background: statusBadge.bg, color: statusBadge.color,
                    borderRadius: 20, padding: "3px 10px",
                    fontSize: 11, fontWeight: 600
                }}>
                    {statusBadge.label}
                </span>
                <span style={{ fontSize: 11, color: "var(--content)" }}>
                    Received {formatDate(inv.sentAt)}
                </span>
            </div>

            {/* Study title + budget */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)", lineHeight: 1.4 }}>
                    {inv.studyTitle || "Untitled Study"}
                </div>
                {inv.totalBudget && (
                    <span style={{
                        background: "#EEF0FF", color: "#4338CA",
                        borderRadius: 20, padding: "3px 10px",
                        fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0
                    }}>
                        {inv.totalBudget} pts
                    </span>
                )}
            </div>

            {/* Description */}
{inv.studyDescription && (
    <p style={{
        margin: 0, fontSize: 12, color: "var(--content)",
        lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden"
    }}>
        {inv.studyDescription}
    </p>
)}

            {/* Expiry */}
            <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
                {expiryLabel ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: expiryColor, fontWeight: days <= 3 ? 600 : 400 }}>
                        <Calendar size={12} /> {expiryLabel}
                    </span>
                ) : inv.expiresAt ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--content)" }}>
                        <Calendar size={12} /> {formatDate(inv.expiresAt)}
                    </span>
                ) : null}
            </div>

            {/* Actions */}
            {isPending && (
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <button
                        onClick={onAccept}
                        disabled={!!loading}
                        style={{
                            flex: 1, background: "var(--linear-blue)", color: "#fff",
                            border: "none", borderRadius: 8, padding: "9px",
                            fontWeight: 600, fontSize: 13,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading === "accept" ? 0.6 : 1, transition: "opacity 0.15s"
                        }}>
                        <CheckCircle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                        {loading === "accept" ? "Accepting..." : "Accept"}
                    </button>
                    <button
                        onClick={onDecline}
                        disabled={!!loading}
                        style={{
                            flex: 1, background: "#F5F6FA", color: "var(--content)",
                            border: "none", borderRadius: 8, padding: "9px",
                            fontWeight: 600, fontSize: 13,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading === "decline" ? 0.6 : 1
                        }}>
                        {loading === "decline" ? "Declining..." : "Decline"}
                    </button>
                </div>
            )}

            {inv.status === "ACCEPTED" && (
                <div style={{ textAlign: "center", padding: "8px", background: "#F0FDF4", borderRadius: 8, color: "#15803D", fontWeight: 600, fontSize: 13 }}>
                    <CheckCircle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                    Accepted
                </div>
            )}
            {inv.status === "DECLINED" && (
                <div style={{ textAlign: "center", padding: "8px", background: "#F5F5F5", borderRadius: 8, color: "#6B7280", fontWeight: 600, fontSize: 13 }}>
                    <XCircle size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                    Declined
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{ textAlign: "center", padding: "70px 20px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid #E8ECF4" }}>
            <Mail size={28} style={{ color: "var(--blue-text)", marginBottom: 12 }} />
            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 6 }}>No invitations yet</h3>
            <p style={{ color: "var(--content)", fontSize: 14 }}>You'll be notified when a researcher invites you to a study.</p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: "var(--medium-radius)", padding: "18px 20px", border: "1px solid #E8ECF4", height: 160 }}>
                    <div style={{ width: "40%", height: 12, background: "#F0F4FA", borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ width: "70%", height: 11, background: "#F0F4FA", borderRadius: 4, marginBottom: 18 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, height: 36, background: "#EEF0FF", borderRadius: 8 }} />
                        <div style={{ flex: 1, height: 36, background: "#F5F6FA", borderRadius: 8 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}