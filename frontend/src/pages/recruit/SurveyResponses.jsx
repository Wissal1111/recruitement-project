import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import ResponseApi from "../../api/ResponseApi";
import { getMyStudies, getStudyById } from "../../api/StudyApi";
import {
    BarChart2, CheckCircle2, Layers, Users, FileText,
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    GitBranch, Activity, Send, Eye, Lock, AlertCircle,Download
} from "lucide-react";
import "./SurveyResponses.css";
import { getProfileBasic, getProfileById } from "../../api/ProfileApi";
// ─── Survey List Page ────────────────────────────────────────────────────────
export function MySurveyResponsesList() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [studies, setStudies] = useState([]);
    const [statsMap, setStatsMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyStudies()
            .then(async (data) => {
                const all = data?.studies || data || [];
                const list = all.filter((s) => s.studyStatus === "PUBLISHED");
                setStudies(list);
                const entries = await Promise.all(
                    list.map(async (s) => {
                        try {
                            const res = await ResponseApi.getStudyStats(s.studyId);
                            return [s.studyId, res.data || res];
                        } catch {
                            return [s.studyId, null];
                        }
                    })
                );
                setStatsMap(Object.fromEntries(entries));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="surveyresponses" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper sr-wrapper">
                <div className="sr-header">
                    <h1 className="sr-title">
                        <BarChart2 size={20} color="var(--blue-text)" />
                        Survey <span>Responses</span>
                    </h1>
                    <p className="sr-subtitle">Track responses across all your published studies</p>
                </div>

                {loading ? (
                    <div className="sr-loading">
                        <div className="sr-spinner" />
                        <p>Loading studies…</p>
                    </div>
                ) : studies.length === 0 ? (
                    <div className="sr-empty">
                        <div className="sr-empty-icon">
                            <FileText size={24} color="var(--blue-text)" />
                        </div>
                        <p style={{ fontWeight: 600, color: "var(--title)", marginBottom: 4 }}>No published studies yet</p>
                        <p style={{ fontSize: 13 }}>Publish a study to start seeing responses here.</p>
                    </div>
                ) : (
                    <div className="sr-grid">
                        {studies.map((study) => {
                            const stats = statsMap[study.studyId];
                            const total = stats?.totalResponses ?? 0;
                            const submitted = stats?.submitted ?? 0;
                            const phases = study.phases?.length ?? 0;

                            return (
                                <div
                                    key={study.studyId}
                                    className="sr-card"
                                    onClick={() => navigate(`/recruit/responses/${study.studyId}`)}
                                >
                                    <div className="sr-card-top">
                                        <div className="sr-card-badges">
                                            <span className="sr-badge sr-badge--published">{study.studyStatus}</span>
                                            <span className="sr-badge sr-badge--category">{study.studyCategory}</span>
                                        </div>
                                        <span className="sr-card-phases">
                                            <Layers size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
                                            {phases} phase{phases !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className="sr-card-body">
                                        <h2 className="sr-card-title">{study.title}</h2>
                                        {study.description && (
                                            <p className="sr-card-desc">{study.description}</p>
                                        )}
                                    </div>

                                    <div className="sr-card-stats">
                                        <div className="sr-stat">
                                            <span className="sr-stat-value">{total}</span>
                                            <span className="sr-stat-label">Total</span>
                                        </div>
                                        <div className="sr-stat-divider" />
                                        <div className="sr-stat">
                                            <span className="sr-stat-value sr-stat-value--green">{submitted}</span>
                                            <span className="sr-stat-label">Submitted</span>
                                        </div>
                                        <div className="sr-stat-divider" />
                                        <div className="sr-stat">
                                            <span className="sr-stat-value sr-stat-value--blue">{phases}</span>
                                            <span className="sr-stat-label">Phases</span>
                                        </div>
                                    </div>

                                    <div className="sr-card-footer">
                                        <button
                                            className="sr-btn-view"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/recruit/responses/${study.studyId}`); }}
                                        >
                                            View Responses <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Study Analytics Page ────────────────────────────────────────────────────
export function StudyResponsesAnalytics() {
    const { studyId } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [study, setStudy] = useState(null);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [activePhase, setActivePhase] = useState(null);
    const [phaseResponses, setPhaseResponses] = useState([]);
    const [expandedResponse, setExpandedResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profilesMap, setProfilesMap] = useState({});

useEffect(() => {
    if (!activePhase) return;
    const phase = study?.phases?.find(p => p.phaseId === activePhase);
    if (!phase || (phase.status !== "ACTIVE" && phase.status !== "COMPLETED")) {
        setPhaseResponses([]);
        return;
    }
    setPhaseResponses([]);
    ResponseApi.getResponsesByPhase(studyId, activePhase)
        .then(async (res) => {
            const raw = res?.data || res;
            const arr = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.responses)
                    ? raw.responses
                    : Array.isArray(raw?.data)
                        ? raw.data
                        : [];
            const submitted = arr.filter((r) => r.status === "SUBMITTED");
            setPhaseResponses(submitted);

            const uniqueUserIds = [...new Set(
                submitted.map(r => r.participantId || r.userId).filter(Boolean)
            )];
            const entries = await Promise.all(
                uniqueUserIds.map(async (uid) => {
                    try {
                        const data = await getProfileBasic(uid);
                        return [uid, data];
                    } catch {
                        return [uid, null];
                    }
                })
            );
            setProfilesMap(Object.fromEntries(entries));
        })
        .catch(() => setPhaseResponses([]));
}, [activePhase, studyId, study]);
    useEffect(() => {
        Promise.all([
            getStudyById(studyId),
            ResponseApi.getStudyStats(studyId),
            ResponseApi.getStudyAnalytics(studyId),
        ])
            .then(([studyRes, statsRes, analyticsRes]) => {
                const s = studyRes?.data || studyRes;
                setStudy(s);
                setStats(statsRes?.data || statsRes);
                setAnalytics(analyticsRes?.data || analyticsRes);
                // default to first ACTIVE phase, else first phase
                if (s?.phases?.length) {
                    const sorted = [...s.phases].sort((a, b) => a.phaseOrder - b.phaseOrder);
                    const firstActive = sorted.find(p => p.status === "ACTIVE" || p.status === "COMPLETED");
                    setActivePhase((firstActive || sorted[0]).phaseId);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [studyId]);

    useEffect(() => {
        if (!activePhase) return;
        const phase = study?.phases?.find(p => p.phaseId === activePhase);
        if (!phase || (phase.status !== "ACTIVE" && phase.status !== "COMPLETED")) {
            setPhaseResponses([]);
            return;
        }
        setPhaseResponses([]);
        ResponseApi.getResponsesByPhase(studyId, activePhase)
            .then((res) => {
                const raw = res?.data || res;
                const arr = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.responses)
                        ? raw.responses
                        : Array.isArray(raw?.data)
                            ? raw.data
                            : [];
                setPhaseResponses(arr.filter((r) => r.status === "SUBMITTED"));
            })
            .catch(() => setPhaseResponses([]));
    }, [activePhase, studyId, study]);

    const activePhaseObj = study?.phases?.find((p) => p.phaseId === activePhase);
    const isActiveOrCompleted = activePhaseObj?.status === "ACTIVE" || activePhaseObj?.status === "COMPLETED";

    // strict filter — only questions belonging to this phase
    const phaseAnalytics = (() => {
        if (!analytics?.questionAnalytics || !activePhaseObj) return [];
        const phaseQuestionIds = new Set(
            activePhaseObj.questions?.map((q) => q.questionId) ?? []
        );
        return analytics.questionAnalytics.filter((q) =>
            phaseQuestionIds.has(q.questionId)
        );
    })();

    if (loading) {
        return (
            <div className="dashboard">
                <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <SideBar page="surveyresponses" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="wrapper sr-wrapper">
                    <div className="sr-loading"><div className="sr-spinner" /><p>Loading analytics…</p></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="surveyresponses" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper sr-wrapper">
                <button className="sr-back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={15} /> Back to Surveys
                </button>

                {/* Study Header */}
                <div className="sr-analytics-header">
                    <div className="sr-analytics-header-left">
                        <div className="sr-badges-row">
                            <span className="sr-badge sr-badge--published">{study?.studyStatus}</span>
                            <span className="sr-badge sr-badge--category">{study?.studyCategory}</span>
                            {study?.isMultiPhase && (
                                <span className="sr-badge sr-badge--multi">
                                    <GitBranch size={10} /> Multi-phase
                                </span>
                            )}
                        </div>
                        <h1 className="sr-title">{study?.title} <span>Analytics</span></h1>
                        {study?.description && <p className="sr-subtitle">{study.description}</p>}
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="sr-overview-cards">
                    <div className="sr-ov-card">
                        <div className="sr-ov-icon"><Send size={18} color="var(--blue-text)" /></div>
                        <div>
                            <div className="sr-ov-value">{stats?.totalResponses ?? 0}</div>
                            <div className="sr-ov-label">Total Responses</div>
                        </div>
                    </div>
                    <div className="sr-ov-card">
                        <div className="sr-ov-icon"><CheckCircle2 size={18} color="#15803D" /></div>
                        <div>
                            <div className="sr-ov-value" style={{ color: "#15803D" }}>{stats?.submitted ?? 0}</div>
                            <div className="sr-ov-label">Submitted</div>
                        </div>
                    </div>
                    <div className="sr-ov-card">
                        <div className="sr-ov-icon"><Layers size={18} color="var(--blue-text)" /></div>
                        <div>
                            <div className="sr-ov-value">{study?.phases?.length ?? 0}</div>
                            <div className="sr-ov-label">Phases</div>
                        </div>
                    </div>
                    <div className="sr-ov-card">
                        <div className="sr-ov-icon"><Users size={18} color="var(--blue-text)" /></div>
                        <div>
                            <div className="sr-ov-value">
                                {study?.phases?.reduce((acc, p) => acc + (p.maxParticipants ?? 0), 0) ?? 0}
                            </div>
                            <div className="sr-ov-label">Max Participants</div>
                        </div>
                    </div>
                </div>

                {/* Phase Tabs */}
                {study?.phases?.length > 0 && (
                    <div className="sr-phase-tabs">
                        {[...study.phases]
                            .sort((a, b) => a.phaseOrder - b.phaseOrder)
                            .map((phase) => {
                                const phaseStats = stats?.perPhase?.find((p) => p.phaseId === phase.phaseId);
                                const isInactive = phase.status !== "ACTIVE" && phase.status !== "COMPLETED";

                                return (
                                    <button
                                        key={phase.phaseId}
                                        className={[
                                            "sr-phase-tab",
                                            activePhase === phase.phaseId ? "sr-phase-tab--active" : "",
                                            isInactive ? "sr-phase-tab--locked" : "",
                                        ].join(" ").trim()}
                                        onClick={() => {
                                            if (isInactive) return;
                                            setActivePhase(phase.phaseId);
                                        }}
                                        title={isInactive ? "Activate this phase first to view responses" : ""}
                                    >
                                        <span className="sr-phase-tab-order">Phase {phase.phaseOrder}</span>
                                        <span className="sr-phase-tab-title">{phase.title}</span>
                                        {isInactive ? (
                                            <span className="sr-phase-tab-locked">
                                                <Lock size={10} /> Not active
                                            </span>
                                        ) : (
                                            <span className="sr-phase-tab-count">
                                                {phaseStats?.submitted ?? 0} submitted
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                )}

                {/* Phase Content */}
                {activePhaseObj && (
                    <div className="sr-phase-content">

                        {/* Phase meta bar */}
                        <div className="sr-phase-meta">
                            <div className="sr-phase-meta-info">
                                <span className="sr-badge sr-badge--type">{activePhaseObj.phaseType}</span>
                                <span className="sr-phase-meta-text">
                                    {activePhaseObj.title} · {activePhaseObj.questions?.length ?? 0} questions · Max {activePhaseObj.maxParticipants} participants · {parseFloat(activePhaseObj.rewardAmount?.$numberDecimal ?? activePhaseObj.rewardAmount ?? 0)} pts
                                </span>
                            </div>
                            <span className={`sr-badge sr-badge--${activePhaseObj.status?.toLowerCase()}`}>
                                <Activity size={10} style={{ marginRight: 3 }} />
                                {activePhaseObj.status}
                            </span>
                        </div>

                        {/* Inactive notice */}
                        {!isActiveOrCompleted && (
                            <div style={{
                                background: "#FFF7ED", border: "1px solid #FED7AA",
                                borderRadius: "var(--medium-radius)", padding: "16px 20px",
                                display: "flex", alignItems: "center", gap: 10,
                                fontSize: 13, color: "#C2410C", fontWeight: 500
                            }}>
                                <AlertCircle size={16} color="#C2410C" />
                                This phase is not active yet. Activate it from your study settings so participants can respond and analytics appear here.
                            </div>
                        )}

                        {isActiveOrCompleted && (
                            <>
                                {/* Question Analytics */}
                                {phaseAnalytics.length > 0 ? (
                                    <div className="sr-section">
                                        <h3 className="sr-section-title">
                                            <BarChart2 size={16} color="var(--blue-text)" />
                                            Question Analytics
                                        </h3>
                                        <div className="sr-questions-list">
                                            {phaseAnalytics.map((q) => (
                                                <QuestionAnalyticsCard key={q.questionId} question={q} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="sr-empty-phase">
                                        No responses yet — analytics will appear once participants submit.
                                    </div>
                                )}

                                {/* Individual Responses */}
                                <div className="sr-section">
                                    <h3 className="sr-section-title">
    <FileText size={16} color="var(--blue-text)" />
    Submitted Responses
    <span className="sr-section-count">{phaseResponses.length}</span>
    {phaseResponses.length > 0 && (
        <button
            className="sr-export-btn"
            onClick={async () => {
                try {
                    const res = await ResponseApi.exportPhaseResponses(studyId, activePhase);
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `responses_${activePhase}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                } catch {
                    alert("Export failed.");
                }
            }}
        >
            <Download size={13} /> Export Excel
        </button>
    )}
</h3>
                                    {phaseResponses.length === 0 ? (
                                        <div className="sr-empty-phase">
                                            No submitted responses for this phase yet.
                                        </div>
                                    ) : (
                                        <div className="sr-responses-list">
                                          {phaseResponses.map((resp, i) => (
    <ParticipantResponseRow
        key={resp.responseId || resp._id}
        resp={resp}
        index={i}
        expandedResponse={expandedResponse}
        setExpandedResponse={setExpandedResponse}
        initialProfile={profilesMap[resp.participantId || resp.userId] ?? null}
    />
))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

import { X, User } from "lucide-react";

function ParticipantResponseRow({ resp, index, expandedResponse, setExpandedResponse, initialProfile }) {
    const respId = resp.responseId || resp._id;
    const userId = resp.participantId || resp.userId;
    const [profile, setProfile] = useState(null);
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
            const data = await getProfileById(userId);
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

const fullName = profile
    ? `${profile.firstname} ${profile.lastname}`
    : null;

const subLine = profile
    ? [profile?.profile?.profession, profile?.profile?.country].filter(Boolean).join(" · ")
    : null;

    const calcAge = (dob) => {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    const age = fullProfile?.profile?.age ?? calcAge(fullProfile?.profile?.dateOfBirth);

    return (
        <>
            <div className="sr-response-row">
                <div
                    className="sr-response-row-header"
                    onClick={() => setExpandedResponse(expandedResponse === respId ? null : respId)}
                >
                    <div className="sr-response-row-left">
                        <span className="sr-response-num">#{index + 1}</span>
                        <div className="sr-participant-avatar">{initials}</div>
                        <div>
    {fullName
        ? <div className="sr-participant-name">{fullName}</div>
        : <div className="sr-skeleton sr-skeleton--name" />
    }
    {subLine
        ? <div className="sr-participant-sub">{subLine}</div>
        : <div className="sr-skeleton sr-skeleton--sub" />
    }
</div>
                    </div>
                    <div className="sr-response-row-right">
                        <span className="sr-badge sr-badge--published">Submitted</span>
                        <span className="sr-response-date">
                            {new Date(resp.submittedAt || resp.updatedAt || resp.createdAt).toLocaleDateString()}
                        </span>
                        <button className="sr-see-profile-btn" onClick={handleSeeProfile}>
                            <User size={12} /> See profile
                        </button>
                        <span className="sr-expand-icon">
                            {expandedResponse === respId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                    </div>
                </div>

                {expandedResponse === respId && (
                    <div className="sr-response-answers">
                        {resp.answers?.map((ans) => {
                            const q = resp.snapshot?.questions?.find(sq => sq.questionId === ans.questionId);
                            return (
                                <div key={ans.questionId} className="sr-answer-item">
                                    <p className="sr-answer-question">{q?.text ?? ans.questionId}</p>
                                    <p className="sr-answer-value">
                                        {Array.isArray(ans.value) ? ans.value.join(", ") : String(ans.value ?? "—")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="sr-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="sr-modal" onClick={e => e.stopPropagation()}>
                        <div className="sr-modal-header">
                            <div className="sr-modal-avatar">{initials}</div>
                            <div>
                                <p className="sr-modal-name">{fullName}</p>
                                <p className="sr-modal-email">{fullProfile?.email ?? "—"}</p>
                            </div>
                            <button className="sr-modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        {fullProfileLoading ? (
                            <div className="sr-modal-loading"><div className="sr-spinner" /><p>Loading profile…</p></div>
                        ) : fullProfile ? (
                            <div className="sr-modal-body">
                                {[
                                    ["Age",            age ? `${age} years` : null],
                                    ["Gender",         fullProfile.profile?.gender],
                                    ["Education",      fullProfile.profile?.education],
                                    ["Profession",     fullProfile.profile?.profession],
                                    ["Location",       [fullProfile.profile?.city, fullProfile.profile?.country].filter(Boolean).join(", ")],
                                    ["Total earnings", `${fullProfile.profile?.totalEarnings ?? 0} pts`],
                                ].map(([label, value]) => (
                                    <div key={label} className="sr-modal-field">
                                        <div className="sr-modal-field-label">{label}</div>
                                        <div className={`sr-modal-field-value${!value ? " sr-modal-field-empty" : ""}`}>
                                            {value || "Not provided"}
                                        </div>
                                    </div>
                                ))}
                                <div className="sr-modal-field sr-modal-field--full">
                                    <div className="sr-modal-field-label">Bio</div>
                                    <div className={`sr-modal-field-value${!fullProfile.profile?.bio ? " sr-modal-field-empty" : ""}`}>
                                        {fullProfile.profile?.bio || "No bio provided"}
                                    </div>
                                </div>
                                <div className="sr-modal-field sr-modal-field--full">
                                    <div className="sr-modal-field-label">Member since</div>
                                    <div className="sr-modal-field-value">
                                        {new Date(fullProfile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sr-modal-loading"><p>Could not load profile.</p></div>
                        )}

                        <div className="sr-modal-footer">
                            <button className="sr-modal-close-btn" onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
// ─── Question Analytics Card ─────────────────────────────────────────────────
function QuestionAnalyticsCard({ question }) {
    const { questionText, questionType, totalAnswers, distribution } = question;
    const entries = Object.entries(distribution ?? {}).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] ?? 1;
    const isChart = ["MULTIPLE_CHOICE", "SINGLE_CHOICE", "YES_NO", "RATING_SCALE"].includes(questionType);

    return (
        <div className="sr-q-card">
            <div className="sr-q-card-header">
                <span className="sr-q-type">{questionType.replace(/_/g, " ")}</span>
                <span className="sr-q-count">{totalAnswers} answers</span>
            </div>
            <p className="sr-q-text">{questionText}</p>

            {isChart && entries.length > 0 ? (
                <div className="sr-q-bars">
                    {entries.map(([label, count]) => (
                        <div key={label} className="sr-q-bar-row">
                            <span className="sr-q-bar-label">{label}</span>
                            <div className="sr-q-bar-track">
                                <div
                                    className="sr-q-bar-fill"
                                    style={{ width: `${(count / max) * 100}%` }}
                                />
                            </div>
                            <span className="sr-q-bar-val">
                                {count}{" "}
                                <span className="sr-q-bar-pct">
                                    ({Math.round((count / totalAnswers) * 100)}%)
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="sr-q-text-answers">
                    {entries.slice(0, 5).map(([val]) => (
                        <div key={val} className="sr-q-text-answer-item">{val}</div>
                    ))}
                    {entries.length > 5 && (
                        <p className="sr-q-more">+{entries.length - 5} more unique answers</p>
                    )}
                </div>
            )}
        </div>
    );
}