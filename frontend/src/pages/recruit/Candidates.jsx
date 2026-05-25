import { useState } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getApplicationsByStudy } from "../../api/RecruitmentApi";
import { MoreVertical, UserPlus, Filter, Flag } from "lucide-react";

const STATUS_STYLES = {
    PENDING:       { bg: "#FFF7ED", color: "#C2410C", label: "PENDING" },
    APPROVED:      { bg: "#F0FDF4", color: "#15803D", label: "APPROVED" },
    REJECTED:      { bg: "#FEF2F2", color: "#DC2626", label: "REJECTED" },
    SCREENING:     { bg: "#EFF6FF", color: "#1D4ED8", label: "SCREENING" },
    MANUAL_REVIEW: { bg: "#FAF5FF", color: "#7E22CE", label: "MANUAL REVIEW" },
};

const TABS = ["All", "Pending", "Approved", "Rejected"];

export default function Candidates() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [inputId, setInputId] = useState("");
    const [studyId, setStudyId] = useState("");
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchApplications = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getApplicationsByStudy(id);
            setApplications(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLoad = () => {
        setStudyId(inputId);
        fetchApplications(inputId);
    };

    const filtered = applications.filter(p => {
        if (activeTab === "All") return true;
        if (activeTab === "Pending") return p.status === "PENDING";
        if (activeTab === "Approved") return p.status === "APPROVED";
        if (activeTab === "Rejected") return p.status === "REJECTED";
        return true;
    });

    const counts = {
        approved: applications.filter(a => a.status === "APPROVED").length,
        total: applications.length,
    };

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="allcandidates" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                {/* Breadcrumb */}
                <div style={{ fontSize: 13, color: "var(--content)", marginBottom: 6 }}>
                    <span style={{ color: "var(--blue-text)", cursor: "pointer" }}>Recruitment</span>
                    <span style={{ margin: "0 6px" }}>›</span>
                    <span style={{ fontWeight: 600, color: "var(--title)" }}>Candidates</span>
                </div>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--title)" }}>Participant Pulse</h2>
                    <button style={{
                        background: "var(--linear-blue)", color: "#fff",
                        border: "none", borderRadius: 10, padding: "10px 20px",
                        fontWeight: 700, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                    }}>
                        <UserPlus size={15} /> Invite New
                    </button>
                </div>

                {/* Study ID input */}
                <div style={{
                    background: "#fff", borderRadius: "var(--medium-radius)",
                    padding: "16px 20px", border: "1px solid #E8ECF4",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 24,
                    display: "flex", gap: 12
                }}>
                    <input
                        value={inputId}
                        onChange={e => setInputId(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLoad()}
                        placeholder="Enter Study ID to load candidates..."
                        style={{
                            flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
                            padding: "10px 14px", fontSize: 14, outline: "none",
                            color: "var(--title)", background: "#F8FAFC"
                        }}
                        onFocus={e => e.target.style.borderColor = "#7073FF"}
                        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                    />
                    <button onClick={handleLoad} style={{
                        background: "var(--linear-blue)", color: "#fff", border: "none",
                        borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>Load</button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <StatBox icon="👥" label="APPROVED" value={counts.approved} sub="candidates approved" subColor="#15803D" />
                    <StatBox icon="📋" label="TOTAL" value={counts.total} sub="total applications" subColor="var(--content)" />
                </div>

                {/* Tabs + Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 4, background: "#F5F6FA", borderRadius: 10, padding: 4 }}>
                        {TABS.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                background: activeTab === tab ? "#fff" : "transparent",
                                color: activeTab === tab ? "var(--title)" : "var(--content)",
                                border: "none", borderRadius: 8, padding: "7px 16px",
                                fontWeight: activeTab === tab ? 700 : 500,
                                fontSize: 13, cursor: "pointer",
                                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                transition: "all 0.15s"
                            }}>{tab}</button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button style={{
                            background: "#fff", border: "1.5px solid #E8ECF4", borderRadius: 8,
                            padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                            color: "var(--content)", display: "flex", alignItems: "center", gap: 5
                        }}>
                            <Filter size={13} /> Filters
                        </button>
                        <button style={{
                            background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 8,
                            padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                            color: "#DC2626", display: "flex", alignItems: "center", gap: 5
                        }}>
                            <Flag size={13} /> Blacklist
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8ECF4", overflow: "hidden" }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr 80px",
                        padding: "12px 20px", borderBottom: "1px solid #E8ECF4",
                        fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em"
                    }}>
                        <span>PARTICIPANT</span>
                        <span>PHASE</span>
                        <span>STATUS</span>
                        <span>APPLIED AT</span>
                        <span style={{ textAlign: "right" }}>ACTIONS</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--content)" }}>Loading...</div>
                    ) : !studyId ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--content)", fontSize: 14 }}>
                            Enter a Study ID to view candidates.
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--content)", fontSize: 14 }}>
                            No candidates found.
                        </div>
                    ) : (
                        filtered.map((p, i) => (
                            <ParticipantRow key={p.applicationId} p={p} last={i === filtered.length - 1} />
                        ))
                    )}
                </div>

                {filtered.length > 0 && (
                    <div style={{ marginTop: 16, fontSize: 13, color: "var(--content)" }}>
                        Showing {filtered.length} of {applications.length} candidates
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ icon, label, value, sub, subColor }) {
    return (
        <div style={{
            background: "#fff", borderRadius: 14, padding: "20px 24px",
            border: "1px solid #E8ECF4", display: "flex", alignItems: "center", gap: 20
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "var(--background-blue)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
            }}>{icon}</div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--title)", marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 12, color: subColor, fontWeight: 600 }}>{sub}</div>
            </div>
        </div>
    );
}

function ParticipantRow({ p, last }) {
    const s = STATUS_STYLES[p.status] || STATUS_STYLES.PENDING;
    const initials = p.participantId?.slice(0, 2).toUpperCase() || "??";

    return (
        <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr 80px",
            padding: "16px 20px",
            borderBottom: last ? "none" : "1px solid #F5F6FA",
            alignItems: "center"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--linear-blue)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700
                }}>{initials}</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--title)" }}>
                        {p.participantId?.slice(0, 8)}...
                    </div>
                    <div style={{ fontSize: 11, color: "var(--content)" }}>
                        App: {p.applicationId?.slice(0, 8)}...
                    </div>
                </div>
            </div>

            <div style={{ fontSize: 13, color: "var(--content)" }}>
                {p.phaseId?.slice(0, 8)}...
            </div>

            <div>
                <span style={{
                    background: s.bg, color: s.color,
                    borderRadius: 6, padding: "3px 10px",
                    fontSize: 11, fontWeight: 700
                }}>{s.label}</span>
            </div>

            <div style={{ fontSize: 12, color: "var(--content)" }}>
                {new Date(p.appliedAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                })}
            </div>

            <div style={{ textAlign: "right" }}>
                <button style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--content)", padding: 4, borderRadius: 6
                }}>
                    <MoreVertical size={16} />
                </button>
            </div>
        </div>
    );
}
