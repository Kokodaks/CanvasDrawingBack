const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  present: Boolean,
  expression: String,
  interpretation: String
}, { _id: false });

const drawingAnalysisSchema = new mongoose.Schema({
  subject: fieldSchema,
  roof: fieldSchema,
  wall: fieldSchema,
  door: fieldSchema,
  window: fieldSchema,
  others: fieldSchema,
  stem: fieldSchema,
  branch: fieldSchema,
  crown: fieldSchema,
  genderExpression: fieldSchema,
  head: fieldSchema,
  face: fieldSchema,
  torso: fieldSchema,
  arm: fieldSchema,
  leg: fieldSchema,
  hand: fieldSchema,
  foot: fieldSchema,
  character: fieldSchema,
}, { _id: false });

const htpReportSchema = new mongoose.Schema({
  testId: {
    type: Number,
    required: true,
  },
  name: String,
  gender: String,
  age: Number,
  birth: String,
  school: String,
  testDate: String,
  examiner: String,

  reason: String,
  background: String,
  familyTree: String,
  summary: String,
  overallFeeling: String,

  house: {
    analysis: drawingAnalysisSchema
  },
  tree: {
    analysis: drawingAnalysisSchema
  },
  person: {
    analysis: drawingAnalysisSchema
  }

}, { timestamps: true });

module.exports = mongoose.model('HTPReport', htpReportSchema);
