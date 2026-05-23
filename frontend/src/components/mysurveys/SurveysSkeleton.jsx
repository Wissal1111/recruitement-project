import "./SurveysSkeleton.css";

export default function SurveysSkeleton({ count = 5 }) {
    return (
        <div className="sk">
            {/* Header */}
            <div className="sk__header">
                <div>
                    <div className="sk__block sk__block--title" />
                    <div className="sk__block sk__block--sub" />
                </div>
                <div className="sk__stats">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="sk__stat-pill">
                            <div className="sk__circle" />
                            <div>
                                <div className="sk__block sk__block--label" />
                                <div className="sk__block sk__block--value" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter bar */}
            <div className="sk__filter-bar">
                <div className="sk__tabs">
                    {[80, 100, 90, 100, 90].map((w, i) => (
                        <div key={i} className="sk__block sk__block--tab" style={{ width: w }} />
                    ))}
                </div>
                <div className="sk__block sk__block--btn" />
            </div>

            {/* Table */}
            <div className="sk__table-card">
                {/* Table head */}
                <div className="sk__table-head">
                    {[200, 80, 70, 100, 60].map((w, i) => (
                        <div key={i} className="sk__block" style={{ width: w, height: 12 }} />
                    ))}
                </div>

                {/* Rows — matches actual survey count */}
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="sk__row">
                        {/* Title cell */}
                        <div className="sk__title-cell">
                            <div className="sk__icon-box" />
                            <div>
                                <div className="sk__block sk__block--row-title" />
                                <div className="sk__block sk__block--row-sub" />
                            </div>
                        </div>
                        {/* Status */}
                        <div className="sk__block sk__block--chip" />
                        {/* Phases */}
                        <div className="sk__block" style={{ width: 60, height: 13 }} />
                        {/* Budget */}
                        <div>
                            <div className="sk__block" style={{ width: 90, height: 14, marginBottom: 8 }} />
                            <div className="sk__block sk__block--bar" />
                            <div className="sk__block" style={{ width: 50, height: 10, marginTop: 4 }} />
                        </div>
                        {/* Actions */}
                        <div className="sk__actions">
                            {[0, 1, 2].map((j) => (
                                <div key={j} className="sk__action-box" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}