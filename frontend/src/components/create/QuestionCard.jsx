import { useState, useEffect, useRef, useCallback } from "react";
import "./QuestionCard.css";

const QUESTION_TYPES = [
  { value: "TEXT",            label: "Short Text" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "SINGLE_CHOICE",   label: "Single Choice" },
  { value: "RATING_SCALE",    label: "Rating Scale" },
  { value: "YES_NO",          label: "Yes / No" },
  { value: "DATE",            label: "Date" },
];

const toStr = (o) => typeof o === "string" ? o : (o?.label ?? "");

const normalize = (q) => ({
  text:     q.text         || "",
  type:     q.questionType || "TEXT",
  required: q.isRequired   ?? true,
  options:  q.options?.length ? q.options.map(toStr) : [""],
});

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="qc__modal-overlay" onClick={onCancel}>
      <div className="qc__modal" onClick={(e) => e.stopPropagation()}>
        <p className="qc__modal-msg">{message}</p>
        <div className="qc__modal-btns">
          <button className="qc__modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="qc__modal-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionCard({ question, orderIndex = 1, onDelete, onDuplicate, onUpdate }) {
  const [form,        setForm]        = useState(() => normalize(question));
  const [original,    setOriginal]    = useState(() => normalize(question));
  const [showConfirm, setShowConfirm] = useState(false);
  const isDirty     = useRef(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!isDirty.current) {
      const normalized = normalize(question);
      setForm(normalized);
      setOriginal(normalized);
    }
  }, [question]);

  // flush on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const saveForm = useCallback(async (updatedForm, currentOriginal) => {
    const hasChanged =
      updatedForm.text     !== currentOriginal.text     ||
      updatedForm.type     !== currentOriginal.type     ||
      updatedForm.required !== currentOriginal.required ||
      JSON.stringify(updatedForm.options) !== JSON.stringify(currentOriginal.options);

     if (!hasChanged) return;

  try {
    const isChoiceType = ["MULTIPLE_CHOICE", "SINGLE_CHOICE"].includes(updatedForm.type);
    await onUpdate({
  text:         updatedForm.text,
  questionType: updatedForm.type,
  isRequired:   updatedForm.required,
  options:      updatedForm.options, 
  ù
});
    setOriginal(updatedForm); 
    isDirty.current = false;
  } catch (err) {
    console.error("Auto-save failed:", err);
  }
  }, [onUpdate]);

  const scheduleSave = useCallback((updatedForm, currentOriginal) => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    const isChoiceType = ["MULTIPLE_CHOICE", "SINGLE_CHOICE"].includes(updatedForm.type);
    const formToSave = {
      ...updatedForm,
      options: isChoiceType
        ? updatedForm.options.filter((o) => o.trim())
        : [],
    };
    saveForm(formToSave, currentOriginal);
  }, 1000);
}, [saveForm]);

  const handleChange = (field, value) => {
    isDirty.current = true;
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    scheduleSave(updatedForm, original);
  };

  const handleTypeChange = (value) => {
    isDirty.current = true;
    const needsOptions = ["MULTIPLE_CHOICE", "SINGLE_CHOICE"].includes(value);
    const updatedForm  = {
      ...form,
      type:    value,
      options: needsOptions && form.options.length === 0 ? [""] : form.options,
    };
    setForm(updatedForm);
    scheduleSave(updatedForm, original);
  };

  const handleRequiredToggle = () => {
    isDirty.current = true;
    const updatedForm = { ...form, required: !form.required };
    setForm(updatedForm);
    scheduleSave(updatedForm, original);
  };

  const addOption = () => {
    isDirty.current = true;
    const updatedForm = { ...form, options: [...form.options, ""] };
    setForm(updatedForm);
    scheduleSave(updatedForm, original);
  };

  const removeOption = (i) => {
    if (form.options.length <= 1) return;
    isDirty.current = true;
    const updatedForm = { ...form, options: form.options.filter((_, idx) => idx !== i) };
    setForm(updatedForm);
    scheduleSave(updatedForm, original);
  };

  const updateOption = (i, val) => {
    isDirty.current = true;
    const updatedForm = {
      ...form,
      options: form.options.map((o, idx) => (idx === i ? val : o)),
    };
    setForm(updatedForm);
    scheduleSave(updatedForm, original);
  };

  const handleDeleteClick   = () => setShowConfirm(true);
  const handleConfirmDelete = () => { setShowConfirm(false); onDelete(); };

  const isChoiceType = ["MULTIPLE_CHOICE", "SINGLE_CHOICE"].includes(form.type);

  const renderOptionsArea = () => {
    if (form.type === "TEXT") return (
      <div>
        <span className="qc__label qc__opts-label">Response Preview</span>
        <div className="qc__text-hint">Participants will type their answer in a text field.</div>
      </div>
    );

    if (form.type === "RATING_SCALE") return (
      <div>
        <span className="qc__label qc__opts-label">Scale Preview (1–10)</span>
        <div className="qc__rating">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="qc__rating-dot">{i + 1}</div>
          ))}
        </div>
      </div>
    );

    if (form.type === "YES_NO") return (
      <div>
        <span className="qc__label qc__opts-label">Options Preview</span>
        <div className="qc__yesno">
          <div className="qc__yesno-btn">Yes</div>
          <div className="qc__yesno-btn">No</div>
        </div>
      </div>
    );

    if (form.type === "DATE") return (
      <div>
        <span className="qc__label qc__opts-label">Response Preview</span>
        <div className="qc__date-preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9192B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Participants will pick a date.
        </div>
      </div>
    );

    return (
      <div>
        <span className="qc__label qc__opts-label">Options</span>
        <div className="qc__options">
          {form.options.map((opt, i) => (
            <div key={i} className="qc__option-row">
              <div className={`qc__option-radio ${form.type === "MULTIPLE_CHOICE" ? "qc__option-radio--checkbox" : ""}`} />
              <input
                className="qc__option-input"
                value={toStr(opt)}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              <button className="qc__option-remove" onClick={() => removeOption(i)}>×</button>
            </div>
          ))}
        </div>
        <button className="qc__add-option" onClick={addOption}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add option
        </button>
      </div>
    );
  };

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this question?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <p className="create-questions__label">Question {orderIndex}</p>

      <div className="qc__card" tabIndex={-1}>
        <div className="qc__drag"><div className="qc__drag-icon" /></div>

        <div className="qc__body">
          <div className="qc__top">
            <div>
              <label className="qc__label">Question Title</label>
              <input
                className="qc__title-input"
                value={form.text}
                onChange={(e) => handleChange("text", e.target.value)}
                placeholder="Type your question here..."
              />
            </div>
            <div>
              <label className="qc__label">Response Type</label>
              <select
                className="qc__type-select"
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
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
              className={`qc__toggle ${form.required ? "" : "qc__toggle--off"}`}
              onClick={handleRequiredToggle}
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
            <button className="qc__icon-btn qc__icon-btn--danger" onClick={handleDeleteClick} title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
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