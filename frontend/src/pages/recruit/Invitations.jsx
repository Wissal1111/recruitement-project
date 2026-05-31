import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getCampaigns, launchCampaign, cancelCampaign, getCampaignStats, resendInvitations } from "../../api/RecruitmentApi";
import axiosInstance from "../../api/axiosInstance";
import { MailPlus, Send, XCircle, BarChart2, RefreshCw, Zap } from "lucide-react";

const CAMPAIGN_STATUS = {
    ACTIVE:    { bg: "#F0FDF4", text: "#15803D" },
    CANCELLED: { bg: "#FEF2F2", text: "#B91C1C" },
    COMPLETED: { bg: "var(--background-blue)", text: "var(--blue-text)" },
    DRAFT:     { bg: "#F1F5F9", text: "#64748B" },
    PAUSED:    { bg: "#FFF7ED", text: "#C2410C" },
};

export default function Invitations() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [studies, setStudies] = useState([]);
    const [studyId, setStudyId] = useState("");
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [form, setForm] = useState({ targetCount: 10, expirationDays: 7 });
    const [stats, setStats] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        axiosInstance.get("/studies/my-studies")
            .then(res => {
                const list = res.data?.studies || res.data || [];
                setStudies(list);
                if (list.length > 0) {
                    setStudyId(list[0].studyId);
                    load(list[0].studyId);
                }
            })
            .catch(() => {});
    }, []);

    const load = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getCampaigns(id);
            setCampaigns(res.data);
        } catch (e) {
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStudyChange = (id) => {
        setStudyId(id);
        setStats({});
        load(id);
    };

    const handleLaunch = async () => {
        if (!studyId) return;
        setLaunching(true);
        try {
            await launchCampaign(studyId, form);
            load(studyId);
        } catch (e) {
            console.error(e);
        } finally {
            setLaunching(false);
        }
    };

    const handleCancel = async (campaignId) => {
        setActionLoading(p => ({ ...p, [campaignId]: "cancel" }));
        try {
            await cancelCampaign(campaignId);
            load(studyId);
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(p => ({ ...p, [campaignId]: null }));
        }
    };

    const handleStats = async (campaignId) => {
        setActionLoading(p => ({ ...p, [campaignId]: "stats" }));
        try {
            const res = await getCampaignStats(campaignId);
            setStats(s => ({ ...s, [campaignId]: res.data }));
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(p => ({ ...p, [campaignId]: null }));
        }
    };

    const handleResend = async (campaignId) => {
        setActionLoading(p => ({ ...p, [campaignId]: "resend" }));
        try {
            await resendInvitations(campaignId);
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(p => ({ ...p, [campaignId]: null }));
        }
    };

    const inputStyle = {
        width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
        padding: "10px 14px", fontSize: 14, outline: "none",
        color: "var(--title)", background: "#F8FAFC", transition: "border-color 0.2s"
    };

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="invitations" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <MailPlus size={20} color="var(--blue-text)" /> Invitation Campaigns
                    </h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>Launch campaigns to invite eligible participants</p>
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

                {studyId && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
                        {/* Launch Form */}
                        <div style={{
                            background: "#fff", borderRadius: "var(--medium-radius)",
                            padding: "24px", border: "1px solid #E8ECF4",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                        }}>
                            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 20, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                                <Zap size={16} color="var(--blue-text)" /> Launch New Campaign
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--title)", display: "block", marginBottom: 6 }}>
                                        Target Count
                                    </label>
                                    <input type="number" value={form.targetCount}
                                           onChange={e => setForm(f => ({ ...f, targetCount: parseInt(e.target.value) }))}
                                           style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#7073FF"}
                                           onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                                    <p style={{ fontSize: 11, color: "var(--content)", marginTop: 4 }}>Number of participants to invite</p>
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--title)", display: "block", marginBottom: 6 }}>
                                        Expiration Days
                                    </label>
                                    <input type="number" value={form.expirationDays}
                                           onChange={e => setForm(f => ({ ...f, expirationDays: parseInt(e.target.value) }))}
                                           style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#7073FF"}
                                           onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                                    <p style={{ fontSize: 11, color: "var(--content)", marginTop: 4 }}>Invitations expire after this many days</p>
                                </div>
                                <button onClick={handleLaunch} disabled={launching} style={{
                                    background: "var(--linear-blue)", color: "#fff",
                                    border: "none", borderRadius: 8, padding: "12px",
                                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                                }}>
                                    <Send size={15} />
                                    {launching ? "Launching..." : "Launch Campaign"}
                                </button>
                            </div>
                        </div>

                        {/* Campaigns List */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {loading ? (
                                <div style={{ textAlign: "center", padding: 40, color: "var(--content)" }}>Loading...</div>
                            ) : campaigns.length === 0 ? (
                                <div style={{
                                    background: "#fff", borderRadius: "var(--medium-radius)",
                                    padding: "40px", border: "1px solid #E8ECF4", textAlign: "center"
                                }}>
                                    <MailPlus size={32} color="#CBD5E1" style={{ margin: "0 auto 12px", display: "block" }} />
                                    <p style={{ color: "var(--content)", fontSize: 14 }}>No campaigns yet. Launch your first one!</p>
                                </div>
                            ) : (
                                campaigns.map(c => {
                                    const s = CAMPAIGN_STATUS[c.status] || CAMPAIGN_STATUS.DRAFT;
                                    const campaignStats = stats[c.campaignId];
                                    return (
                                        <div key={c.campaignId} style={{
                                            background: "#fff", borderRadius: "var(--medium-radius)",
                                            border: "1px solid #E8ECF4", padding: "18px 20px",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "var(--title)", fontSize: 14, marginBottom: 4 }}>
                                                        {c.targetCount} targets · {c.expirationDays} days
                                                    </div>
                                                    <div style={{ fontSize: 12, color: "var(--content)" }}>
                                                        {new Date(c.createdAt).toLocaleDateString("en-GB")}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    background: s.bg, color: s.text,
                                                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
                                                }}>{c.status}</span>
                                            </div>

                                            {campaignStats && (
                                                <div style={{
                                                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                                                    gap: 8, background: "#F8FAFC", borderRadius: 8,
                                                    padding: "10px", marginBottom: 12
                                                }}>
                                                    {[
                                                        ["Invited", campaignStats.totalInvited],
                                                        ["Accepted", campaignStats.totalAccepted],
                                                        ["Completed", campaignStats.totalCompleted],
                                                    ].map(([label, val]) => (
                                                        <div key={label} style={{ textAlign: "center" }}>
                                                            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--title)" }}>{val}</div>
                                                            <div style={{ fontSize: 11, color: "var(--content)" }}>{label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button onClick={() => handleStats(c.campaignId)} style={{
                                                    flex: 1, background: "var(--background-blue)", color: "var(--blue-text)",
                                                    border: "none", borderRadius: 6, padding: "7px 10px", cursor: "pointer",
                                                    fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                                                }}>
                                                    <BarChart2 size={12} />
                                                    {actionLoading[c.campaignId] === "stats" ? "..." : "Stats"}
                                                </button>
                                                {c.status === "ACTIVE" && (
                                                    <>
                                                        <button onClick={() => handleResend(c.campaignId)} style={{
                                                            flex: 1, background: "#EFF6FF", color: "#1D4ED8",
                                                            border: "none", borderRadius: 6, padding: "7px 10px", cursor: "pointer",
                                                            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                                                        }}>
                                                            <RefreshCw size={12} /> Resend
                                                        </button>
                                                        <button onClick={() => handleCancel(c.campaignId)} style={{
                                                            flex: 1, background: "#FEF2F2", color: "#B91C1C",
                                                            border: "none", borderRadius: 6, padding: "7px 10px", cursor: "pointer",
                                                            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                                                        }}>
                                                            <XCircle size={12} /> Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
