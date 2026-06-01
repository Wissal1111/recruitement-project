import { useState, useEffect, useRef } from "react";
import TopNavBar from "../../components/TopNavBar";
import SideBar from "../../components/SideBar";
import { getMyCards, createCard, deleteCard } from "../../api/PayementApi";
import { PlusCircle, CreditCard, X, Trash2 } from "lucide-react";
import "./Cards.css";

const CARD_TYPES = ["paypal", "payoneer", "stripe", "custom"];

export default function Cards() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addModal, setAddModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchCards = () => {
        getMyCards()
            .then(r => setCards(r.data || []))
            .catch(() => setCards([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCards(); }, []);

    const handleDelete = async (cardId) => {
        setDeleting(true);
        try {
            await deleteCard(cardId);
            setCards(c => c.filter(x => x.id !== cardId));
            setDeleteConfirm(null);
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="dashboard cards-page">
            <TopNavBar page="home" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <SideBar page="cards" part="home" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="wrapper">
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--title)", marginBottom: 4 }}>
                        My Cards
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--content)" }}>
                        Manage your payment methods for buying points.
                    </p>
                </div>

                {loading ? (
                    <CardsSkeleton />
                ) : (
                    <div className="cards-grid">
                        {cards.map(card => (
                            <CardVisual
                                key={card.id}
                                card={card}
                                onDelete={() => setDeleteConfirm(card)}
                            />
                        ))}
                        <div className="add-card-box" onClick={() => setAddModal(true)}>
                            <PlusCircle size={28} />
                            Add New Card
                        </div>
                    </div>
                )}
            </div>

            {addModal && (
                <AddCardModal
                    onClose={() => setAddModal(false)}
                    onSuccess={(card) => {
                        setCards(p => [...p, card]);
                        setAddModal(false);
                    }}
                />
            )}

            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => { if (!deleting) setDeleteConfirm(null); }}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div className="modal-title" style={{ margin: 0 }}>Remove Card</div>
                            {!deleting && (
                                <button className="modal-close-btn" onClick={() => setDeleteConfirm(null)}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <p className="modal-description">
                            Are you sure you want to remove <strong>{deleteConfirm.cardName}</strong> ending in{" "}
                            <strong>••••{deleteConfirm.lastFourDigits}</strong>?
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary btn-danger"
                                onClick={() => handleDelete(deleteConfirm.id)}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <span className="modal-spinner" />
                                        Removing...
                                    </>
                                ) : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CardVisual({ card, onDelete }) {
    const [active, setActive] = useState(false);
    const wrapperRef = useRef(null);

    // Close overlay when clicking anywhere outside this card
    useEffect(() => {
        if (!active) return;
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setActive(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [active]);

    return (
        <div
            ref={wrapperRef}
            className={`card-wrapper ${active ? "card-wrapper--active" : ""}`}
            onClick={() => setActive(v => !v)}
        >
            <div className={`card-visual ${card.cardType}`}>
                {!card.isActive && <span className="inactive-badge">Inactive</span>}
                <div className="card-type-badge">{card.cardType}</div>
                <div>
                    <div className="card-number">•••• •••• •••• {card.lastFourDigits}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <div className="card-name">{card.cardName}</div>
                        <div className="card-budget">Budget: {Number(card.automaticBudget).toLocaleString()} $</div>
                    </div>
                    <CreditCard size={28} opacity={0.6} />
                </div>

                {/* Overlay — clicking the backdrop closes, button click triggers delete */}
                <div
                    className="card-overlay"
                    onClick={(e) => { e.stopPropagation(); setActive(false); }}
                >
                    <button
                        className="card-overlay-btn card-overlay-btn--delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(); setActive(false); }}
                    >
                        <Trash2 size={14} />
                        Remove Card
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddCardModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        cardName: "", cardType: "paypal", lastFourDigits: "", automaticBudget: "1000"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        if (!form.cardName || !form.lastFourDigits || form.lastFourDigits.length !== 4) {
            setError("Please fill all fields. Last 4 digits must be exactly 4 characters.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await createCard(form);
            onSuccess(res.data);
        } catch (e) {
            setError(e.response?.data?.error || "Failed to add card.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div className="modal-title" style={{ margin: 0 }}>Add New Card</div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-field">
                    <label>Card Name</label>
                    <input placeholder="e.g. My PayPal" value={form.cardName} onChange={e => set("cardName", e.target.value)} />
                </div>

                <div className="modal-field">
                    <label>Card Type</label>
                    <select value={form.cardType} onChange={e => set("cardType", e.target.value)}>
                        {CARD_TYPES.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="modal-field">
                    <label>Last 4 Digits</label>
                    <input
                        placeholder="1234" maxLength={4}
                        value={form.lastFourDigits}
                        onChange={e => set("lastFourDigits", e.target.value.replace(/\D/g, ""))}
                    />
                </div>

                <div className="modal-field">
                    <label>Budget $</label>
                    <input
                        type="number" min="0"
                        value={form.automaticBudget}
                        onChange={e => set("automaticBudget", e.target.value)}
                    />
                </div>

                {error && <div className="modal-error">{error}</div>}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Adding..." : "Add Card"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CardsSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[1, 2].map(i => (
                <div key={i} style={{ height: 160, borderRadius: 16, background: "#F0F4FA" }} />
            ))}
        </div>
    );
}