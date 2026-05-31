import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getCriteria, createCriteria, updateCriteria, previewEligiblePool } from "../../api/RecruitmentApi";
import axiosInstance from "../../api/axiosInstance";
import { Target, Users, Save, Eye } from "lucide-react";

const EDUCATION_LEVELS = ["HIGH_SCHOOL", "BACHELOR", "MASTER", "PHD", "OTHER"];

export default function Targeting() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [studies, setStudies] = useState([]);
    const [studyId, setStudyId] = useState("");
    const [criteria, setCriteria] = useState(null);
    const [form, setForm] = useState({
        ageMin: "", ageMax: "", gender: "", country: "",
        educationLevel: "", interestIds: []
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [previewing, setPreviewing] = useState(false);
    const [saved, setSaved] = useState(false);

    // Charger les studies du créateur au démarrage
    useEffect(() => {
        axiosInstance.get("/studies/my-studies")
            .then(res => {
                const list = res.data?.studies || res.data || [];
                setStudies(list);
                if (list.length > 0) {
                    setStudyId(list[0].studyId);
                    loadCriteria(list[0].studyId);
                }
            })
            .catch(() => {});
    }, []);

    const loadCriteria = async (id) => {
        if (!id) return;
        setLoading(true);
        setCriteria(null);
        setPreview(null);
        try {
            const res = await getCriteria(id);
            setCriteria(res.data);
            setForm({
                ageMin: res.data.ageMin || "",
                ageMax: res.data.ageMax || "",
                gender: res.data.gender || "",
                country: res.data.country || "",
                educationLevel: res.data.educationLevel || "",
                interestIds: res.data.interestIds || []
            });
        } catch (e) {
            setCriteria(null);
            setForm({ ageMin: "", ageMax: "", gender: "", country: "", educationLevel: "", interestIds: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleStudyChange = (id) => {
        setStudyId(id);
        loadCriteria(id);
    };

    const handleSave = async () => {
        if (!studyId) return;
        setSaving(true);
        try {
            const payload = {
                ageMin: form.ageMin ? parseInt(form.ageMin) : null,
                ageMax: form.ageMax ? parseInt(form.ageMax) : null,
                gender: form.gender || null,
                country: form.country || null,
                educationLevel: form.educationLevel || null,
                interestIds: form.interestIds
            };
            if (criteria) {
                await updateCriteria(studyId, payload);
            } else {
                await createCriteria(studyId, payload);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            loadCriteria(studyId);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = async () => {
        if (!studyId) return;
        setPreviewing(true);
        try {
            const res = await previewEligiblePool(studyId);
            setPreview(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setPreviewing(false);
        }
    };

    const field = (label, children) => (
        <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--title)", marginBottom: 6 }}>
                {label}
            </label>
            {children}
        </div>
    );

    const inputStyle = {
        width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8,
        padding: "10px 14px", fontSize: 14, outline: "none",
        color: "var(--title)", background: "#F8FAFC", transition: "border-color 0.2s"
    };

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="targeting" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <Target size={20} color="var(--blue-text)" /> Targeting Criteria
                    </h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>Define who can participate in your study</p>
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

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--content)" }}>Loading...</div>
                ) : studyId && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
                        {/* Form */}
                        <div style={{
                            background: "#fff", borderRadius: "var(--medium-radius)",
                            padding: "24px", border: "1px solid #E8ECF4",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                        }}>
                            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 20, fontSize: 15 }}>
                                Eligibility Criteria
                            </h3>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                {field("Min Age",
                                    <input type="number" value={form.ageMin}
                                           onChange={e => setForm(f => ({ ...f, ageMin: e.target.value }))}
                                           placeholder="e.g. 18" style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#7073FF"}
                                           onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                                )}
                                {field("Max Age",
                                    <input type="number" value={form.ageMax}
                                           onChange={e => setForm(f => ({ ...f, ageMax: e.target.value }))}
                                           placeholder="e.g. 60" style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#7073FF"}
                                           onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                                )}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                {field("Gender",
                                    <select value={form.gender}
                                            onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                                            style={{ ...inputStyle, cursor: "pointer" }}>
                                        <option value="">Any gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                )}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                {field("Country",
                                    <input value={form.country}
                                           onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                                           placeholder="e.g. DZ, FR, US..." style={inputStyle}
                                           onFocus={e => e.target.style.borderColor = "#7073FF"}
                                           onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
                                )}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                {field("Education Level",
                                    <select value={form.educationLevel}
                                            onChange={e => setForm(f => ({ ...f, educationLevel: e.target.value }))}
                                            style={{ ...inputStyle, cursor: "pointer" }}>
                                        <option value="">Any level</option>
                                        {EDUCATION_LEVELS.map(l => (
                                            <option key={l} value={l}>{l.replace("_", " ")}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                                <button onClick={handleSave} disabled={saving} style={{
                                    flex: 1, background: saved ? "#F0FDF4" : "var(--linear-blue)",
                                    color: saved ? "#15803D" : "#fff",
                                    border: "none", borderRadius: 8, padding: "12px",
                                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    transition: "all 0.2s"
                                }}>
                                    <Save size={15} />
                                    {saving ? "Saving..." : saved ? "Saved ✓" : criteria ? "Update Criteria" : "Save Criteria"}
                                </button>
                                <button onClick={handlePreview} disabled={previewing} style={{
                                    background: "var(--background-blue)", color: "var(--blue-text)",
                                    border: "none", borderRadius: 8, padding: "12px 20px",
                                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 6
                                }}>
                                    <Eye size={15} />
                                    {previewing ? "..." : "Preview"}
                                </button>
                            </div>
                        </div>

                        {/* Preview Card */}
                        <div style={{
                            background: "#fff", borderRadius: "var(--medium-radius)",
                            padding: "24px", border: "1px solid #E8ECF4",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                        }}>
                            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                                <Users size={16} color="var(--blue-text)" /> Eligible Pool
                            </h3>

                            {preview ? (
                                <div style={{ textAlign: "center", padding: "20px 0" }}>
                                    <div style={{ fontSize: 48, fontWeight: 800, color: "var(--blue-text)", marginBottom: 8 }}>
                                        {preview.eligibleCount}
                                    </div>
                                    <div style={{ color: "var(--content)", fontSize: 14 }}>users match your criteria</div>
                                    <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--background-blue)", borderRadius: 10 }}>
                                        <div style={{ fontSize: 12, color: "var(--blue-text)", fontWeight: 600 }}>
                                            Study ID: {preview.studyId?.slice(0, 8)}...
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--content)", fontSize: 14 }}>
                                    <Users size={32} color="#CBD5E1" style={{ margin: "0 auto 12px", display: "block" }} />
                                    Click Preview to see how many users match your criteria.
                                </div>
                            )}

                            {criteria && (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--content)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Current Criteria
                                    </div>
                                    {[
                                        ["Age", criteria.ageMin && criteria.ageMax ? `${criteria.ageMin} - ${criteria.ageMax}` : "Any"],
                                        ["Gender", criteria.gender || "Any"],
                                        ["Country", criteria.country || "Any"],
                                        ["Education", criteria.educationLevel || "Any"],
                                    ].map(([label, value]) => (
                                        <div key={label} style={{
                                            display: "flex", justifyContent: "space-between",
                                            padding: "8px 0", borderBottom: "1px solid #F0F4FA",
                                            fontSize: 13
                                        }}>
                                            <span style={{ color: "var(--content)" }}>{label}</span>
                                            <span style={{ fontWeight: 600, color: "var(--title)" }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
