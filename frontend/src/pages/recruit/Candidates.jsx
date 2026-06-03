import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getApplicationsByStudy } from "../../api/RecruitmentApi";
import { getProfileBasic, getProfileById } from "../../api/ProfileApi";
import axiosInstance from "../../api/axiosInstance";
import { MoreVertical, UserPlus, Filter, Flag, User, X } from "lucide-react";

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
    const [studies, setStudies] = useState([]);
    const [studyId, setStudyId] = useState("");
    const [applications, setApplications] = useState([]);
    const [profilesMap, setProfilesMap] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get("/studies/my-studies")
            .then(res => {
                const list = res.data?.studies || res.data || [];
                setStudies(list);
                if (list.length > 0) {
                    setStudyId(list[0].studyId);
                    fetchApplications(list[0].studyId);
                }
            })
            .catch(() => {});
    }, []);

    const fetchApplications = async (id) => {
        if (!id) return;
        setLoading(true);
        setProfilesMap({});
        try {
            const res = await getApplicationsByStudy(id);
            const apps = res.data || [];
            setApplications(apps);

            const uniqueIds = [...new Set(apps.map(a => a.participantId).filter(Boolean))];
            const entries = await Promise.all(
                uniqueIds.map(async (uid) => {
                    try {
                        const data = await getProfileBasic(uid);
                        return [uid, data];
                    } catch {
                        return [uid, null];
                    }
                })
            );
            setProfilesMap(Object.fromEntries(entries));
        } catch {
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStudyChange = (id) => {
        setStudyId(id);
        setActiveTab("All");
        fetchApplications(id);
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

    const inputStyle = {
        flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
        padding: "10px 14px", fontSize: 14, outline: "none",
        color: "var(--title)", background: "#F8FAFC"
    };

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="allcandidates" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ fontSize: 13, color: "var(--content)", marginBottom: 6 }}>
                    <span style={{ color: "var(--blue-text)", cursor: "pointer" }}>Recruitment</span>
                    <span style={{ margin: "0 6px" }}>›</span>
                    <span style={{ fontWeight: 600, color: "var(--title)" }}>Candidates</span>
                </div>

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

                {/* Study Selector */}
                <div style={{
                    background: "#fff", borderRadius: "var(--medium-radius)",
                    padding: "16px 20px", border: "1px solid #E8ECF4",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 24,
                    display: "flex", alignItems: "center", gap: 12
                }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--title)", whiteSpace: "nowrap" }}>
                        Study :
                    </label>
                    <select
                        value={studyId}
                        onChange={e => handleStudyChange(e.target.value)}
                        style={{ ...inputStyle, cursor: "pointer" }}
                        onFocus={e => e.target.style.borderColor = "#7073FF"}
                        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                    >
                        {studies.length === 0 && <option value="">No studies found</option>}
                        {studies.map(s => (
                            <option key={s.studyId} value={s.studyId}>
                                {s.title} — {s.studyStatus}
                            </option>
                        ))}
                    </select>
                    {studyId && (
                        <span style={{
                            background: studies.find(s => s.studyId === studyId)?.studyStatus === "ACTIVE" ? "#F0FDF4" : "#F1F5F9",
                            color: studies.find(s => s.studyId === studyId)?.studyStatus === "ACTIVE" ? "#15803D" : "#64748B",
                            borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap"
                        }}>
                            {studies.find(s => s.studyId === studyId)?.studyStatus || ""}
                        </span>
                    )}
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
                        display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr 120px",
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
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "var(--content)", fontSize: 14 }}>
                            No candidates found.
                        </div>
                    ) : (
                        filtered.map((p, i) => (
                            <ParticipantRow
                                key={p.applicationId}
                                p={p}
                                last={i === filtered.length - 1}
                                initialProfile={profilesMap[p.participantId] ?? null}
                            />
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
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #E8ECF4", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--title)", marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 12, color: subColor, fontWeight: 600 }}>{sub}</div>
            </div>
        </div>
    );
}

function ParticipantRow({ p, last, initialProfile }) {
    const [profile, setProfile] = useState(initialProfile);
    const [fullProfile, setFullProfile] = useState(null);
    const [fullProfileLoading, setFullProfileLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (initialProfile) setProfile(initialProfile);
    }, [initialProfile]);

    const handleSeeProfile = async (e) => {
        e.stopPropagation();
        setShowModal(true);
        if (fullProfile) return;
        setFullProfileLoading(true);
        try {
            const data = await getProfileById(p.participantId);
            setFullProfile(data);
        } catch {
            setFullProfile(null);
        } finally {
            setFullProfileLoading(false);
        }
    };

    const initials = profile
        ? `${profile.firstname?.[0] ?? ""}${profile.lastname?.[0] ?? ""}`.toUpperCase()
        : "··";

    const fullName = profile ? `${profile.firstname} ${profile.lastname}` : null;
    const subLine = profile
        ? [profile.profile?.profession, profile.profile?.country].filter(Boolean).join(" · ")
        : null;

    const s = STATUS_STYLES[p.status] || STATUS_STYLES.PENDING;

    const calcAge = (dob) => {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };
    const age = fullProfile?.profile?.age ?? calcAge(fullProfile?.profile?.dateOfBirth);

    return (
        <>
            <div style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr 120px",
                padding: "16px 20px", borderBottom: last ? "none" : "1px solid #F5F6FA", alignItems: "center"
            }}>
                {/* Participant */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--background-blue)", color: "var(--blue-text)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, flexShrink: 0
                    }}>{initials}</div>
                    <div>
                        {fullName
                            ? <div style={{ fontWeight: 700, fontSize: 13, color: "var(--title)" }}>{fullName}</div>
                            : <div style={{ width: 110, height: 13, borderRadius: 6, background: "linear-gradient(90deg,#E8ECF4 25%,#F4F6FA 50%,#E8ECF4 75%)", backgroundSize: "200% 100%", animation: "sr-shimmer 1.4s infinite", marginBottom: 4 }} />
                        }
                        {subLine
                            ? <div style={{ fontSize: 11, color: "var(--content)" }}>{subLine}</div>
                            : <div style={{ width: 75, height: 10, borderRadius: 6, background: "linear-gradient(90deg,#E8ECF4 25%,#F4F6FA 50%,#E8ECF4 75%)", backgroundSize: "200% 100%", animation: "sr-shimmer 1.4s infinite" }} />
                        }
                    </div>
                </div>

                {/* Phase */}
                <div style={{ fontSize: 13, color: "var(--content)" }}>{p.phaseId?.slice(0, 8)}...</div>

                {/* Status */}
                <div>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        {s.label}
                    </span>
                </div>

                {/* Date */}
                <div style={{ fontSize: 12, color: "var(--content)" }}>
                    {new Date(p.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button
                        onClick={handleSeeProfile}
                        style={{
                            background: "none", border: "1px solid #E8ECF4", borderRadius: 6,
                            padding: "4px 10px", fontSize: 12, color: "var(--content)",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                            fontWeight: 600
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--background-blue)"; e.currentTarget.style.color = "var(--blue-text)"; e.currentTarget.style.borderColor = "var(--blue-text)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--content)"; e.currentTarget.style.borderColor = "#E8ECF4"; }}
                    >
                        <User size={12} /> Profile
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--content)", padding: 4, borderRadius: 6 }}>
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Profile Modal */}
            {showModal && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8ECF4", width: 440, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #E8ECF4", display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--background-blue)", color: "var(--blue-text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                                {initials}
                            </div>
                            <div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--title)", margin: "0 0 2px" }}>{fullName ?? "—"}</p>
                                <p style={{ fontSize: 12, color: "var(--content)", margin: 0 }}>{fullProfile?.email ?? "—"}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--content)", display: "flex", alignItems: "center" }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        {fullProfileLoading ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40, color: "var(--content)", fontSize: 14 }}>
                                <div className="sr-spinner" /><p>Loading profile…</p>
                            </div>
                        ) : fullProfile ? (
                            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                {[
                                    ["Age",            age ? `${age} years` : null],
                                    ["Gender",         fullProfile.profile?.gender],
                                    ["Education",      fullProfile.profile?.education],
                                    ["Profession",     fullProfile.profile?.profession],
                                    ["Location",       [fullProfile.profile?.city, fullProfile.profile?.country].filter(Boolean).join(", ")],
                                    ["Total earnings", `${fullProfile.profile?.totalEarnings ?? 0} pts`],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ background: "#F8FAFF", borderRadius: 8, padding: "10px 12px" }}>
                                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--content)", marginBottom: 4, fontWeight: 600 }}>{label}</div>
                                        <div style={{ fontSize: 13, fontWeight: value ? 600 : 400, color: value ? "var(--title)" : "var(--content)", fontStyle: value ? "normal" : "italic" }}>
                                            {value || "Not provided"}
                                        </div>
                                    </div>
                                ))}
                                {[["Bio", fullProfile.profile?.bio], ["Member since", new Date(fullProfile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })]].map(([label, value]) => (
                                    <div key={label} style={{ background: "#F8FAFF", borderRadius: 8, padding: "10px 12px", gridColumn: "1 / -1" }}>
                                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--content)", marginBottom: 4, fontWeight: 600 }}>{label}</div>
                                        <div style={{ fontSize: 13, fontWeight: value ? 600 : 400, color: value ? "var(--title)" : "var(--content)", fontStyle: value ? "normal" : "italic" }}>
                                            {value || "Not provided"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: 40, textAlign: "center", color: "var(--content)", fontSize: 14 }}>Could not load profile.</div>
                        )}

                        {/* Footer */}
                        <div style={{ padding: "12px 20px", borderTop: "1px solid #E8ECF4", display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "1px solid #E8ECF4", borderRadius: 8, padding: "7px 18px", fontSize: 13, color: "var(--title)", cursor: "pointer" }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}