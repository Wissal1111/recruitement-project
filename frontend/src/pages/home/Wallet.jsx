import { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import SideBar from "../../components/SideBar";
import {
    getMyWallet, getWalletStats,
    getTransactionHistory, purchasePoints, getMyCards
} from "../../api/PayementApi";
import {
    Coins, TrendingUp, Lock, ArrowDownCircle,
    ArrowUpCircle, Gift, X, CreditCard
} from "lucide-react";
import "./Wallet.css";

const TX_FILTERS = ["All", "reward", "card_purchase", "allocation", "release"];

const TX_ICONS = {
    reward:       { bg: "#F0FDF4", color: "#15803D", icon: <Gift size={16} color="#15803D" /> },
    card_purchase:{ bg: "#EEF0FF", color: "#4338CA", icon: <CreditCard size={16} color="#4338CA" /> },
    allocation:   { bg: "#FFF7ED", color: "#C2410C", icon: <ArrowUpCircle size={16} color="#C2410C" /> },
    release:      { bg: "#F0FDF4", color: "#15803D", icon: <ArrowDownCircle size={16} color="#15803D" /> },
    commission:   { bg: "#FEF2F2", color: "#B91C1C", icon: <ArrowUpCircle size={16} color="#B91C1C" /> },
};

export default function Wallet() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [wallet, setWallet] = useState(null);
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [buyModal, setBuyModal] = useState(false);

    useEffect(() => {
        Promise.all([
            getMyWallet(),
            getWalletStats(),
            getTransactionHistory(),
        ]).then(([w, s, t]) => {
    setWallet(w.data?.wallet || w.data);   
    setStats(s.data);
    setTransactions(t.data?.transactions || t.data || []);

        }).catch(console.error)
          .finally(() => setLoading(false));
    }, []);

    const filtered = filter === "All"
        ? transactions
        : transactions.filter(t => t.type === filter);

    const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="dashboard wallet-page">
            <TopNavBar page="home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="wallet" part="home" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                {/* Balance Hero */}
                <div className="balance-hero">
                    <div className="balance-label">AVAILABLE POINTS</div>
                    <div className="balance-amount">
                        {loading ? "—" : fmt(wallet?.availablePoints)} pts
                    </div>
                    <div className="balance-cols">
                        <div className="balance-col">
                            <div className="balance-col-label">TOTAL EARNED</div>
                            <div className="balance-col-val">{fmt(wallet?.totalPoints)}</div>
                        </div>
                        <div className="balance-col">
                            <div className="balance-col-label">LOCKED</div>
                            <div className="balance-col-val">{fmt(wallet?.lockedPoints)}</div>
                        </div>
                    </div>
                    <button className="buy-btn" onClick={() => setBuyModal(true)}>
                        <CreditCard size={18} /> Buy Points
                    </button>
                </div>

                {/* Stats Row */}
                {stats && (
    <div className="stats-row">
        <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={18} color="var(--blue-text)" /></div>
            <div>
                <div className="stat-label">Total Earned</div>
                <div className="stat-value">{fmt(stats.wallet?.totalPoints)} pts</div>
            </div>
        </div>
        <div className="stat-card">
            <div className="stat-icon"><ArrowUpCircle size={18} color="var(--blue-text)" /></div>
            <div>
                <div className="stat-label">Total Spent</div>
                <div className="stat-value">{fmt(stats.wallet?.lockedPoints)} pts</div>
            </div>
        </div>
        <div className="stat-card">
            <div className="stat-icon"><Lock size={18} color="var(--blue-text)" /></div>
            <div>
                <div className="stat-label">Recent Transactions</div>
                <div className="stat-value">{stats.recentTransactions?.length ?? "—"}</div>
            </div>
        </div>
    </div>
)}

                {/* Transaction History */}
                <div className="section-header">
                    <span className="section-title">Transaction History</span>
                    <div className="filter-row">
                        {TX_FILTERS.map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? "active" : ""}`}
                                onClick={() => setFilter(f)}>
                                {f === "All" ? "All" : f.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tx-list">
                    {loading ? (
                        <TxSkeleton />
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--content)", fontSize: 14 }}>
                            No transactions found.
                        </div>
                    ) : (
                        filtered.map(tx => <TxRow key={tx.id} tx={tx} />)
                    )}
                </div>
            </div>

            {buyModal && (
                <BuyPointsModal
                    onClose={() => setBuyModal(false)}
                    onSuccess={(tx) => {
    setTransactions(p => [tx, ...p]);
    getMyWallet().then(r => setWallet(r.data?.wallet || r.data));
    setBuyModal(false);
}}
                />
            )}
        </div>
    );
}

function TxRow({ tx }) {
    const meta = TX_ICONS[tx.type] || TX_ICONS.commission;
    const isPositive = ["reward", "release", "card_purchase"].includes(tx.type);
    const amt = Number(tx.pointsValue ?? tx.amount ?? 0);

    return (
        <div className="tx-row">
            <div className="tx-icon" style={{ background: meta.bg }}>
                {meta.icon}
            </div>
            <div className="tx-desc">
                <div className="tx-title">{tx.description || tx.type?.replace("_", " ")}</div>
                <div className="tx-date">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                    })}
                </div>
            </div>
            <div>
                <div className={`tx-amount ${isPositive ? "positive" : "negative"}`}>
                    {isPositive ? "+" : "-"}{amt.toLocaleString()} pts
                </div>
                <div style={{ textAlign: "right", marginTop: 2, height: 20 }}>
                    <span className={`tx-status status-${tx.status}`}>{tx.status}</span>
                </div>
            </div>
        </div>
    );
}

function BuyPointsModal({ onClose, onSuccess }) {
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getMyCards().then(r => {
            setCards(r.data || []);
            if (r.data?.length) setSelectedCard(r.data[0].id);
        }).catch(() => {});
    }, []);

    const handleBuy = async () => {
        if (!selectedCard || !amount || Number(amount) <= 0) {
            setError("Please select a card and enter a valid amount.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await purchasePoints({ paymentCardId: selectedCard, amount: Number(amount) });
            onSuccess(res.data);
        } catch (e) {
            setError(e.response?.data?.error || "Purchase failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div className="modal-title" style={{ margin: 0 }}>Buy Points</div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <X size={20} color="var(--content)" />
                    </button>
                </div>

                <div className="modal-field">
                    <label>Select Card</label>
                    {cards.length === 0 ? (
                        <p style={{ fontSize: 13, color: "var(--content)" }}>
                            No cards found. <a href="/home/cards" style={{ color: "#7073FF" }}>Add a card first.</a>
                        </p>
                    ) : (
                        <select value={selectedCard} onChange={e => setSelectedCard(e.target.value)}>
                            {cards.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.cardName} •••• {c.lastFourDigits}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="modal-field">
                    <label>Budget $</label>
                    <input
                        type="number" min="1" placeholder="e.g. 500"
                        value={amount} onChange={e => setAmount(e.target.value)}
                    />
                </div>

                {amount && Number(amount) > 0 && (
    <div style={{ background: "#EEF0FF", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#4338CA", marginBottom: 4 }}>
        You will receive <strong>{Number(amount*5).toLocaleString()} pts</strong> for <strong>${Number(amount).toFixed(2)}</strong>
    </div>
)}

                {error && (
                    <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{error}</div>
                )}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleBuy} disabled={loading}>
                        {loading ? "Processing..." : "Confirm Purchase"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TxSkeleton() {
    return (
        <>
            {[1,2,3,4].map(i => (
                <div key={i} className="tx-row">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0F4FA", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ width: "50%", height: 12, background: "#F0F4FA", borderRadius: 4, marginBottom: 6 }} />
                        <div style={{ width: "30%", height: 10, background: "#F0F4FA", borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 60, height: 14, background: "#F0F4FA", borderRadius: 4 }} />
                </div>
            ))}
        </>
    );
}