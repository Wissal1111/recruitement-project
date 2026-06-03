import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import TopNavBar from "../../components/TopNavBar";
import ResponseApi from "../../api/ResponseApi";
import { getStudyById } from "../../api/StudyApi";
import {
    ChevronLeft, ChevronRight, Send, Save,
    CheckCircle2, AlertCircle, Clock, Layers
} from "lucide-react";
import "./RespondPage.css";

// ─── helpers ─────────────────────────────────────────────────────────────────
function unwrap(res) {
    const d = res?.data;
    if (!d) return null;
    if (d.data) return d.data;
    return d;
}

// ─── question input components ────────────────────────────────────────────────

function TextInput({ question, value, onChange }) {
    return (
        <textarea
            className="rp-textarea"
            placeholder="Type your answer here…"
            value={value || ""}
            onChange={e => onChange(question.questionId, e.target.value)}
            rows={4}
        />
    );
}

function SingleChoice({ question, value, onChange }) {
    return (
        <div className="rp-choices">
            {(question.options || []).map(opt => {
                const selected = value === opt.value || value === opt.optionId;
                return (
                    <button
                        key={opt.optionId}
                        className={`rp-choice ${selected ? "rp-choice--selected" : ""}`}
                        onClick={() => onChange(question.questionId, opt.value ?? opt.optionId)}
                        type="button"
                    >
                        <span className="rp-choice-radio">
                            {selected && <span className="rp-choice-radio-dot" />}
                        </span>
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

function MultipleChoice({ question, value, onChange }) {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (val) => {
        const next = selected.includes(val)
            ? selected.filter(v => v !== val)
            : [...selected, val];
        onChange(question.questionId, next);
    };
    return (
        <div className="rp-choices">
            {(question.options || []).map(opt => {
                const isOn = selected.includes(opt.value ?? opt.optionId);
                return (
                    <button
                        key={opt.optionId}
                        className={`rp-choice ${isOn ? "rp-choice--selected" : ""}`}
                        onClick={() => toggle(opt.value ?? opt.optionId)}
                        type="button"
                    >
                        <span className="rp-choice-check">
                            {isOn && <CheckCircle2 size={13} />}
                        </span>
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

function RatingScale({ question, value, onChange }) {
    const max = question.maxRating || question.scale || 10;
    const nums = Array.from({ length: max }, (_, i) => i + 1);
    return (
        <div className="rp-rating">
            <div className="rp-rating-labels">
                <span>{question.minLabel || "Not at all"}</span>
                <span>{question.maxLabel || "Absolutely"}</span>
            </div>
            <div className="rp-rating-pills">
                {nums.map(n => (
                    <button
                        key={n}
                        type="button"
                        className={`rp-rating-pill ${value === n ? "rp-rating-pill--on" : ""}`}
                        onClick={() => onChange(question.questionId, n)}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}

function YesNo({ question, value, onChange }) {
    return (
        <div className="rp-yesno">
            {["YES", "NO"].map(opt => (
                <button
                    key={opt}
                    type="button"
                    className={`rp-yesno-btn ${value === opt ? "rp-yesno-btn--on" : ""}`}
                    onClick={() => onChange(question.questionId, opt)}
                >
                    {opt === "YES" ? "  Yes" : "  No"}
                </button>
            ))}
        </div>
    );
}

function DateInput({ question, value, onChange }) {
    return (
        <input
            type="date"
            className="rp-date"
            value={value || ""}
            onChange={e => onChange(question.questionId, e.target.value)}
        />
    );
}

function QuestionInput({ question, value, onChange }) {
    const props = { question, value, onChange };
    switch (question.questionType) {
        case "TEXT":            return <TextInput {...props} />;
        case "SINGLE_CHOICE":  return <SingleChoice {...props} />;
        case "MULTIPLE_CHOICE":return <MultipleChoice {...props} />;
        case "RATING_SCALE":   return <RatingScale {...props} />;
        case "YES_NO":         return <YesNo {...props} />;
        case "DATE":           return <DateInput {...props} />;
        default:               return <TextInput {...props} />;
    }
}

// ─── progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
    const pct = total > 0 ? Math.round(((current) / total) * 100) : 0;
    return (
        <div className="rp-progress">
            <div className="rp-progress-track">
                <div className="rp-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rp-progress-label">{current} / {total}</span>
        </div>
    );
}

// ─── success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ navigate, studyId, nextPhase }) {
    useEffect(() => {
        if (nextPhase) {
            // auto-redirect after 2 seconds to next active phase
            const timer = setTimeout(() => {
                navigate(`/participate/respond/${studyId}/${nextPhase.phaseId}`, {
                    state: { phase: nextPhase, studyId }
                });
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className="rp-success">
            <div className="rp-success-icon">
                <CheckCircle2 size={48} color="#4A4BD7" />
            </div>
            <h2 className="rp-success-title">Response Submitted!</h2>
            <p className="rp-success-sub">
                {nextPhase
                    ? `Moving to Phase ${nextPhase.phaseOrder} in a moment…`
                    : "Your answers have been recorded. Thank you for participating."
                }
            </p>
            {nextPhase ? (
                <button
                    className="rp-btn rp-btn--primary"
                    onClick={() => navigate(`/participate/respond/${studyId}/${nextPhase.phaseId}`, {
                        state: { phase: nextPhase, studyId }
                    })}>
                    Go to Next Phase
                </button>
            ) : (
                <button
                    className="rp-btn rp-btn--primary"
                    onClick={() => navigate(`/participate/responses/${studyId}`)}>
                    Back to Study
                </button>
            )}
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function RespondPage() {
    const { studyId, phaseId }  = useParams();
    const location              = useLocation();
    const navigate              = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // state passed from PhaseCard click (has phase + draftId)
    const locationState = location.state || {};

    const [phase, setPhase]         = useState(locationState.phase || null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers]     = useState({});   // { questionId: value }
    const [draftId, setDraftId]     = useState(locationState.draftId || null);

    const [current, setCurrent]     = useState(0);    // current question index
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError]         = useState(null);
    const [saveMsg, setSaveMsg]     = useState(null);
    const [nextPhase, setNextPhase] = useState(null);

    const autoSaveTimer = useRef(null);

    // ── load phase + existing draft ──────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                // 1. Get phase/questions from study service if not passed via state
                let phaseData = phase;
                if (!phaseData || !phaseData.questions?.length) {
                    const studyRes = await getStudyById(studyId);
                    const raw = studyRes?.data || studyRes;
                    const phases = raw?.phases || raw?.studyPhases || [];
                    phaseData = phases.find(p => String(p.phaseId) === String(phaseId));
                    if (phaseData) setPhase(phaseData);
                }

                const qs = phaseData?.questions || [];
                setQuestions(qs);

                // 2. Load existing draft answers if draftId available
                if (draftId) {
                    try {
                        const draftRes = await ResponseApi.getMyDraftById(draftId);
                        const draft = unwrap(draftRes);
                        if (draft?.answers?.length) {
                            const map = {};
                            draft.answers.forEach(a => { map[a.questionId] = a.value; });
                            setAnswers(map);
                        }
                    } catch { /* draft may not exist yet */ }
                } else {
                    // Try to find draft for this phase
                    try {
                        const draftRes = await ResponseApi.getMyDraftByStudyAndPhase(studyId, phaseId);
                        const draft = unwrap(draftRes);
                        if (draft) {
                            setDraftId(draft.responseId || draft._id);
                            const map = {};
                            (draft.answers || []).forEach(a => { map[a.questionId] = a.value; });
                            setAnswers(map);
                        }
                    } catch { /* no draft yet, fresh start */ }
                }
            } catch (err) {
                setError("Failed to load questions. Please go back and try again.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studyId, phaseId]);

    // ── auto-save on answer change ────────────────────────────────────────────
    const triggerAutoSave = useCallback((updatedAnswers) => {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            saveDraft(updatedAnswers, false);
        }, 1500);
    }, [draftId, studyId, phaseId]);

    const handleAnswer = (questionId, value) => {
        const updated = { ...answers, [questionId]: value };
        setAnswers(updated);
        triggerAutoSave(updated);
    };

    // ── save draft ────────────────────────────────────────────────────────────
    const saveDraft = async (currentAnswers = answers, showMsg = true) => {
        if (submitting || submitted) return;
        setSaving(true);
        try {
            const payload = {
                studyId,
                phaseId,
                answers: Object.entries(currentAnswers).map(([questionId, value]) => ({ questionId, value })),
            };
            const res = await ResponseApi.saveDraft(payload);
            const saved = unwrap(res);
            if (saved?.responseId && !draftId) setDraftId(saved.responseId);
            if (showMsg) {
                setSaveMsg("Draft saved");
                setTimeout(() => setSaveMsg(null), 2000);
            }
        } catch {
            if (showMsg) setSaveMsg("Save failed");
        } finally {
            setSaving(false);
        }
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
    // ✅ Cancel any pending auto-save
    clearTimeout(autoSaveTimer.current);
    
    const missing = questions.filter(q => q.isRequired && !answers[q.questionId]);
    if (missing.length) {
        setError(`Please answer all required questions (${missing.length} remaining).`);
        const idx = questions.findIndex(q => q.questionId === missing[0].questionId);
        if (idx >= 0) setCurrent(idx);
        return;
    }
    setSubmitting(true);
    setError(null);
    try {
        await ResponseApi.submitResponse({
            studyId,
            phaseId,
            answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
        });

        // Find next active phase
        try {
            const { getStudyByIdPublic } = await import("../../api/StudyApi");
            const study = await getStudyByIdPublic(studyId);
            const phases = (study?.phases || []).sort((a, b) => a.phaseOrder - b.phaseOrder);
            const currentPhaseOrder = phase?.phaseOrder || 0;
            const next = phases.find(p =>
                p.phaseOrder > currentPhaseOrder && p.status === "ACTIVE"
            );
            setNextPhase(next || null);
        } catch {
            setNextPhase(null);
        }

        setSubmitted(true);
    } catch (err) {
        setError(err?.response?.data?.message || "Submission failed. Please try again.");
    } finally {
        setSubmitting(false);
    }
};

    // ── navigation ────────────────────────────────────────────────────────────
    const goNext = () => { if (current < questions.length - 1) setCurrent(c => c + 1); };
    const goPrev = () => { if (current > 0) setCurrent(c => c - 1); };

    const isAnswered = (q) => {
        const v = answers[q.questionId];
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v)) return v.length > 0;
        return true;
    };

    // ── render ────────────────────────────────────────────────────────────────
    if (submitted) {
    return (
        <div className="dashboard">
            <TopNavBar page="participate" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBarParticipant page="responses" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="wrapper">
                <SuccessScreen navigate={navigate} studyId={studyId} nextPhase={nextPhase} />
            </div>
        </div>
    );
}

    const q = questions[current];
    const answeredCount = questions.filter(isAnswered).length;

    return (
        <div className="dashboard">
            <TopNavBar page="participate" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBarParticipant page="responses" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div className="rp-page">

                    {/* ── top bar ── */}
                    <div className="rp-topbar">
                        <button className="rp-back" onClick={() => navigate(`/participate/responses/${studyId}`)}>
                            <ChevronLeft size={15} /> Back
                        </button>

                        <div className="rp-phase-info">
                            <Layers size={13} color="var(--blue-text)" />
                            <span>{phase?.title || "Phase"}</span>
                            {phase?.phaseOrder && (
                                <span className="rp-phase-order">Phase {phase.phaseOrder}</span>
                            )}
                        </div>

                        <div className="rp-topbar-right">
                            {saveMsg && (
                                <span className="rp-save-msg">
                                    <Clock size={11} /> {saveMsg}
                                </span>
                            )}
                            <button
                                className="rp-btn rp-btn--ghost"
                                onClick={() => saveDraft(answers, true)}
                                disabled={saving || submitting}
                            >
                                <Save size={13} />
                                {saving ? "Saving…" : "Save Draft"}
                            </button>
                        </div>
                    </div>

                    {/* ── progress ── */}
                    <ProgressBar current={answeredCount} total={questions.length} />

                    {/* ── content ── */}
                    {loading ? (
                        <div className="rp-loading">
                            <div className="rp-spinner" />
                            <p>Loading questions…</p>
                        </div>
                    ) : error && !q ? (
                        <div className="rp-error">
                            <AlertCircle size={32} color="#F87171" />
                            <p>{error}</p>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="rp-error">
                            <AlertCircle size={32} color="#CBD5E1" />
                            <p>This phase has no questions yet.</p>
                        </div>
                    ) : (
                        <div className="rp-body">

                            {/* ── question dots sidebar ── */}
                            <div className="rp-dots">
                                {questions.map((qDot, idx) => (
                                    <button
                                        key={qDot.questionId}
                                        className={[
                                            "rp-dot",
                                            idx === current          ? "rp-dot--current"  : "",
                                            isAnswered(qDot)         ? "rp-dot--answered" : "",
                                            qDot.isRequired && !isAnswered(qDot) ? "rp-dot--required" : "",
                                        ].join(" ").trim()}
                                        onClick={() => setCurrent(idx)}
                                        title={`Q${idx + 1}`}
                                    />
                                ))}
                            </div>

                            {/* ── question card ── */}
                            <div className="rp-card">
                                <div className="rp-card-header">
                                    <span className="rp-q-number">Question {current + 1}</span>
                                    {q.isRequired && <span className="rp-required">Required</span>}
                                    <span className="rp-q-type">{q.questionType?.replace("_", " ")}</span>
                                </div>

                                <h2 className="rp-q-text">{q.text}</h2>

                                {error && (
                                    <div className="rp-inline-error">
                                        <AlertCircle size={13} /> {error}
                                    </div>
                                )}

                                <div className="rp-input-area">
                                    <QuestionInput
                                        question={q}
                                        value={answers[q.questionId]}
                                        onChange={handleAnswer}
                                    />
                                </div>

                                {/* ── nav buttons ── */}
                                <div className="rp-nav">
                                    <button
                                        className="rp-btn rp-btn--ghost"
                                        onClick={goPrev}
                                        disabled={current === 0}
                                    >
                                        <ChevronLeft size={15} /> Previous
                                    </button>

                                    {current < questions.length - 1 ? (
                                        <button className="rp-btn rp-btn--primary" onClick={goNext}>
                                            Next <ChevronRight size={15} />
                                        </button>
                                    ) : (
                                        <button
                                            className="rp-btn rp-btn--submit"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            <Send size={13} />
                                            {submitting ? "Submitting…" : "Submit Response"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}