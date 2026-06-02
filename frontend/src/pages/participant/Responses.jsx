import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import TopNavBar from "../../components/TopNavBar";
import ResponseApi from "../../api/ResponseApi";
import * as RecruitmentApi from "../../api/RecruitmentApi";
import { getStudyByIdPublic } from "../../api/StudyApi";
import {
    FileText, CheckCircle2, Clock, ChevronRight, BookOpen,ChevronLeft ,
    Lock, PlayCircle, AlertCircle, Search,
    Calendar, Award, Users, Layers, Eye, GitBranch, Tag
} from "lucide-react";
import "./Responses.css";

const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const PHASE_STATUS_CONFIG = {
    ACTIVE:    { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Active" },
    PENDING:   { bg: "#FFF7ED", color: "#C2410C", dot: "#FB923C", label: "Pending" },
    COMPLETED: { bg: "var(--background-blue)", color: "var(--blue-text)", dot: "#7073FF", label: "Completed" },
};

const CATEGORY_COLORS = {
    USABILITY:  { bg: "#EDE9FE", color: "#7C3AED" },
    SURVEY:     { bg: "var(--background-blue)", color: "var(--blue-text)" },
    EXPERIMENT: { bg: "#FEF9C3", color: "#A16207" },
    INTERVIEW:  { bg: "#FCE7F3", color: "#9D174D" },
    OTHER:      { bg: "#F1F5F9", color: "#475569" },
};

function unwrapList(res) {
    const d = res?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    return [];
}

// ── StudyPhaseView ───────────────────────────────────────────────────────────
function StudyPhaseView({ studyId, navigate }) {
    const [study, setStudy]         = useState(null);
    const [drafts, setDrafts]       = useState({});
    const [submitted, setSubmitted] = useState({});
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            RecruitmentApi.getMyParticipations().catch(() => ({ data: [] })),
            ResponseApi.getMyDraftsByStudyId(studyId).catch(() => ({ data: [] })),
            ResponseApi.getMyResponses().catch(() => ({ data: [] })),
            ResponseApi.getMyResponsesGroupedByStudy().catch(() => ({ data: [] })),
        ])
            .then(async ([participationsRes, draftsRes, allResponsesRes, groupedRes]) => {
                const participations = unwrapList(participationsRes);

                const match = participations.find(
                    p => String(p.studyId) === String(studyId) || String(p.study?.studyId) === String(studyId)
                );

                let studyData = null;

                if (match) {
                    const sd = match.study || match;
                    if (sd.title || sd.studyTitle) {
                        studyData = {
                            studyId:       sd.studyId || studyId,
                            title:         sd.title || sd.studyTitle,
                            description:   sd.description,
                            studyCategory: sd.studyCategory,
                            studyStatus:   sd.studyStatus,
                            isMultiPhase:  sd.isMultiPhase,
                            startDate:     sd.startDate,
                            endDate:       sd.endDate,
                            phases:        sd.phases || [],
                        };
                    }
                }

                if (!studyData) {
                    const groups = unwrapList(groupedRes);
                    const group  = groups.find(g => String(g.studyId) === String(studyId));
                    if (group && (group.studyTitle || group.title)) {
                        studyData = {
                            studyId,
                            title:         group.studyTitle || group.title,
                            studyCategory: group.studyCategory,
                            studyStatus:   group.studyStatus,
                            isMultiPhase:  group.isMultiPhase,
                            startDate:     group.startDate,
                            endDate:       group.endDate,
                            phases:        group.phases || [],
                        };
                    }
                }

                if (!studyData || !studyData.phases?.length) {
                    try {
                        const raw = await getStudyByIdPublic(studyId);
                        if (raw && (raw.studyId || raw._id)) {
                            studyData = {
                                studyId:       raw.studyId || studyId,
                                title:         raw.title || raw.studyTitle || "Study",
                                description:   raw.description,
                                studyCategory: raw.studyCategory,
                                studyStatus:   raw.studyStatus || raw.status,
                                isMultiPhase:  raw.isMultiPhase,
                                startDate:     raw.startDate,
                                endDate:       raw.endDate,
                                phases:        raw.phases || raw.studyPhases || [],
                            };
                        }
                    } catch (studyErr) {
                        console.warn("getStudyByIdPublic failed:", studyErr?.response?.data || studyErr.message);
                    }
                }

                if (!studyData) {
                    setError("Study not found. You may not be enrolled in this study.");
                    return;
                }

                setStudy(studyData);

                const draftMap = {};
                unwrapList(draftsRes).forEach(r => {
                    if (r.phaseId) draftMap[r.phaseId] = r.responseId;
                });
                setDrafts(draftMap);

                const submittedMap = {};
                unwrapList(allResponsesRes)
                    .filter(r => String(r.studyId) === String(studyId) && r.status === "SUBMITTED")
                    .forEach(r => { submittedMap[r.phaseId] = r.responseId; });
                setSubmitted(submittedMap);
            })
            .catch(() => setError("Failed to load study phases."))
            .finally(() => setLoading(false));
    }, [studyId]);

    if (loading) return <LoadingState />;
    if (error || !study) return <ErrorState message={error} />;

    const phases = [...(study.phases || [])].sort((a, b) => a.phaseOrder - b.phaseOrder);
    const catCfg = CATEGORY_COLORS[study.studyCategory] || CATEGORY_COLORS.OTHER;

    return (
        <div className="responses-page">
            <div className="responses-heading">
    <button
        onClick={() => navigate("/participate/responses")}
        style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: "var(--content)",
            padding: "0 0 12px", marginBottom: 4
        }}>
        <ChevronLeft size={16} /> Back to My Responses
    </button>
    <h1 className="responses-heading-text">
        Study <span className="responses-heading-accent">Phases</span>
    </h1>
    <p className="responses-subtitle">Select an active phase below to begin or continue your response.</p>
</div>

            <div className="study-info-card">
                <div className="study-info-stripe" />
                <div className="study-info-body">
                    <div className="study-info-left">
                        <div className="study-badges">
                            {study.studyCategory && (
                                <span className="badge" style={{ background: catCfg.bg, color: catCfg.color }}>
                                    {study.studyCategory}
                                </span>
                            )}
                            {study.studyStatus && (
                                <span className="badge" style={{
                                    background: study.studyStatus === "PUBLISHED" ? "#F0FDF4" : "#F1F5F9",
                                    color: study.studyStatus === "PUBLISHED" ? "#15803D" : "#64748B"
                                }}>
                                    {study.studyStatus}
                                </span>
                            )}
                            <span className="badge" style={{
                                background: study.isMultiPhase ? "#EEF0FF" : "#F1F5F9",
                                color: study.isMultiPhase ? "#4338CA" : "#475569"
                            }}>
                                <GitBranch size={10} style={{ marginRight: 3 }} />
                                {study.isMultiPhase ? "Multi-phase" : "Single phase"}
                            </span>
                        </div>
                        <h2 className="study-title">{study.title}</h2>
                        {study.description && <p className="study-desc">{study.description}</p>}
                    </div>
                    <div className="study-info-right">
                        <InfoPill icon={<Calendar size={12} />} text={`${fmt(study.startDate)} → ${fmt(study.endDate)}`} />
                        <InfoPill icon={<Layers size={12} />} text={`${phases.length} phase${phases.length !== 1 ? "s" : ""}`} />
                    </div>
                </div>
            </div>

            <div className="section-label">
                <BookOpen size={15} color="var(--blue-text)" />
                <span>Choose a Phase</span>
            </div>

            <div className="phases-list">
                {phases.length === 0 ? (
                    <EmptyState
                        icon={<Layers size={36} color="#CBD5E1" />}
                        title="No phases yet"
                        subtitle="This study has no phases configured."
                    />
                ) : (
                    phases.map((phase, idx) => (
                        <PhaseCard
                            key={phase.phaseId}
                            phase={phase}
                            index={idx}
                            draftId={drafts[phase.phaseId]}
                            isSubmitted={!!submitted[phase.phaseId]}
                            studyId={studyId}
                            navigate={navigate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function PhaseCard({ phase, index, draftId, isSubmitted, studyId, navigate }) {
    const isActive  = phase.status === "ACTIVE";
    const isPending = phase.status === "PENDING";
    const cfg       = PHASE_STATUS_CONFIG[phase.status] || PHASE_STATUS_CONFIG.PENDING;
    const clickable = isActive && !isSubmitted;

    const handleClick = () => {
        if (!clickable) return;
        navigate(`/participate/respond/${studyId}/${phase.phaseId}`, {
            state: { phase, draftId, studyId }
        });
    };

    return (
        <div
            className={[
                "phase-card",
                clickable   ? "phase-card--active"    : "",
                isSubmitted ? "phase-card--submitted" : "",
            ].join(" ").trim()}
            onClick={handleClick}
        >
            <div className="phase-card-accent" style={{
                background: isSubmitted ? "#22C55E" : isActive ? "var(--linear-blue)" : isPending ? "#FB923C" : "#CBD5E1"
            }} />

            <div className="phase-card-inner">
                <div className="phase-card-header">
                    <div className="phase-card-title-row">
                        <div className="phase-number" style={{
                            background: isSubmitted ? "#F0FDF4" : isActive ? "var(--background-blue)" : "#F1F5F9",
                            color:      isSubmitted ? "#15803D" : isActive ? "var(--blue-text)"       : "#94A3B8",
                        }}>
                            {isSubmitted ? <CheckCircle2 size={14} /> : index + 1}
                        </div>
                        <div>
                            <span className="phase-meta">{phase.phaseType} · Phase {phase.phaseOrder}</span>
                            <h3 className="phase-title">{phase.title}</h3>
                        </div>
                    </div>

                    <div className="phase-card-right">
                        <span className="badge" style={{
                            background: isSubmitted ? "#F0FDF4" : cfg.bg,
                            color:      isSubmitted ? "#15803D" : cfg.color,
                            display: "flex", alignItems: "center", gap: 5
                        }}>
                            <span className="dot" style={{ background: isSubmitted ? "#22C55E" : cfg.dot }} />
                            {isSubmitted ? "Submitted" : cfg.label}
                        </span>
                        {clickable && (
                            <div className="phase-arrow">
                                <ChevronRight size={15} color="var(--blue-text)" />
                            </div>
                        )}
                        {!clickable && !isSubmitted && (
                            <div className="phase-arrow phase-arrow--locked">
                                <Lock size={13} color="#94A3B8" />
                            </div>
                        )}
                    </div>
                </div>

                {phase.description && <p className="phase-desc">{phase.description}</p>}

                <div className="phase-chips">
                    <MetaChip icon={<FileText size={11} />} label={`${phase.questions?.length || 0} questions`} />
                    <MetaChip icon={<Users size={11} />}    label={`Max ${phase.maxParticipants}`} />
                    {phase.rewardAmount && parseFloat(phase.rewardAmount?.$numberDecimal ?? phase.rewardAmount) > 0 && (
                        <MetaChip icon={<Award size={11} />} label={`${parseFloat(phase.rewardAmount?.$numberDecimal ?? phase.rewardAmount).toFixed(0)} pts`} />
                    )}
                    {draftId && !isSubmitted && (
                        <span className="draft-chip">
                            <Clock size={10} /> Draft saved
                        </span>
                    )}
                </div>

                {!isActive && !isSubmitted && (
                    <div className="phase-notice" style={{
                        background: isPending ? "#FFF7ED" : "#F8FAFC",
                        color:      isPending ? "#C2410C" : "#64748B",
                    }}>
                        <AlertCircle size={12} />
                        {isPending ? "This phase hasn't opened yet." : "This phase is closed."}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── MyResponsesView ──────────────────────────────────────────────────────────
function MyResponsesView({ navigate }) {
    const [tab, setTab]         = useState("ALL");
    const [search, setSearch]   = useState("");
    const [items, setItems]     = useState([]);
    const [counts, setCounts]   = useState({ drafts: 0, submitted: 0, enrolled: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            RecruitmentApi.getMyParticipations().catch(() => ({ data: [] })),
            RecruitmentApi.getMyInvitations().catch(() => ({ data: [] })),
            ResponseApi.getMyResponsesGroupedByStudy().catch(() => ({ data: [] })),
        ])
            .then(async ([participationsRes, invitationsRes, responsesRes]) => {
                const participations = unwrapList(participationsRes);
                const invitations    = unwrapList(invitationsRes);
                const rawResponses   = responsesRes.data;
                const responseGroups = Array.isArray(rawResponses)
                    ? rawResponses
                    : (rawResponses?.data || []);

                const responseMap = {};
                responseGroups.forEach(g => {
                    responseMap[String(g.studyId)] = g;
                });

                const studyMap = {};

                // Source 1: participations — only add if real title exists
                participations.forEach(p => {
                    const sd  = p.study || p;
                    const sid = String(sd.studyId || p.studyId);
                    if (!sid || sid === "undefined") return;
                    const title = sd.title || sd.studyTitle;
                    if (!studyMap[sid] && title) {
                        studyMap[sid] = {
                            studyId:             sid,
                            studyTitle:          title,
                            studyCategory:       sd.studyCategory,
                            studyStatus:         sd.studyStatus,
                            isMultiPhase:        sd.isMultiPhase,
                            startDate:           sd.startDate,
                            endDate:             sd.endDate,
                            responses:           [],
                            participationStatus: p.status,
                        };
                    }
                });

                // Source 2: accepted invitations — fetch missing study data
                const acceptedInvitations = invitations.filter(
                    inv => inv.status === "ACCEPTED" && inv.studyId
                );

                const missingStudyIds = acceptedInvitations
                    .map(inv => String(inv.studyId))
                    .filter(sid => !studyMap[sid]);

                const uniqueMissingIds = [...new Set(missingStudyIds)];

                const studyFetches = await Promise.all(
                    uniqueMissingIds.map(sid =>
                        getStudyByIdPublic(sid)
                            .then(data => ({ sid, data }))
                            .catch(() => ({ sid, data: null }))
                    )
                );

                studyFetches.forEach(({ sid, data }) => {
                    if (!data) return;
                    studyMap[sid] = {
                        studyId:             sid,
                        studyTitle:          data.title || data.studyTitle || "Untitled Study",
                        studyCategory:       data.studyCategory,
                        studyStatus:         data.studyStatus || data.status,
                        isMultiPhase:        data.isMultiPhase,
                        startDate:           data.startDate,
                        endDate:             data.endDate,
                        responses:           [],
                        participationStatus: "ACCEPTED",
                    };
                });

                // Overlay responses
                Object.keys(studyMap).forEach(sid => {
                    const group = responseMap[sid];
                    if (group) studyMap[sid].responses = group.responses || [];
                });

                // Source 3: response groups not covered — allow overwriting "Untitled Study"
                responseGroups.forEach(g => {
                    const sid        = String(g.studyId);
                    const existing   = studyMap[sid];
                    const newTitle   = g.studyTitle || g.title;
                    const hasNoTitle = !existing?.studyTitle || existing.studyTitle === "Untitled Study";

                    if (!existing || hasNoTitle) {
                        studyMap[sid] = {
                            ...existing,
                            studyId:       sid,
                            studyTitle:    newTitle || existing?.studyTitle || "Untitled Study",
                            studyCategory: g.studyCategory  || existing?.studyCategory,
                            studyStatus:   g.studyStatus    || existing?.studyStatus,
                            isMultiPhase:  g.isMultiPhase   ?? existing?.isMultiPhase,
                            startDate:     g.startDate      || existing?.startDate,
                            endDate:       g.endDate        || existing?.endDate,
                            responses:     g.responses      || existing?.responses || [],
                        };
                    }
                });

                const allItems = Object.values(studyMap)
    .filter(item => item.studyStatus === "PUBLISHED");
                
                setItems(allItems);

                let drafts = 0, submitted = 0, enrolled = 0;
                allItems.forEach(item => {
                    enrolled++;
                    (item.responses || []).forEach(r => {
                        if (r.status === "DRAFT")     drafts++;
                        if (r.status === "SUBMITTED") submitted++;
                    });
                });
                setCounts({ drafts, submitted, enrolled });
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = items.filter(item => {
        const responses = item.responses || [];
        const matchTab =
            tab === "ALL"
            || (tab === "DRAFT"     && responses.some(r => r.status === "DRAFT"))
            || (tab === "SUBMITTED" && responses.some(r => r.status === "SUBMITTED"))
            || (tab === "ENROLLED"  && responses.length === 0);
        const matchSearch =
            !search || (item.studyTitle || "").toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const tabLabel = tab === "DRAFT" ? "Draft" : tab === "SUBMITTED" ? "Submitted" : "My";

    return (
        <div className="responses-page">
            <div className="responses-toprow">
                <div className="responses-heading">
                    <h1 className="responses-heading-text">
                        {tabLabel} <span className="responses-heading-accent">Responses</span>
                    </h1>
                </div>
                <div className="counters-row">
                    <CounterBubble
                        value={counts.enrolled}
                        label="ENROLLED"
                        active={tab === "ENROLLED"}
                        onClick={() => setTab(t => t === "ENROLLED" ? "ALL" : "ENROLLED")}
                        outlined
                    />
                    <CounterBubble
                        value={counts.drafts}
                        label="DRAFT"
                        active={tab === "DRAFT"}
                        onClick={() => setTab(t => t === "DRAFT" ? "ALL" : "DRAFT")}
                        outlined
                    />
                    <CounterBubble
                        value={counts.submitted}
                        label="SUBMITTED"
                        active={tab === "SUBMITTED"}
                        onClick={() => setTab(t => t === "SUBMITTED" ? "ALL" : "SUBMITTED")}
                        filled
                    />
                </div>
            </div>

            <div className="search-bar">
                <Search size={14} className="search-icon" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search studies..."
                    className="search-input"
                />
            </div>

            {loading ? (
                <LoadingState />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<FileText size={36} color="#CBD5E1" />}
                    title={search ? "No results found" : "No studies yet"}
                    subtitle={search ? "Try a different search term." : "Accept a study invitation to start participating."}
                />
            ) : (
                <div className="responses-bento">
                    <div className="responses-bento-grid responses-bento-grid--full">
                        {filtered.map(item => (
                            <StudyResponseCard
                                key={item.studyId}
                                item={item}
                                navigate={navigate}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StudyResponseCard({ item, navigate }) {
    const responses  = item.responses || [];
    const hasDraft   = responses.some(r => r.status === "DRAFT");
    const hasSubmit  = responses.some(r => r.status === "SUBMITTED");
    const noResponse = responses.length === 0;

    const displayStatus = hasSubmit ? "SUBMITTED" : hasDraft ? "DRAFT" : "ENROLLED";
    const statusStyles  = {
        SUBMITTED: { bg: "#EEF0FF", color: "#4338CA", dot: "#7073FF", label: "Submitted" },
        DRAFT:     { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8", label: "Draft in progress" },
        ENROLLED:  { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Ready to start" },
    };
    const cfg    = statusStyles[displayStatus];
    const catCfg = CATEGORY_COLORS[item.studyCategory] || CATEGORY_COLORS.OTHER;

    const submittedCount = responses.filter(r => r.status === "SUBMITTED").length;
    const draftCount     = responses.filter(r => r.status === "DRAFT").length;
    const isEnded = item.endDate && new Date(item.endDate) < new Date();

return (
    <div
        className="response-card-small"
        style={{ cursor: isEnded ? "default" : "pointer", opacity: isEnded ? 0.6 : 1 }}
        onClick={() => !isEnded && navigate(`/participate/responses/${item.studyId}`)}
    >
            <div className="response-card-small-top">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="dot" style={{ background: cfg.dot }} />
                        {cfg.label}
                    </span>
                    {item.studyCategory && (
                        <span className="badge" style={{ background: catCfg.bg, color: catCfg.color }}>
                            {item.studyCategory}
                        </span>
                    )}
                    
                </div>
                {(item.startDate || item.endDate) && (
                    <span className="response-date" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={11} />
                        {fmt(item.startDate)}
                    </span>
                )}
            </div>
             {item.isMultiPhase !== undefined && (
                        <span className="badge" style={{
                            background: item.isMultiPhase ? "#EEF0FF" : "#F1F5F9",
                            color: item.isMultiPhase ? "#4338CA" : "#475569",
                            display: "flex", alignItems: "center", gap: 3,
                            width: "fit-content", padding: "2px 6px", fontSize: 11, marginTop: 4
                        }}>
                            <GitBranch size={10} />
                            {item.isMultiPhase ? "Multi-phase" : "Single phase"}
                        </span>
                    )}
            <h3 className="response-card-small-title">{item.studyTitle || "Untitled Study"}</h3>

            <p className="response-card-small-sub">
                {noResponse
                    ? "No responses yet — click to start"
                    : `${submittedCount} submitted · ${draftCount} draft`}
            </p>

            {item.endDate && (
                <p style={{ fontSize: 11, color: "var(--content)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} /> Ends {fmt(item.endDate)}
                </p>
            )}

            <button className="btn-details" style={{ marginTop: "auto" }} disabled={isEnded}>
    {isEnded
        ? <><Lock size={12} /> Ended</>
        : noResponse
            ? <><PlayCircle size={12} /> Start</>
            : hasDraft && !hasSubmit
                ? <><PlayCircle size={12} /> Continue</>
                : <><Eye size={12} /> View</>
    }
</button>
        </div>
    );
}

// ── micro-components ─────────────────────────────────────────────────────────
function CounterBubble({ value, label, active, onClick, filled, outlined }) {
    return (
        <button
            onClick={onClick}
            className={[
                "counter-bubble",
                filled   ? "counter-bubble--filled"   : "",
                outlined ? "counter-bubble--outlined" : "",
                active   ? "counter-bubble--active"   : "",
            ].join(" ").trim()}
        >
            <span className="counter-bubble-value">{value}</span>
            <span className="counter-bubble-label">{label}</span>
        </button>
    );
}
function InfoPill({ icon, text }) {
    return <span className="info-pill">{icon} {text}</span>;
}
function MetaChip({ icon, label }) {
    return <span className="meta-chip">{icon} {label}</span>;
}
function LoadingState() {
    return (
        <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading...</p>
        </div>
    );
}
function ErrorState({ message }) {
    return (
        <div className="empty-state">
            <AlertCircle size={36} color="#F87171" />
            <p className="empty-state-title">Something went wrong</p>
            <p className="empty-state-sub">{message || "Please try again later."}</p>
        </div>
    );
}
function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="empty-state">
            {icon}
            <p className="empty-state-title">{title}</p>
            <p className="empty-state-sub">{subtitle}</p>
        </div>
    );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function Responses() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { studyId }                   = useParams();
    const navigate                      = useNavigate();

    return (
        <div className="dashboard">
            <TopNavBar
                page="participate"
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <SideBarParticipant
                page="responses"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="wrapper">
                {studyId
                    ? <StudyPhaseView studyId={studyId} navigate={navigate} />
                    : <MyResponsesView navigate={navigate} />
                }
            </div>
        </div>
    );
}