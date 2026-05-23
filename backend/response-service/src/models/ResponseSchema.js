const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

/**
 * Snapshot of question at submission time
 * (prevents data inconsistency if survey changes later)
 */
const QuestionSnapshotSchema = new mongoose.Schema({
  questionId: String,
  text: String,
  questionType: {
    type: String,
    enum: ['TEXT', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'RATING_SCALE', 'YES_NO', 'DATE']
  },
  isRequired: Boolean,
  options: [
    {
      optionId: String,
      label: String,
      value: String
    }
  ]
}, { _id: false });

/**
 * User answer per question
 */
const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  value: mongoose.Schema.Types.Mixed // flexible: string | number | array | boolean
}, { _id: false });

/**
 * MAIN RESPONSE MODEL
 */
const ResponseSchema = new mongoose.Schema({

  responseId: {
    type: String,
    default: () => randomUUID(),
    unique: true,
    required: true
  },

  studyId: {
    type: String,
    required: true,
    index: true
  },

  phaseId: {
    type: String,
    required: true,
    index: true
  },

  participantId: {
    type: String,
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED'],
    default: 'DRAFT'
  },

  answers: {
    type: [AnswerSchema],
    default: []
  },

  snapshot: {
    phaseId: String,
    phaseTitle: String,
    phaseOrder: Number,
    questions: [QuestionSnapshotSchema]
  },

  submittedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

/**
 * 🚨 BUSINESS RULE ENFORCEMENT
 * One response per participant per phase per study
 */
ResponseSchema.index(
  { studyId: 1, phaseId: 1, participantId: 1, status: 1 },
  { unique: true }
);

module.exports = mongoose.model("Response", ResponseSchema);