import { useState, useEffect } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { getEligibleStudies } from "../../api/RecruitmentApi";
import { applyToStudy } from "../../api/RecruitmentApi";
import { Search, BookOpen, Users, Clock } from "lucide-react";

export default function BrowseStudies() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState({});
    const [applied, setApplied] = useState({});

    useEffect(() => {
        getEligibleStudies()
            .then(res => setStudies(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleApply = async (studyId) => {
        setApplying(p => ({ ...p, [studyId]: true }));
        try {
            await applyToStudy({ studyId });
            setApplied(p => ({ ...p, [studyId]: true }));
        } catch (e) {
            console.error(e);
        } finally {
            setApplying(p => ({ ...p, [studyId]: false }));
        }
    };

    return (
        <div className="dashboard">
            <TopNavBar page="home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="browse" part="home" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <Search size={20} color="var(--blue-text)" /> Studies For You
                    </h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>
                        Studies matching your profile — you're eligible to participate in all of these.
                    </p>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : studies.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                        {studies.map(study => (
                            <StudyCard
                                key={study._id}
                                study={study}
                                onApply={() => handleApply(study._id)}
                                loading={applying[study._id]}
                                applied={applied[study._id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StudyCard({ study, onApply, loading, applied }) {
    return (
        <div style={{
            background: "#fff", borderRadius: "var(--medium-radius)",
            border: "1px solid #E8ECF4", padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", gap: 12,
            transition: "box-shadow 0.15s"
        }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
             onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
        >
            {/* Icon + Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen size={18} color="var(--blue-text)" />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)", marginBottom: 2 }}>
                        {study.title || "Untitled Study"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--content)" }}>
                        {study.researchField || "Research"}
                    </div>
                </div>
            </div>

            {/* Description */}
            {study.description && (
                <p style={{ fontSize: 13, color: "var(--content)", lineHeight: 1.5, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {study.description}
                </p>
            )}

            {/* Meta */}
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--content)", flexWrap: "wrap" }}>
                {study.maxParticipants && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={11} /> {study.maxParticipants} spots
          </span>
                )}
                {study.estimatedDuration && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} /> {study.estimatedDuration} min
          </span>
                )}
            </div>

            {/* Eligible badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ background: "#F0FDF4", color: "#15803D", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
          ✓ You're eligible
        </span>

                <button
                    onClick={onApply}
                    disabled={!!loading || applied}
                    style={{
                        background: applied ? "#F0FDF4" : "var(--linear-blue)",
                        color: applied ? "#15803D" : "#fff",
                        border: "none", borderRadius: 8, padding: "8px 16px",
                        fontWeight: 600, fontSize: 13, cursor: applied ? "default" : "pointer",
                        opacity: loading ? 0.6 : 1, transition: "all 0.2s"
                    }}>
                    {loading ? "..." : applied ? "Applied ✓" : "Apply"}
                </button>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{ textAlign: "center", padding: "70px 20px", background: "#fff", borderRadius: "var(--radius)", border: "1px solid #E8ECF4" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Search size={28} color="var(--blue-text)" />
            </div>
            <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 6 }}>No studies available</h3>
            <p style={{ color: "var(--content)", fontSize: 14 }}>
                No studies match your profile yet. Check back later.
            </p>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[1,2,3].map(i => (
                <div key={i} style={{ background: "#fff", borderRadius: "var(--medium-radius)", padding: "20px", border: "1px solid #E8ECF4", height: 180 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: "#F0F4FA" }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ width: "70%", height: 13, background: "#F0F4FA", borderRadius: 4, marginBottom: 6 }} />
                            <div style={{ width: "40%", height: 11, background: "#F0F4FA", borderRadius: 4 }} />
                        </div>
                    </div>
                    <div style={{ width: "100%", height: 10, background: "#F0F4FA", borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: "80%", height: 10, background: "#F0F4FA", borderRadius: 4 }} />
                </div>
            ))}
        </div>
    );
}