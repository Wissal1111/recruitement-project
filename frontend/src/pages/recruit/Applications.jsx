import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getApplicationsByStudy, reviewApplication, startParticipation } from "../../api/RecruitmentApi";
import axiosInstance from "../../api/axiosInstance";
import { CheckCircle, XCircle, Play, Clock } from "lucide-react";

const STATUS_COLORS = {
    PENDING:      { bg: "#FFF7ED", text: "#C2410C", dot: "#FB923C" },
    APPROVED:     { bg: "#F0FDF4", text: "#15803D", dot: "#4ADE80" },
    REJECTED:     { bg: "#FEF2F2", text: "#B91C1C", dot: "#F87171" },
    SCREENING:    { bg: "#EFF6FF", text: "#1D4ED8", dot: "#60A5FA" },
    MANUAL_REVIEW:{ bg: "#FAF5FF", text: "#7E22CE", dot: "#C084FC" },
};

export default function Applications() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [studies, setStudies] = useState([]);
    const [studyId, setStudyId] = useState("");
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [actionLoading, setActionLoading] = useState({});
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

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
        try {
            const res = await getApplicationsByStudy(id);
            setApplications(res.data);
        } catch (e) {
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStudyChange = (id) => {
        setStudyId(id);
        setFilter("ALL");
        fetchApplications(id);
    };

    const handleApprove = async (appId) => {
        setActionLoading(p => ({ ...p, [appId]: "approve" }));
        try {
            await reviewApplication(appId, { approved: true, rejectionReason: null });
            await startParticipation(appId);
            fetchApplications(studyId);
        } catch (e) { console.error(e); }
        finally { setActionLoading(p => ({ ...p, [appId]: null })); }
    };

    const handleReject = async () => {
        if (!rejectModal) return;
        setActionLoading(p => ({ ...p, [rejectModal]: "reject" }));
        try {
            await reviewApplication(rejectModal, { approved: false, rejectionReason: rejectReason });
            setRejectModal(null); setRejectReason("");
            fetchApplications(studyId);
        } catch (e) { console.error(e); }
        finally { setActionLoading(p => ({ ...p, [rejectModal]: null })); }
    };

    const filtered = filter === "ALL" ? applications : applications.filter(a => a.status === filter);
    const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

    const inputStyle = {
        flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
        padding: "10px 14px", fontSize: 14, outline: "none",
        color: "var(--title)", background: "#F8FAFC"
    };

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="applications" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="wrapper">
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4 }}>Applications</h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>Review and manage candidate applications for your studies</p>
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

                {applications.length > 0 && (
                    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                        {[["ALL", applications.length], ["PENDING", counts.PENDING || 0], ["APPROVED", counts.APPROVED || 0], ["REJECTED", counts.REJECTED || 0]].map(([key, count]) => (
                            <button key={key} onClick={() => setFilter(key)} style={{
                                background: filter === key ? "var(--linear-blue)" : "#fff",
                                color: filter === key ? "#fff" : "var(--content)",
                                border: `1.5px solid ${filter === key ? "transparent" : "#E8ECF4"}`,
                                borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600
                            }}>{key} · {count}</button>
                        ))}
                    </div>
                )}

                {loading ? <LoadingSkeleton /> : filtered.length === 0 && studyId ? (
                    <EmptyState message="No applications found for this study." />
                ) : !studyId ? (
                    <EmptyState message="Select a study to view applications." />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {filtered.map(app => (
                            <ApplicationRow key={app.applicationId} app={app}
                                            onApprove={() => handleApprove(app.applicationId)}
                                            onReject={() => { setRejectModal(app.applicationId); setRejectReason(""); }}
                                            loading={actionLoading[app.applicationId]} />
                        ))}
                    </div>
                )}
            </div>

            {rejectModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}
                     onClick={() => setRejectModal(null)}>
                    <div style={{ background: "#fff", borderRadius: "var(--radius)", padding: 28, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 8 }}>Reject Application</h3>
                        <p style={{ fontSize: 13, color: "var(--content)", marginBottom: 16 }}>Please provide a reason for rejection.</p>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={3}
                                  style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit" }} />
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button onClick={() => setRejectModal(null)} style={{ flex: 1, padding: "10px", border: "1.5px solid #E2E8F0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--content)" }}>Cancel</button>
                            <button onClick={handleReject} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#FEE2E2", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#B91C1C" }}>Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ApplicationRow({ app, onApprove, onReject, loading }) {
    const s = STATUS_COLORS[app.status] || STATUS_COLORS.PENDING;
    const isPending = app.status === "PENDING";
    return (
        <div style={{ background: "#fff", borderRadius: "var(--medium-radius)", padding: "16px 20px", border: "1px solid #E8ECF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 16 }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
             onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--blue-text)", flexShrink: 0 }}>
                {app.participantId?.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--title)", marginBottom: 3 }}>{app.participantId}</div>
                <div style={{ fontSize: 12, color: "var(--content)" }}>Applied {new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
            </div>
            <div style={{ background: s.bg, color: s.text, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{app.status}
            </div>
            {isPending && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={onApprove} disabled={!!loading} style={{ background: "#F0FDF4", color: "#15803D", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1 }}>
                        <CheckCircle size={14} />{loading === "approve" ? "..." : "Approve"}
                    </button>
                    <button onClick={onReject} disabled={!!loading} style={{ background: "#FEF2F2", color: "#B91C1C", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, opacity: loading ? 0.6 : 1 }}>
                        <XCircle size={14} />Reject
                    </button>
                </div>
            )}
            {app.status === "APPROVED" && !app.participationStarted && (
                <button onClick={onApprove} style={{ background: "var(--linear-blue)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <Play size={14} /> Start
                </button>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: "var(--medium-radius)", padding: "16px 20px", border: "1px solid #E8ECF4", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F0F4FA" }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ width: "60%", height: 12, background: "#F0F4FA", borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ width: "40%", height: 10, background: "#F0F4FA", borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 80, height: 28, background: "#F0F4FA", borderRadius: 20 }} />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid #E8ECF4" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Clock size={22} color="var(--blue-text)" />
            </div>
            <p style={{ color: "var(--content)", fontSize: 14 }}>{message}</p>
        </div>
    );
}
