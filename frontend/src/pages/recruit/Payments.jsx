import { useState } from "react";
import SideBar from "../../components/SideBar";
import TopNavBar from "../../components/TopNavBar";
import { CreditCard, Download, Filter, TrendingUp } from "lucide-react";

const MOCK_TRANSACTIONS = [
    {
        id: "INV-2025-192",
        title: "Survey Tier: Enterprise Pro",
        subtitle: "Invoice #LC-2025-192 • Oct 14, 2023",
        amount: 2400.00,
        status: "PAID",
        icon: "📄",
        iconBg: "#EEF0FF",
        date: "2023-10-14"
    },
    {
        id: "INV-2025-185",
        title: "Distribution Boost: Social Plus",
        subtitle: "Direct Marketing Spend • Oct 12, 2023",
        amount: 850.00,
        status: "PENDING",
        icon: "🎯",
        iconBg: "#FFF3EE",
        date: "2023-10-12"
    },
    {
        id: "INV-2025-911",
        title: "API Access: Data Stream",
        subtitle: "Invoice #LC-2025-911 • Oct 09, 2023",
        amount: 120.00,
        status: "PAID",
        icon: "⚙️",
        iconBg: "#F0FDF4",
        date: "2023-10-09"
    },
    {
        id: "INV-2025-166",
        title: "Survey Tier: Enterprise Pro",
        subtitle: "Invoice #LC-2025-166 • Sept 14, 2023",
        amount: 2400.00,
        status: "PAID",
        icon: "📄",
        iconBg: "#EEF0FF",
        date: "2023-09-14"
    },
];

const CATEGORY_BREAKDOWN = [
    { label: "Subscription", amount: 9400, color: "#7073FF" },
    { label: "Add-one", amount: 3250, color: "#A78BFA" },
    { label: "Distribution", amount: 1630, color: "#C4B5FD" },
];

const STATUS_STYLES = {
    PAID:    { bg: "#F0FDF4", color: "#15803D", label: "PAID" },
    PENDING: { bg: "#FFF7ED", color: "#C2410C", label: "PENDING" },
    FAILED:  { bg: "#FEF2F2", color: "#DC2626", label: "FAILED" },
};

export default function Payments() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filter, setFilter] = useState("ALL");

    const currentBalance = 14280.00;
    const monthlyLimit = 25000.00;
    const spent = 14280.00;
    const remaining = monthlyLimit - spent;
    const spentPercent = Math.round((spent / monthlyLimit) * 100);

    const filtered = filter === "ALL"
        ? MOCK_TRANSACTIONS
        : MOCK_TRANSACTIONS.filter(t => t.status === filter);

    return (
        <div className="dashboard">
            <TopNavBar page="recruit" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="payments" part="recruit" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--title)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
                        <CreditCard size={22} color="var(--blue-text)" />
                        Financial Intelligence
                    </h1>
                    <p style={{ color: "var(--content)", fontSize: 14 }}>
                        Monitor your editorial spend and survey distribution budgets with real-time analytics and transparent invoicing.
                    </p>
                </div>

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24 }}>
                    {/* Balance Card */}
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: "28px 28px",
                        border: "1px solid #E8ECF4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.08em", marginBottom: 8 }}>
                            CURRENT BALANCE
                        </div>
                        <div style={{ fontSize: 34, fontWeight: 800, color: "var(--title)", marginBottom: 12 }}>
                            ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#15803D", fontWeight: 600 }}>
                            <TrendingUp size={14} color="#15803D" />
                            +12.5% from last month
                        </div>
                    </div>

                    {/* Budget Card */}
                    <div style={{
                        background: "#fff", borderRadius: 16, padding: "28px 28px",
                        border: "1px solid #E8ECF4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.08em", marginBottom: 6 }}>
                                    MONTHLY BUDGET LIMIT
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--title)" }}>
                                    ${monthlyLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.08em", marginBottom: 6 }}>
                                    REMAINING
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--blue-text)" }}>
                                    ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ background: "#F0F4FA", borderRadius: 6, height: 8, marginBottom: 10, overflow: "hidden" }}>
                            <div style={{
                                background: "linear-gradient(90deg, #7073FF, #5B5EFF)",
                                height: "100%", borderRadius: 6,
                                width: `${spentPercent}%`,
                                transition: "width 0.5s"
                            }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--content)" }}>
                            <span>Spent: ${spent.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({spentPercent}%)</span>
                            <span>Threshold: ${monthlyLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
                    {/* Transactions */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8ECF4", overflow: "hidden" }}>
                        {/* Transactions Header */}
                        <div style={{
                            padding: "18px 24px", borderBottom: "1px solid #E8ECF4",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--title)" }}>
                                Recent Transactions
                            </h2>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button style={{
                                    background: "none", border: "1px solid #E8ECF4", borderRadius: 8,
                                    padding: "6px 14px", fontSize: 13, fontWeight: 600,
                                    color: "var(--content)", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 4
                                }}>
                                    <Filter size={13} /> Filter
                                </button>
                                <button style={{
                                    background: "none", border: "1px solid #E8ECF4", borderRadius: 8,
                                    padding: "6px 14px", fontSize: 13, fontWeight: 600,
                                    color: "var(--content)", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 4
                                }}>
                                    <Download size={13} /> Export
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ padding: "12px 24px", borderBottom: "1px solid #F0F4FA", display: "flex", gap: 6 }}>
                            {["ALL", "PAID", "PENDING", "FAILED"].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    background: filter === f ? "var(--linear-blue)" : "#F5F6FA",
                                    color: filter === f ? "#fff" : "var(--content)",
                                    border: "none", borderRadius: 20, padding: "5px 14px",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    transition: "all 0.15s"
                                }}>{f}</button>
                            ))}
                        </div>

                        {/* Transaction List */}
                        <div>
                            {filtered.map((t, i) => {
                                const s = STATUS_STYLES[t.status] || STATUS_STYLES.PAID;
                                return (
                                    <div key={t.id} style={{
                                        padding: "16px 24px",
                                        borderBottom: i < filtered.length - 1 ? "1px solid #F5F6FA" : "none",
                                        display: "flex", alignItems: "center", gap: 14
                                    }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: 42, height: 42, borderRadius: 12,
                                            background: t.iconBg,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 18, flexShrink: 0
                                        }}>{t.icon}</div>

                                        {/* Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--title)", marginBottom: 2 }}>
                                                {t.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: "var(--content)" }}>
                                                {t.subtitle}
                                            </div>
                                        </div>

                                        {/* Amount + Status */}
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--title)", marginBottom: 4 }}>
                                                ${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </div>
                                            <span style={{
                                                background: s.bg, color: s.color,
                                                borderRadius: 20, padding: "2px 10px",
                                                fontSize: 11, fontWeight: 700
                                            }}>{s.label}</span>
                                        </div>

                                        {/* Download */}
                                        <button style={{
                                            background: "none", border: "1px solid #E8ECF4", borderRadius: 6,
                                            padding: "6px 8px", cursor: "pointer", color: "var(--content)",
                                            marginLeft: 8
                                        }}>
                                            <Download size={13} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Category Breakdown */}
                        <div style={{
                            background: "#fff", borderRadius: 16, padding: "24px",
                            border: "1px solid #E8ECF4"
                        }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--title)", marginBottom: 20 }}>
                                Category Breakdown
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {CATEGORY_BREAKDOWN.map(cat => (
                                    <div key={cat.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color }} />
                                                <span style={{ fontSize: 13, color: "var(--content)" }}>{cat.label}</span>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--title)" }}>
                                                ${cat.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ background: "#F0F4FA", borderRadius: 4, height: 4, overflow: "hidden" }}>
                                            <div style={{
                                                background: cat.color, height: "100%", borderRadius: 4,
                                                width: `${Math.round((cat.amount / 14280) * 100)}%`
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Next Bill */}
                        <div style={{
                            background: "#fff", borderRadius: 16, padding: "24px",
                            border: "1px solid #E8ECF4"
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--content)", letterSpacing: "0.08em", marginBottom: 8 }}>
                                NEXT EXPECTED BILL
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--title)", marginBottom: 16 }}>
                                Nov 01, 2023
                            </div>
                            <button style={{
                                width: "100%", background: "var(--background-blue)",
                                color: "var(--blue-text)", border: "none", borderRadius: 10,
                                padding: "10px", fontWeight: 700, fontSize: 13, cursor: "pointer"
                            }}>
                                VIEW UPCOMING
                            </button>
                        </div>

                        {/* Create New Survey */}
                        <button style={{
                            background: "var(--linear-blue)", color: "#fff", border: "none",
                            borderRadius: 14, padding: "16px", fontWeight: 700, fontSize: 14,
                            cursor: "pointer", width: "100%"
                        }}>
                            + Create New Survey
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}