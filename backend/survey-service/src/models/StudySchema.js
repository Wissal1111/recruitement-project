const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

// 1. Schéma pour les options de questions (Question Options)
const QuestionOptionSchema = new mongoose.Schema({
  optionId: { type: String, default: () => randomUUID() },
  label: { type: String, required: true },
  value: { type: String, required: true },
  orderIndex: { type: Number, required: true }
}, { _id: false }); // On désactive _id car on utilise optionId

// 2. Schéma pour les questions (Questions)
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
  options: [QuestionOptionSchema], // Imbriqué
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// 3. Schéma pour le formulaire (Form)
const FormSchema = new mongoose.Schema({
  formId: { type: String, default: () => randomUUID() },
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema] // Imbriqué
}, { _id: false, timestamps: true });

// 4. Schéma pour les phases (Study Phases)
const StudyPhaseSchema = new mongoose.Schema({
  phaseId: { type: String, default: () => randomUUID() },
  phaseOrder: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  phaseType: { type: String, enum: ['SCREENING', 'NORMAL'], required: true },
  rewardAmount: { type: mongoose.Schema.Types.Decimal128, required: true },
  maxParticipants: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  form: FormSchema // Un seul formulaire par phase
}, { _id: false, timestamps: true });

// 5. Schéma Principal (Study)
const StudySchema = new mongoose.Schema({
  studyId: { type: String, default: () => randomUUID(), unique: true, required: true },
  creatorId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  studyStatus: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  studyCategory: {
    type: String,
    enum: ['USABILITY', 'SURVEY', 'EXPERIMENT', 'INTERVIEW', 'OTHER'],
    required: true
  },
  totalBudget: { type: mongoose.Schema.Types.Decimal128, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  phases: [StudyPhaseSchema] // Toutes les phases sont ici !
}, { timestamps: true });

module.exports = mongoose.model('Study', StudySchema);