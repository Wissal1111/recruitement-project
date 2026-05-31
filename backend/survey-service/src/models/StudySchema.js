const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const QuestionOptionSchema = new mongoose.Schema({
  optionId: { type: String, default: () => randomUUID() },
  label: { type: String, required: true },
  value: { type: String, required: true },
  orderIndex: { type: Number, required: true }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  questionId: { type: String, default: () => randomUUID() },
  text: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['TEXT', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'RATING_SCALE', 'YES_NO', 'DATE'],
    required: true
  },
  isRequired: { type: Boolean, default: true },
  orderIndex: { type: Number, required: true },
  options: {
    type: [QuestionOptionSchema],
    default: [],
    validate: {
      validator: function (options) {
        const needsOptions = ['MULTIPLE_CHOICE', 'SINGLE_CHOICE'].includes(this.questionType);
        return needsOptions ? Array.isArray(options) && options.length > 0 : true;
      },
      message: 'SINGLE_CHOICE and MULTIPLE_CHOICE questions must include at least one option.'
    }
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const StudyPhaseSchema = new mongoose.Schema({
  phaseId: { type: String, default: () => randomUUID() },
  phaseOrder: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  phaseType: { type: String, enum: ['SCREENING', 'NORMAL'], required: true },
  rewardAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
  maxParticipants: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'COMPLETED'], default: 'PENDING' },
  questions: {
    type: [QuestionSchema],
    default: []
  }
}, { _id: false, timestamps: true });

const StudySchema = new mongoose.Schema({
  studyId: { type: String, default: () => randomUUID(), unique: true, required: true },
  creatorId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  studyStatus: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'COMPLETED'],
    default: 'DRAFT'
  },
  studyCategory: {
    type: String,
    enum: ['USABILITY', 'SURVEY', 'EXPERIMENT', 'INTERVIEW', 'OTHER'],
    required: true
  },
  totalBudget: { type: mongoose.Schema.Types.Decimal128, required: true },
  paymentSurveyId: { type: String, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isMultiPhase:{
    type:Boolean,
    required:true
  },
  phases: [StudyPhaseSchema]
}, { timestamps: true });

module.exports = mongoose.model('Study', StudySchema);
