const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  appDate: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  userName:{
    type: String,
    required:[true, "Please add User's name"]
},
  dentist: {
    type: mongoose.Schema.ObjectId,
    ref: "Dentist",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  finished: {
    type: Boolean,
    default: false,
  }
},

{
    toJSON: {virtuals : true} ,
    toObject:{virtuals : true}
}
);

AppointmentSchema.virtual('report',{
  ref : 'Report',
  localField: '_id',
  foreignField: 'appointmentId',
  justOne:false 
}) ;

module.exports = mongoose.model("Appointment", AppointmentSchema);
