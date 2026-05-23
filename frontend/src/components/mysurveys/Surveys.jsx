import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, TrendingUp, DollarSign, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import StudyCard from "./StudyCard";
import "./Surveys.css";

const STATUS_TABS = ["All", "DRAFT", "PUBLISHED", "COMPLETED"];
const PAGE_SIZE = 8;

export default function Surveys({ studies = [], onStatusChange, onDelete }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("All");
    const [page,      setPage]      = useState(1);

    const filtered    = activeTab === "All" ? studies : studies.filter((s) => s.studyStatus === activeTab);
    const totalPages  = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
    const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalBudget = studies.reduce((a, s) => a + (parseFloat(s.totalBudget) || 0), 0);
    const activeCount = studies.filter((s) => s.studyStatus === "ACTIVE").length;

    return (
        <div>
            {/* Page header */}
            <div className="ms__header">
                <div>
                    <h1 className="ms__title">My Surveys</h1>
                    <p className="ms__sub">Manage your research studies and campaigns.</p>
                </div>
                <div className="ms__stats">
                    <div className="ms__stat-pill">
                        <div className="ms__stat-icon">
                            <Monitor size={16} strokeWidth={2} color="#4A4BD7" />
                        </div>
                        <div>
                            <p className="ms__stat-label">Total Surveys</p>
                            <p className="ms__stat-value">{studies.length}</p>
                        </div>
                    </div>
                    <div className="ms__stat-pill">
                        <div className="ms__stat-icon" style={{ background: "rgba(34,197,94,0.1)" }}>
                            <TrendingUp size={16} strokeWidth={2} color="#22C55E" />
                        </div>
                        <div>
                            <p className="ms__stat-label">Active</p>
                            <p className="ms__stat-value" style={{ color: "#22C55E" }}>{activeCount}</p>
                        </div>
                    </div>
                    <div className="ms__stat-pill">
                        <div className="ms__stat-icon" style={{ background: "rgba(245,158,11,0.1)" }}>
                            <DollarSign size={16} strokeWidth={2} color="#F59E0B" />
                        </div>
                        <div>
                            <p className="ms__stat-label">Total Budget</p>
                            <p className="ms__stat-value">${totalBudget.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="ms__filter-bar">
                <div className="ms__tabs">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`ms__tab ${activeTab === tab ? "ms__tab--active" : ""}`}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                        >
                            {tab === "All" ? "All Surveys" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                <button className="ms__filter-icon-btn" onClick={() => navigate("/recruit/create")}>
                    <Plus size={14} strokeWidth={2.5} />
                    New Study
                </button>
            </div>

            {/* Table */}
            <div className="ms__table-card">
                <div className="ms__table-head">
                    <div className="ms__th">Survey Title</div>
                    <div className="ms__th">Status</div>
                    <div className="ms__th">Phases</div>
                    <div className="ms__th">Budget</div>
                    <div className="ms__th ms__th--right">Actions</div>
                </div>

                {paginated.length > 0 ? paginated.map((study) => (
                    <StudyCard
                        key={study.studyId}
                        study={study}
                        onEdit={() => navigate(`/recruit/study/${study.studyId}/phases`)}
                        onDelete={() => onDelete(study.studyId)}
                        onStatusChange={onStatusChange}
                    />
                )) : (
                    <div className="ms__empty">
                        <Monitor size={32} strokeWidth={1.5} color="#C0C2D8" />
                        <p className="ms__empty-title">No studies found</p>
                        <p className="ms__empty-sub">Try a different filter or create a new study.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="ms__pagination">
                    <p className="ms__pagination-info">
                        Showing <b>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</b> of <b>{filtered.length}</b> surveys
                    </p>
                    <div className="ms__pagination-btns">
                        <button className="ms__pg-btn" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                            <ChevronLeft size={13} strokeWidth={2.5} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`ms__pg-btn ${page === p ? "ms__pg-btn--active" : ""}`}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button className="ms__pg-btn" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                            <ChevronRight size={13} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}