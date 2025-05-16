const mongoose = require('mongoose');

const analysisFieldSchema = new mongoose.Schema({
  expression: String,         // 표현의 특징
  interpretation: String      // 상징과 해석
}, { _id: false });

const htpReportSchema = new mongoose.Schema({
  testId: {
    type: Number,
    required: true
  },
  
  // House 분석
  houseSubject: analysisFieldSchema,
  houseRoof: analysisFieldSchema,
  houseWall: analysisFieldSchema,
  houseDoor: analysisFieldSchema,
  houseWindow: analysisFieldSchema,
  houseOthers: analysisFieldSchema,

  // Tree 분석
  treeSubject: analysisFieldSchema,
  treeStem: analysisFieldSchema,
  treeBranch: analysisFieldSchema,
  treeCrown: analysisFieldSchema,
  treeOthers: analysisFieldSchema,

  // Man 분석
  manSubject: analysisFieldSchema,
  manGenderExpression: analysisFieldSchema,
  manHead: analysisFieldSchema,
  manFace: analysisFieldSchema,
  manTorso: analysisFieldSchema,
  manArm: analysisFieldSchema,
  manLeg: analysisFieldSchema,
  manHand: analysisFieldSchema,
  manFoot: analysisFieldSchema,
  manOthers : analysisFieldSchema,
  manCharacter: analysisFieldSchema,

  // Woman 분석
  womanSubject: analysisFieldSchema,
  womanGenderExpression: analysisFieldSchema,
  womanHead: analysisFieldSchema,
  womanFace: analysisFieldSchema,
  womanTorso: analysisFieldSchema,
  womanArm: analysisFieldSchema,
  womanLeg: analysisFieldSchema,
  womanHand: analysisFieldSchema,
  womanFoot: analysisFieldSchema,
  womanOthers : analysisFieldSchema,
  womanCharacter: analysisFieldSchema


}, { timestamps: true });

module.exports = mongoose.model('HTPReport', htpReportSchema);
