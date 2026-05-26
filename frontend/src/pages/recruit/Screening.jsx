import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getApplicationsByStudy, reviewApplication, startParticipation } from "../../api/RecruitmentApi";
import { ChevronRight, CheckCircle, XCircle, SkipForward } from "lucide-react";

const STATUS_STYLES = {
    PENDING:       { bg: "#FFF7ED", color: "#C2410C" },
    APPROVED:      { bg: "#F0FDF4", color: "#15803D" },
    REJECTED:      { bg: "#FEF2F2", color: "#B91C1C" },
    SCREENING:     { bg: "#EFF6FF", color: "#1D4ED8" },
};

export default function Screening() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [inputId, setInputId] = useState("");
    const [studyId, setStudyId] = useState("");
    const [applications, setApplications] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showReject, setShowReject] = useState(false);

    const fetchApplications = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await getApplicationsByStudy(id);
            setApplications(res.data);
            if (res.data.length > 0) setSelected(res.data[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await reviewApplication(selected.applicationId, { approved: true, rejectionReason: null });
            await startParticipation(selected.applicationId);
            const updated = applications.map(a =>
                a.applicationId === selected.applicationId ? { ...a, status: "APPROVED" } : a
            );
            setApplications(updated);
            setSelected({ ...selected, status: "APPROVED" });
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selected) return;
        setActionLoading(true);
        try {
            await reviewApplication(selected.applicationId, { approved: false, rejectionReason: rejectReason });
            const updated = applications.map(a =>
                a.applicationId === selected.applicationId ? { ...a, status: "REJECTED" } : a
            );
            setApplications(updated);
            setSelected({ ...selected, status: "REJECTED" });
            setShowReject(false);
            setRejectReason("");
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSkip = () => {
        const idx = applications.findIndex(a => a.applicationId === selected?.applicationId);
        if (idx < applications.length - 1) setSelected(applications[idx + 1]);
    };

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="screening" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper" style={{ padding: 0, display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>

                {/* Study ID Bar */}
                <div style={{
                    padding: "16px 24px", background: "#fff",
                    borderBottom: "1px solid #E8ECF4",
                    display: "flex", gap: 12, alignItems: "center"
                }}>
                    <input
                        value={inputId}
                        onChange={e => setInputId(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (setStudyId(inputId), fetchApplications(inputId))}
                        placeholder="Search applicants by Study ID..."
                        style={{
                            flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
                            padding: "9px 14px", fontSize: 14, outline: "none",
                            color: "var(--title)", background: "#F8FAFC"
                        }}
                        onFocus={e => e.target.style.borderColor = "#7073FF"}
                        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                    />
                    <button onClick={() => { setStudyId(inputId); fetchApplications(inputId); }} style={{
                        background: "var(--linear-blue)", color: "#fff", border: "none",
                        borderRadius: 8, padding: "9px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>Load</button>
                </div>

                {!studyId ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--content)", fontSize: 14 }}>
                        Enter a Study ID to start screening applicants.
                    </div>
                ) : loading ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--content)" }}>Loading...</div>
                ) : (
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr", overflow: "hidden" }}>

                        {/* Left — Applicant List */}
                        <div style={{ borderRight: "1px solid #E8ECF4", overflowY: "auto", background: "#FAFBFD" }}>
                            {applications.length === 0 ? (
                                <div style={{ padding: 24, textAlign: "center", color: "var(--content)", fontSize: 13 }}>
                                    No applicants found.
                                </div>
                            ) : applications.map(app => {
                                const s = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING;
                                const isActive = selected?.applicationId === app.applicationId;
                                return (
                                    <div key={app.applicationId}
                                         onClick={() => setSelected(app)}
                                         style={{
                                             padding: "14px 16px", cursor: "pointer",
                                             background: isActive ? "#EEF0FF" : "transparent",
                                             borderBottom: "1px solid #F0F4FA",
                                             display: "flex", alignItems: "center", gap: 12,
                                             transition: "background 0.15s"
                                         }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: "50%",
                                            background: "var(--linear-blue)", color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 12, fontWeight: 700, flexShrink: 0
                                        }}>
                                            {app.participantId?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--title)", marginBottom: 2 }}>
                                                {app.participantId?.slice(0, 12)}...
                                            </div>
                                            <span style={{
                                                background: s.bg, color: s.color,
                                                borderRadius: 4, padding: "1px 7px",
                                                fontSize: 10, fontWeight: 700
                                            }}>{app.status}</span>
                                        </div>
                                        {isActive && <ChevronRight size={14} color="var(--blue-text)" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right — Applicant Detail */}
                        {selected && (
                            <div style={{ overflowY: "auto", display: "grid", gridTemplateColumns: "300px 1fr" }}>

                                {/* Profile Panel */}
                                <div style={{ borderRight: "1px solid #E8ECF4", padding: "24px 20px" }}>
                                    {/* Avatar */}
                                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                                        <div style={{
                                            width: 80, height: 80, borderRadius: "50%",
                                            background: "var(--linear-blue)", color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 24, fontWeight: 700, margin: "0 auto 12px"
                                        }}>
                                            {selected.participantId?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--title)" }}>
                                            Participant
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--content)", marginTop: 2 }}>
                                            {selected.participantId?.slice(0, 16)}...
                                        </div>
                                    </div>

                                    {/* Application Info */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 10, textTransform: "uppercase" }}>
                                            Application Info
                                        </div>
                                        {[
                                            ["Status", selected.status],
                                            ["Applied", new Date(selected.appliedAt).toLocaleDateString("en-GB")],
                                            ["Phase", selected.phaseId?.slice(0, 8) + "..."],
                                        ].map(([label, value]) => (
                                            <div key={label} style={{
                                                display: "flex", justifyContent: "space-between",
                                                padding: "8px 0", borderBottom: "1px solid #F0F4FA", fontSize: 13
                                            }}>
                                                <span style={{ color: "var(--content)" }}>{label}</span>
                                                <span style={{ fontWeight: 600, color: "var(--title)" }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{
                                        background: STATUS_STYLES[selected.status]?.bg || "#FFF7ED",
                                        color: STATUS_STYLES[selected.status]?.color || "#C2410C",
                                        borderRadius: 8, padding: "8px 12px",
                                        fontSize: 12, fontWeight: 700, textAlign: "center"
                                    }}>
                                        {selected.status}
                                    </div>
                                </div>

                                {/* Right Panel — Questionnaire */}
                                <div style={{ padding: "24px 28px" }}>
                                    {/* Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                                        <div>
                                            <span style={{
                                                background: "var(--background-blue)", color: "var(--blue-text)",
                                                borderRadius: 4, padding: "3px 10px", fontSize: 11, fontWeight: 700
                                            }}>APPLICATION DETAILS</span>
                                            <div style={{ fontSize: 13, color: "var(--content)", marginTop: 6 }}>
                                                Screening Responses
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right", fontSize: 11, color: "var(--content)" }}>
                                            <div style={{ fontWeight: 700, letterSpacing: "0.05em" }}>APPLIED AT</div>
                                            <div style={{ marginTop: 2 }}>
                                                {new Date(selected.appliedAt).toLocaleString("en-GB")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application ID Info */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--content)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            01. Application ID
                                        </div>
                                        <div style={{
                                            background: "#F8FAFC", borderRadius: 8, padding: "14px 16px",
                                            fontSize: 13, color: "var(--title)", fontFamily: "monospace",
                                            border: "1px solid #E8ECF4"
                                        }}>
                                            {selected.applicationId}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--content)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            02. Participant ID
                                        </div>
                                        <div style={{
                                            background: "#F8FAFC", borderRadius: 8, padding: "14px 16px",
                                            fontSize: 13, color: "var(--title)", fontFamily: "monospace",
                                            border: "1px solid #E8ECF4"
                                        }}>
                                            {selected.participantId}
                                        </div>
                                    </div>

                                    {/* Internal Notes */}
                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--content)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 5 }}>
                                            ✏️ Internal Reviewer Notes
                                        </div>
                                        <textarea
                                            placeholder="Add internal observations about this candidate's fit..."
                                            rows={3}
                                            style={{
                                                width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
                                                padding: "10px 14px", fontSize: 13, resize: "none", outline: "none",
                                                fontFamily: "inherit", color: "var(--title)", background: "#F8FAFC"
                                            }}
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                                        {["#HighPotential", "#ExpertiseMatch", "#Referral"].map(tag => (
                                            <span key={tag} style={{
                                                background: "var(--background-blue)", color: "var(--blue-text)",
                                                borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600
                                            }}>{tag}</span>
                                        ))}
                                    </div>

                                    {/* Reject reason modal */}
                                    {showReject && (
                                        <div style={{
                                            background: "#FEF2F2", borderRadius: 10, padding: 16,
                                            marginBottom: 16, border: "1px solid #FECACA"
                                        }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#B91C1C", marginBottom: 8 }}>Reason for rejection</div>
                                            <textarea
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                placeholder="Enter rejection reason..."
                                                rows={2}
                                                style={{
                                                    width: "100%", border: "1px solid #FECACA", borderRadius: 6,
                                                    padding: "8px 12px", fontSize: 13, resize: "none", outline: "none",
                                                    fontFamily: "inherit"
                                                }}
                                            />
                                            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                                <button onClick={() => setShowReject(false)} style={{
                                                    flex: 1, padding: "8px", border: "1px solid #E2E8F0",
                                                    borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13
                                                }}>Cancel</button>
                                                <button onClick={handleReject} disabled={actionLoading} style={{
                                                    flex: 1, padding: "8px", border: "none",
                                                    borderRadius: 6, background: "#FEE2E2", cursor: "pointer",
                                                    fontSize: 13, fontWeight: 600, color: "#B91C1C"
                                                }}>Confirm Reject</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {selected.status === "PENDING" && (
                                        <div style={{ display: "flex", gap: 10 }}>
                                            <button onClick={handleSkip} style={{
                                                background: "none", border: "1.5px solid #E8ECF4", borderRadius: 10,
                                                padding: "12px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600,
                                                color: "var(--content)", display: "flex", alignItems: "center", gap: 5
                                            }}>
                                                <SkipForward size={14} /> Skip for now
                                            </button>
                                            <button onClick={() => { setShowReject(true); }} style={{
                                                flex: 1, background: "#FEE2E2", color: "#B91C1C",
                                                border: "none", borderRadius: 10, padding: "12px",
                                                fontWeight: 700, fontSize: 14, cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5
                                            }}>
                                                <XCircle size={15} /> Reject Applicant
                                            </button>
                                            <button onClick={handleApprove} disabled={actionLoading} style={{
                                                flex: 1, background: "var(--linear-blue)", color: "#fff",
                                                border: "none", borderRadius: 10, padding: "12px",
                                                fontWeight: 700, fontSize: 14, cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                                opacity: actionLoading ? 0.6 : 1
                                            }}>
                                                <CheckCircle size={15} /> {actionLoading ? "Processing..." : "Approve & Invite"}
                                            </button>
                                        </div>
                                    )}

                                    {selected.status !== "PENDING" && (
                                        <div style={{
                                            textAlign: "center", padding: "14px",
                                            background: selected.status === "APPROVED" ? "#F0FDF4" : "#FEF2F2",
                                            borderRadius: 10, fontWeight: 700, fontSize: 14,
                                            color: selected.status === "APPROVED" ? "#15803D" : "#B91C1C"
                                        }}>
                                            {selected.status === "APPROVED" ? "✓ Approved & Invited" : "✗ Rejected"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
