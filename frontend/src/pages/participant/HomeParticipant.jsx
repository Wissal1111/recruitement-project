import { useState, useEffect } from "react";
import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import TopNavBar from "../../components/TopNavBar";
import { getMyInvitations, getMyParticipations, getEligibleStudies } from "../../api/RecruitmentApi";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/SideBar";
import { Rocket, Mail, Trophy, ArrowRight } from "lucide-react";

const STUDY_CATEGORIES = ["All Studies", "UX Research", "Technology", "Healthcare"];

const MOCK_STUDIES = [
    { id: 1, title: "AI in Journalism Ethics", tags: ["Ethics", "AI"], reward: 45, duration: 20, match: 98, icon: "🖥" },
    { id: 2, title: "Future of Remote Dev Tools", tags: ["Tech", "SaaS"], reward: 60, duration: 45, match: 92, icon: "💻" },
    { id: 3, title: "Digital Wellness Apps Study", tags: ["Health", "Mobile"], reward: 30, duration: 15, match: 85, icon: "🔧" },
];

const RECOMMENDED = [
    { id: 4, title: "AR/VR Interface Survey", desc: "A look into how spatial computing changes media consumption.", reward: 25, duration: 10, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=180&fit=crop" },
    { id: 5, title: "Financial Literacy Apps", desc: "Help us understand how Gen-Z manages their investments online.", reward: 35, duration: 15, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=180&fit=crop" },
    { id: 6, title: "Telehealth Experience", desc: "Share your feedback on the latest telehealth platform features.", reward: 50, duration: 25, img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=180&fit=crop" },
    { id: 7, title: "Data Privacy Study", desc: "Your opinions on personal data ownership in the age of AI.", reward: 40, duration: 20, img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=180&fit=crop" },
];

export default function HomeParticipant() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All Studies");
    const [pendingInv, setPendingInv] = useState(0);
    const [activePartic, setActivePartic] = useState(0);
    const [totalRewards] = useState(1240.50);
    const [eligibleStudies, setEligibleStudies] = useState([]);
    const navigate = useNavigate();

    const session = JSON.parse(localStorage.getItem("user") || "{}");
    const firstName = localStorage.getItem("firstname") || session?.firstname || "there";

    useEffect(() => {
        getMyInvitations()
            .then(r => setPendingInv(r.data.filter(i => i.status === "PENDING").length))
            .catch(() => {});
        getMyParticipations()
            .then(r => setActivePartic(r.data.filter(p => p.status === "ACTIVE").length))
            .catch(() => {});
        getEligibleStudies()
            .then(r => setEligibleStudies(r.data))
            .catch(() => {});
    }, []);

    const studiesToShow = eligibleStudies.length > 0
        ? eligibleStudies.map(s => ({
            id: s.studyId || s._id,
            title: s.title,
            tags: [s.studyCategory || "Research"],
            reward: s.totalBudget || 0,
            duration: 30,
            match: 95,
            icon: "🔬"
        }))
        : MOCK_STUDIES;

    return (
        <div className="dashboard">
            <TopNavBar page="home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
           <SideBar
                           page="dashboard"
                           part="home"
                           isOpen={sidebarOpen}
                           onClose={() => setSidebarOpen(false)}
                       />

            <div className="wrapper">
                {/* Hero Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #fff 60%, #EEF0FF 100%)",
                    borderRadius: 16, padding: "40px",
                    marginBottom: 32, position: "relative", overflow: "hidden",
                    border: "1px solid #E8ECF4",
                    boxShadow: "0 2px 12px rgba(112,115,255,0.06)"
                }}>
                    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "35%", background: "linear-gradient(135deg, #EEF0FF, #DDE0FF)", borderRadius: "0 16px 16px 0", opacity: 0.5 }} />
                    <div style={{ position: "relative" }}>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--title)", marginBottom: 8 }}>
                            Welcome back, <span style={{ color: "var(--blue-text)" }}>{firstName}!</span>
                        </h1>
                        <p style={{ color: "var(--content)", fontSize: 15, maxWidth: 500 }}>
                            Find studies matching your interests and earn rewards.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
                    <StatCard
                        label="Active Participations"
                        value={activePartic}
                        tag="LIVE NOW"
                        icon={<Rocket size={20} color="var(--blue-text)" />}
                        onClick={() => navigate("/home/activity")}
                    />
                    <StatCard
                        label="Pending Invitations"
                        value={pendingInv}
                        tag="NEW FOR YOU"
                        icon={<Mail size={20} color="var(--blue-text)" />}
                        highlight
                        onClick={() => navigate("/home/invitations")}
                    />
                    <StatCard
                        label="Total Rewards Earned"
                        value={`$${totalRewards.toFixed(2)}`}
                        tag="AVAILABLE"
                        icon={<Trophy size={20} color="var(--blue-text)" />}
                    />
                </div>

                {/* Categories */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    {STUDY_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                            background: activeCategory === cat ? "var(--linear-blue)" : "#fff",
                            color: activeCategory === cat ? "#fff" : "var(--content)",
                            border: `1.5px solid ${activeCategory === cat ? "transparent" : "#E8ECF4"}`,
                            borderRadius: 20, padding: "8px 18px", cursor: "pointer",
                            fontSize: 13, fontWeight: 600, transition: "all 0.15s"
                        }}>{cat}</button>
                    ))}
                    <button style={{
                        marginLeft: "auto", background: "transparent", border: "none",
                        color: "var(--content)", fontSize: 13, cursor: "pointer", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 4
                    }}>≡ More Filters</button>
                </div>

                {/* Studies Grid — vraies données ou mock fallback */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
                    {studiesToShow.map(study => (
                        <StudyCard key={study.id} study={study} />
                    ))}
                </div>

                {/* Recommended */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--title)" }}>Recommended For You</h2>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E8ECF4", background: "#fff", cursor: "pointer", fontSize: 16 }}>‹</button>
                        <button style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E8ECF4", background: "#fff", cursor: "pointer", fontSize: 16 }}>›</button>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {RECOMMENDED.map(s => (
                        <RecommendedCard key={s.id} study={s} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, tag, icon, highlight, onClick }) {
    return (
        <div onClick={onClick} style={{
            background: highlight ? "linear-gradient(135deg, #7073FF10, #5B5EFF08)" : "#fff",
            borderRadius: 14, padding: "22px 24px",
            border: `1.5px solid ${highlight ? "rgba(112,115,255,0.25)" : "#E8ECF4"}`,
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            cursor: onClick ? "pointer" : "default",
            transition: "box-shadow 0.15s"
        }}
            onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = "0 4px 16px rgba(112,115,255,0.12)")}
            onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)")}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em" }}>{tag}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--title)", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: "var(--content)" }}>{label}</div>
        </div>
    );
}

function StudyCard({ study }) {
    return (
        <div style={{
            background: "#fff", borderRadius: 14, padding: "20px",
            border: "1px solid #E8ECF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            cursor: "pointer", transition: "all 0.15s", position: "relative"
        }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
        >
            <div style={{ position: "absolute", top: 14, right: 14, background: "#F0FDF4", color: "#15803D", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                {study.match}% MATCH
            </div>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{study.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--title)", marginBottom: 10 }}>{study.title}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {study.tags.map(t => (
                    <span key={t} style={{ background: "var(--background-blue)", color: "var(--blue-text)", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{t}</span>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--title)" }}>${study.reward}.00</div>
                    <div style={{ fontSize: 12, color: "var(--content)" }}>{study.duration} mins duration</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowRight size={16} color="var(--blue-text)" />
                </div>
            </div>
        </div>
    );
}

function RecommendedCard({ study }) {
    return (
        <div style={{
            background: "#fff", borderRadius: 14, overflow: "hidden",
            border: "1px solid #E8ECF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            cursor: "pointer", transition: "all 0.15s"
        }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}
        >
            <img src={study.img} alt={study.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
            <div style={{ padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)", marginBottom: 6 }}>{study.title}</div>
                <div style={{ fontSize: 12, color: "var(--content)", marginBottom: 12, lineHeight: 1.5 }}>{study.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--title)" }}>${study.reward}.00</span>
                    <span style={{ background: "var(--background-blue)", color: "var(--blue-text)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{study.duration} Min</span>
                </div>
            </div>
        </div>
    );
}
