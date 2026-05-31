import { useState, useEffect } from "react";
import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import TopNavBar from "../../components/TopNavBar";
import { getMyInvitations, acceptInvitation, declineInvitation } from "../../api/RecruitmentApi";
import { Clock, MapPin, Video, Calendar } from "lucide-react";

export default function MyInvitations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [totalEarnings] = useState(1240.50);

    const session = JSON.parse(localStorage.getItem("session") || "{}");
    const firstName = session?.user?.firstName || "Alex";

    useEffect(() => {
        getMyInvitations()
            .then(r => setInvitations(r.data))
            .catch(() => setInvitations([]))
            .finally(() => setLoading(false));
    }, []);

    const handleAccept = async (id) => {
        setActionLoading(p => ({ ...p, [id]: "accept" }));
        try {
            await acceptInvitation(id);
            setInvitations(inv => inv.map(i => i.invitationId === id ? { ...i, status: "ACCEPTED" } : i));
        } catch (e) { console.error(e); }
        finally { setActionLoading(p => ({ ...p, [id]: null })); }
    };

    const handleDecline = async (id) => {
        setActionLoading(p => ({ ...p, [id]: "decline" }));
        try {
            await declineInvitation(id);
            setInvitations(inv => inv.map(i => i.invitationId === id ? { ...i, status: "DECLINED" } : i));
        } catch (e) { console.error(e); }
        finally { setActionLoading(p => ({ ...p, [id]: null })); }
    };

    const pending = invitations.filter(i => i.status === "PENDING");

    // Mock pour le design si pas de données
    const displayInvitations = invitations.length > 0 ? invitations : MOCK_INVITATIONS;

    return (
        <div className="dashboard">
            <TopNavBar page="participate" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBarParticipant page="invitations" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--title)", marginBottom: 4 }}>
                            Hello, {firstName}! 👋
                        </h2>
                        <p style={{ fontSize: 14, color: "var(--content)" }}>
                            You have <span style={{ color: "var(--blue-text)", fontWeight: 700 }}>
                {pending.length} new invitations
              </span> waiting for your response. These opportunities match your editorial profile.
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 4 }}>
                            TOTAL EARNINGS
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue-text)" }}>
                            ${totalEarnings.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Invitations Grid */}
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {displayInvitations.map(inv => (
                            <InvitationCard
                                key={inv.invitationId || inv.id}
                                inv={inv}
                                onAccept={() => handleAccept(inv.invitationId || inv.id)}
                                onDecline={() => handleDecline(inv.invitationId || inv.id)}
                                loading={actionLoading[inv.invitationId || inv.id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function InvitationCard({ inv, onAccept, onDecline, loading }) {
    const isPending = inv.status === "PENDING" || inv.status === undefined;
    const isHighPriority = inv.priority === "HIGH" || inv.tag === "HIGH PRIORITY";
    const tag = isHighPriority ? "HIGH PRIORITY" : "NEW INVITE";
    const tagColor = isHighPriority ? "#FF6B35" : "#7073FF";
    const tagBg = isHighPriority ? "#FFF3EE" : "#EEF0FF";
    const borderColor = isHighPriority ? "rgba(255,107,53,0.2)" : "rgba(112,115,255,0.2)";

    const formatDate = (d) => {
        if (!d) return "Oct 24, 2023";
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div style={{
            background: "#fff",
            borderRadius: 16,
            border: `1.5px solid ${borderColor}`,
            padding: "20px 24px",
            boxShadow: "0 2px 16px rgba(112,115,255,0.06)",
            borderLeft: `4px solid ${tagColor}`,
            transition: "box-shadow 0.15s"
        }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(112,115,255,0.12)"}
             onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(112,115,255,0.06)"}
        >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Icon */}
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: isHighPriority ? "#FFF3EE" : "#EEF0FF",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <span style={{ fontSize: 18 }}>{isHighPriority ? "📅" : "🎯"}</span>
                    </div>
                    <div>
            <span style={{
                background: tagBg, color: tagColor,
                borderRadius: 4, padding: "2px 8px",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                display: "block", marginBottom: 4
            }}>{tag}</span>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)" }}>
                            {inv.title || "Study Invitation"}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue-text)" }}>
                        ${inv.reward || "120"}.00
                    </div>
                    <div style={{ fontSize: 11, color: "var(--content)" }}>Estimated Reward</div>
                </div>
            </div>

            {/* Meta */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 12, color: "var(--content)", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={12} /> {inv.duration || "45"} Minutes
        </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#C2410C" }}>
          <Calendar size={12} color="#C2410C" />
          <span style={{ color: "#C2410C", fontWeight: 600 }}>
            Expires: {formatDate(inv.expiresAt)}
          </span>
        </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {inv.format === "ZOOM" ? <Video size={12} /> : <MapPin size={12} />}
                    {inv.location || "Remote"}
        </span>
            </div>

            {/* Buttons */}
            {isPending && (
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onAccept} disabled={!!loading} style={{
                        flex: 1, background: "linear-gradient(135deg, #7073FF, #5B5EFF)",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: "12px", fontWeight: 700, fontSize: 14,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading === "accept" ? 0.7 : 1,
                        transition: "opacity 0.15s"
                    }}>
                        {loading === "accept" ? "Accepting..." : "Accept Invitation"}
                    </button>
                    <button onClick={onDecline} disabled={!!loading} style={{
                        flex: 1, background: "#F5F6FA", color: "var(--content)",
                        border: "none", borderRadius: 10, padding: "12px",
                        fontWeight: 600, fontSize: 14, cursor: "pointer",
                        opacity: loading === "decline" ? 0.7 : 1
                    }}>
                        Decline
                    </button>
                </div>
            )}

            {inv.status === "ACCEPTED" && (
                <div style={{ textAlign: "center", padding: "10px", background: "#F0FDF4", borderRadius: 10, color: "#15803D", fontWeight: 700, fontSize: 13 }}>
                    ✓ Accepted
                </div>
            )}
            {inv.status === "DECLINED" && (
                <div style={{ textAlign: "center", padding: "10px", background: "#FEF2F2", borderRadius: 10, color: "#B91C1C", fontWeight: 700, fontSize: 13 }}>
                    ✗ Declined
                </div>
            )}
        </div>
    );
}

const MOCK_INVITATIONS = [
    { id: 1, title: "UX Research: The Future of Editorial AI", reward: 120, duration: 45, status: "PENDING", priority: "NEW", location: "Remote", tag: "NEW INVITE" },
    { id: 2, title: "Reader Behavior Study: Long-form Digital Journalism", reward: 85, duration: 30, status: "PENDING", priority: "HIGH", location: "Zoom Interview", format: "ZOOM", tag: "HIGH PRIORITY" },
    { id: 3, title: "UX Research: The Future of Editorial AI", reward: 120, duration: 45, status: "PENDING", priority: "NEW", location: "Remote", tag: "NEW INVITE" },
    { id: 4, title: "Reader Behavior Study: Long-form Digital Journalism", reward: 85, duration: 30, status: "PENDING", priority: "HIGH", location: "Zoom Interview", format: "ZOOM", tag: "HIGH PRIORITY" },
];

function LoadingSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[1,2,3,4].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #E8ECF4", height: 180 }}>
                    <div style={{ width: "60%", height: 14, background: "#F0F4FA", borderRadius: 4, marginBottom: 10 }} />
                    <div style={{ width: "40%", height: 11, background: "#F0F4FA", borderRadius: 4, marginBottom: 20 }} />
                    <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1, height: 40, background: "#EEF0FF", borderRadius: 10 }} />
                        <div style={{ flex: 1, height: 40, background: "#F5F6FA", borderRadius: 10 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}