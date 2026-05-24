import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getMyParticipations } from "../../api/RecruitmentApi";
import { MoreVertical, UserPlus, Filter, Flag } from "lucide-react";

const MOCK_PARTICIPANTS = [
    { id: "ID-98187", name: "Marcus Holloway", avatar: "MH", phase: "Phase 1: Brand Semantics", status: "ACTIVE", reward: 120.00, completion: 48, color: "#7073FF" },
    { id: "ID-18519", name: "Elena Rodriguez", avatar: "ER", phase: "Product Fit Analysis", status: "COMPLETED", reward: 250.00, completion: 100, color: "#15803D" },
    { id: "ID-98022", name: "Jordan Smith", avatar: "JS", phase: "Usability Audit", status: "SCREENING", reward: 0.00, completion: 17, color: "#F59E0B" },
    { id: "ID-18311", name: "Kevin Park", avatar: "KP", phase: "Onboarding Flow", status: "FLAGGED", reward: 45.00, completion: 42, color: "#DC2626" },
];

const STATUS_STYLES = {
    ACTIVE:     { bg: "#EEF0FF", color: "#7073FF", label: "ACTIVE" },
    COMPLETED:  { bg: "#F0FDF4", color: "#15803D", label: "COMPLETED" },
    SCREENING:  { bg: "#FFF7ED", color: "#C2410C", label: "SCREENING" },
    FLAGGED:    { bg: "#FEF2F2", color: "#DC2626", label: "FLAGGED" },
};

const TABS = ["All Participants", "Screening", "In-Study", "Completed"];

export default function Candidates() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All Participants");
    const [search, setSearch] = useState("");

    const filtered = MOCK_PARTICIPANTS.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
        if (activeTab === "All Participants") return matchSearch;
        if (activeTab === "Screening") return matchSearch && p.status === "SCREENING";
        if (activeTab === "In-Study") return matchSearch && p.status === "ACTIVE";
        if (activeTab === "Completed") return matchSearch && p.status === "COMPLETED";
        return matchSearch;
    });

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="allcandidates" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                {/* Breadcrumb */}
                <div style={{ fontSize: 13, color: "var(--content)", marginBottom: 6 }}>
                    <span style={{ color: "var(--blue-text)", cursor: "pointer" }}>Project Alpha</span>
                    <span style={{ margin: "0 6px" }}>›</span>
                    <span style={{ fontWeight: 600, color: "var(--title)" }}>Participants</span>
                </div>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--title)", marginBottom: 2 }}>Participant Pulse</h2>
                    </div>
                    <button style={{
                        background: "var(--linear-blue)", color: "#fff",
                        border: "none", borderRadius: 10, padding: "10px 20px",
                        fontWeight: 700, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                    }}>
                        <UserPlus size={15} /> Invite New
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <StatBox icon="👥" label="ACTIVE" value="1,284" sub="+13% this month" subColor="#15803D" />
                    <StatBox icon="✅" label="COMPLETED" value="842" sub="72% retention rate" subColor="var(--content)" />
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
                            <Filter size={13} /> Advanced Filters
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
                    {/* Table Header */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.2fr 1.5fr 80px",
                        padding: "12px 20px", borderBottom: "1px solid #E8ECF4",
                        fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em"
                    }}>
                        <span>PARTICIPANT</span>
                        <span>STUDY PHASE</span>
                        <span>STATUS</span>
                        <span>REWARDS</span>
                        <span>COMPLETION</span>
                        <span style={{ textAlign: "right" }}>ACTIONS</span>
                    </div>

                    {/* Rows */}
                    {filtered.map((p, i) => (
                        <ParticipantRow key={p.id} p={p} last={i === filtered.length - 1} />
                    ))}

                    {filtered.length === 0 && (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--content)", fontSize: 14 }}>
                            No participants found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 13, color: "var(--content)" }}>
                    <span>Showing 1–{filtered.length} of 1,284 participants</span>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, "...", 129].map((p, i) => (
                            <button key={i} style={{
                                width: 30, height: 30, borderRadius: 6,
                                background: p === 1 ? "var(--linear-blue)" : "#fff",
                                color: p === 1 ? "#fff" : "var(--content)",
                                border: "1px solid #E8ECF4", cursor: "pointer", fontSize: 12, fontWeight: 600
                            }}>{p}</button>
                        ))}
                    </div>
                </div>
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
    const s = STATUS_STYLES[p.status] || STATUS_STYLES.ACTIVE;
    const initials = p.avatar;

    return (
        <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.2fr 1.5fr 80px",
            padding: "16px 20px",
            borderBottom: last ? "none" : "1px solid #F5F6FA",
            alignItems: "center"
        }}>
            {/* Participant */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--linear-blue)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700
                }}>{initials}</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--title)" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--content)" }}>ID: {p.id}</div>
                </div>
            </div>

            {/* Phase */}
            <div style={{ fontSize: 13, color: "var(--content)" }}>{p.phase}</div>

            {/* Status */}
            <div>
        <span style={{
            background: s.bg, color: s.color,
            borderRadius: 6, padding: "3px 10px",
            fontSize: 11, fontWeight: 700
        }}>{s.label}</span>
            </div>

            {/* Reward */}
            <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--title)" }}>${p.reward.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: p.reward === 0 ? "#F59E0B" : "#15803D", fontWeight: 600 }}>
                    {p.reward === 0 ? "Pending approval" : "Payment Sent"}
                </div>
            </div>

            {/* Completion */}
            <div>
                <div style={{ fontSize: 12, color: "var(--content)", marginBottom: 4 }}>{p.completion}%</div>
                <div style={{ background: "#F0F4FA", borderRadius: 4, height: 6, width: "80%" }}>
                    <div style={{
                        background: p.status === "FLAGGED" ? "#DC2626" : p.status === "COMPLETED" ? "#15803D" : "var(--linear-blue)",
                        height: "100%", borderRadius: 4,
                        width: `${p.completion}%`,
                        transition: "width 0.3s"
                    }} />
                </div>
            </div>

            {/* Actions */}
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