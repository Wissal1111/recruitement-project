import { useState } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getSlot, createSlot } from "../../api/RecruitmentApi";
import axiosInstance from "../../api/axiosInstance";
import { Plus, Pencil, MoreVertical } from "lucide-react";

const PHASE_ICONS = ["📝", "🎤", "✅"];

export default function SlotsRewards() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [inputId, setInputId] = useState("");
    const [studyId, setStudyId] = useState("");
    const [study, setStudy] = useState(null);
    const [slots, setSlots] = useState({});
    const [loading, setLoading] = useState(false);
    const [showAddSlot, setShowAddSlot] = useState(null);
    const [slotForm, setSlotForm] = useState({ totalSlots: 10, rewardAmount: 0 });
    const [saving, setSaving] = useState(false);

    const loadStudy = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/studies/${id}`);
            setStudy(res.data);
            // Load slots for each phase
            const slotData = {};
            for (const phase of res.data.phases || []) {
                try {
                    const s = await getSlot(phase.phaseId);
                    slotData[phase.phaseId] = s.data;
                } catch {
                    slotData[phase.phaseId] = null;
                }
            }
            setSlots(slotData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (phaseId) => {
        setSaving(true);
        try {
            await createSlot(phaseId, studyId, slotForm);
            const s = await getSlot(phaseId);
            setSlots(prev => ({ ...prev, [phaseId]: s.data }));
            setShowAddSlot(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    // Compute stats
    const totalSlots = Object.values(slots).reduce((acc, s) => acc + (s?.totalSlots || 0), 0);
    const filledSlots = Object.values(slots).reduce((acc, s) => acc + (s?.filledSlots || 0), 0);
    const totalReward = Object.values(slots).reduce((acc, s) => acc + ((s?.rewardAmount || 0) * (s?.totalSlots || 0)), 0);
    const fillPercent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = circumference - (fillPercent / 100) * circumference;

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="slotsrewards" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4 }}>Slots & Rewards</h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>Manage participant slots and reward allocation per phase</p>
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
                        onKeyDown={e => e.key === "Enter" && (setStudyId(inputId), loadStudy(inputId))}
                        placeholder="Search campaign slots..."
                        style={{
                            flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
                            padding: "10px 14px", fontSize: 14, outline: "none",
                            color: "var(--title)", background: "#F8FAFC"
                        }}
                        onFocus={e => e.target.style.borderColor = "#7073FF"}
                        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                    />
                    <button onClick={() => { setStudyId(inputId); loadStudy(inputId); }} style={{
                        background: "var(--linear-blue)", color: "#fff", border: "none",
                        borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer"
                    }}>Load</button>
                </div>

                {!studyId ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid #E8ECF4", color: "var(--content)", fontSize: 14 }}>
                        Enter a Study ID to manage slots and rewards.
                    </div>
                ) : loading ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "var(--content)" }}>Loading...</div>
                ) : study && (
                    <>
                        {/* Stats Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                            {/* Circular Progress */}
                            <div style={{
                                background: "#fff", borderRadius: 16, padding: "28px 24px",
                                border: "1px solid #E8ECF4", display: "flex", alignItems: "center", gap: 32
                            }}>
                                {/* SVG Circle */}
                                <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0, overflow: "visible" }}>
                                    <svg width="140" height="140" viewBox="0 0 130 130">
                                        <circle cx="65" cy="65" r={radius} fill="none" stroke="#E8ECF4" strokeWidth="10" />
                                        <circle
                                            cx="65" cy="65" r={radius} fill="none"
                                            stroke="url(#grad)" strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDash}
                                            transform="rotate(-90 65 65)"
                                            style={{ transition: "stroke-dashoffset 0.5s" }}
                                        />
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#7073FF" />
                                                <stop offset="100%" stopColor="#5B5EFF" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center"
                                    }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--title)" }}>{filledSlots}</div>
                                        <div style={{ fontSize: 11, color: "var(--content)", fontWeight: 600 }}>FILLED</div>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--title)", marginBottom: 6 }}>
                                        Total Capacity Strategy
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--content)", marginBottom: 16 }}>
                                        Your current recruitment is at {fillPercent}% capacity across all active study phases.
                                    </div>
                                    <div style={{ display: "flex", gap: 24 }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 4 }}>TARGET SLOTS</div>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--title)" }}>{totalSlots}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 4 }}>FILLED</div>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--title)" }}>{filledSlots}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Incentive Pool */}
                            <div style={{
                                background: "#fff", borderRadius: 16, padding: "28px 24px",
                                border: "1px solid #E8ECF4"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: "var(--background-blue)",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                                    }}>💰</div>
                                    <span style={{
                                        background: "var(--background-blue)", color: "var(--blue-text)",
                                        borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700
                                    }}>INCENTIVE POOL</span>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--title)", marginBottom: 4 }}>
                                    ${totalReward.toFixed(2)}
                                </div>
                                <div style={{ fontSize: 13, color: "var(--content)", marginBottom: 20 }}>
                                    Total budget committed to participant rewards.
                                </div>
                                <div style={{
                                    display: "flex", justifyContent: "space-between",
                                    padding: "12px 0", borderTop: "1px solid #F0F4FA",
                                    fontSize: 13
                                }}>
                                    <span style={{ color: "var(--content)" }}>Disbursed</span>
                                    <span style={{ fontWeight: 700, color: "var(--title)" }}>$0.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Phase Configurations */}
                        <div style={{
                            background: "#fff", borderRadius: 16,
                            border: "1px solid #E8ECF4", overflow: "hidden"
                        }}>
                            <div style={{
                                padding: "18px 24px", borderBottom: "1px solid #E8ECF4",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--title)" }}>
                                    Study Phase Configurations
                                </div>
                                <button style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "var(--blue-text)", fontSize: 13, fontWeight: 600,
                                    display: "flex", alignItems: "center", gap: 4
                                }}>
                                    <Plus size={14} /> Add New Phase
                                </button>
                            </div>

                            {(study.phases || []).map((phase, idx) => {
                                const slot = slots[phase.phaseId];
                                const filled = slot?.filledSlots || 0;
                                const total = slot?.totalSlots || 0;
                                const reward = slot?.rewardAmount || 0;

                                return (
                                    <div key={phase.phaseId} style={{
                                        padding: "18px 24px",
                                        borderBottom: idx < study.phases.length - 1 ? "1px solid #F0F4FA" : "none",
                                        display: "flex", alignItems: "center", gap: 16
                                    }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: "var(--background-blue)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 18, flexShrink: 0
                                        }}>
                                            {PHASE_ICONS[idx] || "📋"}
                                        </div>

                                        {/* Phase Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--title)", marginBottom: 2 }}>
                                                Phase {phase.phaseOrder}: {phase.title?.trim() || "Untitled Phase"}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--content)" }}>
                                                {phase.description || phase.phaseType}
                                            </div>
                                        </div>

                                        {/* Slot Info or Create */}
                                        {slot ? (
                                            <>
                                                <div style={{ textAlign: "right", marginRight: 16 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 2 }}>REWARD</div>
                                                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--title)" }}>${reward.toFixed(2)}</div>
                                                </div>
                                                <div style={{ textAlign: "right", marginRight: 16 }}>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em", marginBottom: 2 }}>SLOTS</div>
                                                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--title)" }}>
                                                        {filled} <span style={{ color: "var(--content)", fontWeight: 400 }}>/ {total}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button style={{
                                                        background: "none", border: "1px solid #E8ECF4", borderRadius: 6,
                                                        padding: "6px 8px", cursor: "pointer", color: "var(--content)"
                                                    }}><Pencil size={13} /></button>
                                                    <button style={{
                                                        background: "none", border: "1px solid #E8ECF4", borderRadius: 6,
                                                        padding: "6px 8px", cursor: "pointer", color: "var(--content)"
                                                    }}><MoreVertical size={13} /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                {showAddSlot === phase.phaseId ? (
                                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                        <input
                                                            type="number"
                                                            placeholder="Slots"
                                                            value={slotForm.totalSlots}
                                                            onChange={e => setSlotForm(f => ({ ...f, totalSlots: parseInt(e.target.value) }))}
                                                            style={{
                                                                width: 70, border: "1.5px solid #E2E8F0", borderRadius: 6,
                                                                padding: "6px 8px", fontSize: 13, outline: "none"
                                                            }}
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Reward $"
                                                            value={slotForm.rewardAmount}
                                                            onChange={e => setSlotForm(f => ({ ...f, rewardAmount: parseFloat(e.target.value) }))}
                                                            style={{
                                                                width: 80, border: "1.5px solid #E2E8F0", borderRadius: 6,
                                                                padding: "6px 8px", fontSize: 13, outline: "none"
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleCreateSlot(phase.phaseId)}
                                                            disabled={saving}
                                                            style={{
                                                                background: "var(--linear-blue)", color: "#fff",
                                                                border: "none", borderRadius: 6, padding: "6px 14px",
                                                                fontSize: 13, fontWeight: 600, cursor: "pointer"
                                                            }}>
                                                            {saving ? "..." : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowAddSlot(null)}
                                                            style={{
                                                                background: "none", border: "1px solid #E8ECF4",
                                                                borderRadius: 6, padding: "6px 10px",
                                                                fontSize: 13, cursor: "pointer", color: "var(--content)"
                                                            }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowAddSlot(phase.phaseId)}
                                                        style={{
                                                            background: "var(--background-blue)", color: "var(--blue-text)",
                                                            border: "none", borderRadius: 8, padding: "8px 14px",
                                                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                                                            display: "flex", alignItems: "center", gap: 4
                                                        }}>
                                                        <Plus size={13} /> Add Slots
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
