import SideBarParticipant from "../../components/recruitment/SideBarParticipant";
import TopNavBar from "../../components/TopNavBar";
import { useState } from "react";
import { Trophy, DollarSign, CheckCircle2, Clock } from "lucide-react";

export default function Rewards() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard">
            <TopNavBar page="home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBarParticipant page="rewards" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="wrapper">
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <Trophy size={20} color="var(--blue-text)" /> My Rewards
                    </h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>Track your earnings from study participations</p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
                    {[
                        { label: "Total Earned", value: "$0.00", icon: <Trophy size={20} color="var(--blue-text)" />, tag: "LIFETIME" },
                        { label: "Pending Payment", value: "$0.00", icon: <Clock size={20} color="var(--blue-text)" />, tag: "PROCESSING" },
                        { label: "Completed Studies", value: "0", icon: <CheckCircle2 size={20} color="var(--blue-text)" />, tag: "TOTAL" },
                    ].map(({ label, value, icon, tag }) => (
                        <div key={label} style={{
                            background: "#fff", borderRadius: 14, padding: "22px 24px",
                            border: "1.5px solid #E8ECF4", boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--background-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {icon}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.05em" }}>{tag}</span>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--title)", marginBottom: 4 }}>{value}</div>
                            <div style={{ fontSize: 13, color: "var(--content)" }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                <div style={{
                    textAlign: "center", padding: "70px 20px",
                    background: "#fff", borderRadius: "var(--radius)",
                    border: "1px solid #E8ECF4"
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "var(--background-blue)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 16px"
                    }}>
                        <DollarSign size={28} color="var(--blue-text)" />
                    </div>
                    <h3 style={{ fontWeight: 700, color: "var(--title)", marginBottom: 6 }}>No rewards yet</h3>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>
                        Complete study participations to earn rewards.
                    </p>
                </div>
            </div>
        </div>
    );
}