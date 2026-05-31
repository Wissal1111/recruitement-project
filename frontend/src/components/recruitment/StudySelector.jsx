export default function StudySelector({ studies, selectedStudy, onSelect, loading }) {
    if (loading) return (
        <div style={{
            background: "#fff", borderRadius: "var(--medium-radius)",
            padding: "16px 20px", border: "1px solid #E8ECF4", marginBottom: 24
        }}>
            <div style={{ width: "40%", height: 14, background: "#F0F4FA", borderRadius: 4 }} />
        </div>
    );

    return (
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
                value={selectedStudy?.studyId || ""}
                onChange={e => onSelect(studies.find(s => s.studyId === e.target.value))}
                style={{
                    flex: 1, border: "1.5px solid #E2E8F0", borderRadius: 8,
                    padding: "10px 14px", fontSize: 14, outline: "none",
                    color: "var(--title)", background: "#F8FAFC", cursor: "pointer"
                }}
                onFocus={e => e.target.style.borderColor = "#7073FF"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            >
                {studies.length === 0 && (
                    <option value="">No studies found</option>
                )}
                {studies.map(s => (
                    <option key={s.studyId} value={s.studyId}>
                        {s.title} — {s.studyStatus}
                    </option>
                ))}
            </select>
            {selectedStudy && (
                <span style={{
                    background: selectedStudy.studyStatus === "ACTIVE" ? "#F0FDF4" : "#F1F5F9",
                    color: selectedStudy.studyStatus === "ACTIVE" ? "#15803D" : "#64748B",
                    borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap"
                }}>
                    {selectedStudy.studyStatus}
                </span>
            )}
        </div>
    );
}