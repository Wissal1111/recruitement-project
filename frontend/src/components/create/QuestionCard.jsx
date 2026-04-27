import { useState } from "react";
import "./QuestionCard.css";

const QUESTION_TYPES = [
  { value: "TEXT",            label: "Short Text" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "SINGLE_CHOICE",   label: "Single Choice" },
  { value: "RATING_SCALE",    label: "Rating Scale" },
  { value: "YES_NO",          label: "Yes / No" },
  { value: "DATE",            label: "Date" },
];

export default function QuestionCard({ orderIndex = 1, onDelete, onDuplicate }) {
  const [title, setTitle]       = useState("");
  const [type, setType]         = useState("MULTIPLE_CHOICE");
  const [required, setRequired] = useState(true);
  const [options, setOptions]   = useState(["", "", ""]);

  const addOption    = () => setOptions([...options, ""]);
  const removeOption = (i) => options.length > 1 && setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, val) => setOptions(options.map((o, idx) => (idx === i ? val : o)));

  const isChoiceType = ["MULTIPLE_CHOICE", "SINGLE_CHOICE"].includes(type);

  const renderOptionsArea = () => {
    if (type === "TEXT") return (
      <div>
        <span className="qc__label qc__opts-label">Response Preview</span>
        <div className="qc__text-hint">Participants will type their answer in a text field.</div>
      </div>
    );

    if (type === "RATING_SCALE") return (
      <div>
        <span className="qc__label qc__opts-label">Scale Preview (1–10)</span>
        <div className="qc__rating">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="qc__rating-dot">{i + 1}</div>
          ))}
        </div>
      </div>
    );

    if (type === "YES_NO") return (
      <div>
        <span className="qc__label qc__opts-label">Options Preview</span>
        <div className="qc__yesno">
          <div className="qc__yesno-btn">&nbsp; Yes</div>
          <div className="qc__yesno-btn">&nbsp; No</div>
        </div>
      </div>
    );

    if (type === "DATE") return (
      <div>
        <span className="qc__label qc__opts-label">Response Preview</span>
        <div className="qc__date-preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9192B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Participants will pick a date.
        </div>
      </div>
    );

    return (
      <div>
        <span className="qc__label qc__opts-label">Options</span>
        <div className="qc__options">
          {options.map((opt, i) => (
            <div key={i} className="qc__option-row">
              <div className={`qc__option-radio ${type === "MULTIPLE_CHOICE" ? "qc__option-radio--checkbox" : ""}`} />
              <input
                className="qc__option-input"
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              <button className="qc__option-remove" onClick={() => removeOption(i)}>×</button>
            </div>
          ))}
        </div>
        <button className="qc__add-option" onClick={addOption}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add option
        </button>
      </div>
    );
  };

  return (
    <>
    <p className="create-questions__label">
                Question {orderIndex}
            </p>
    <div className="qc__card">
      <div className="qc__drag"><div className="qc__drag-icon" /></div>

      <div className="qc__body">
        <div className="qc__top">
          <div>
            <label className="qc__label">Question Title</label>
            <input
              className="qc__title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Type your question here..."
            />
          </div>
          <div>
            <label className="qc__label">Response Type</label>
            <select className="qc__type-select" value={type} onChange={(e) => setType(e.target.value)}>
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {renderOptionsArea()}
      </div>

      <hr className="qc__divider" />

      <div className="qc__footer">
        <div className="qc__toggle-wrap">
          <button
            className={`qc__toggle ${required ? "" : "qc__toggle--off"}`}
            onClick={() => setRequired(!required)}
          />
          <span className="qc__toggle-label">Required</span>
        </div>

        <div className="qc__footer-sep" />

        <button className="qc__duplicate" onClick={onDuplicate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          DUPLICATE
        </button>

        <div className="qc__footer-right">
          <button className="qc__icon-btn qc__icon-btn--danger" onClick={onDelete} title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <button className="qc__icon-btn" title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}