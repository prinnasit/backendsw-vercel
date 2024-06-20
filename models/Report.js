const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  dentistId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Dentist'
  },
  appointmentId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Appointment'
  },
  treatment: {
    type: String,
    required: true,
  },
  prescribed_medication: {
    type: String,
    required: true,
  },
  recommendations: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true
  },
  
});

ReportSchema.index({ date: 1 }, { expireAfterSeconds: 5 * 365 * 24 * 60 * 60 });

module.exports = mongoose.model("Report", ReportSchema);
