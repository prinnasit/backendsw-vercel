const Appointment = require("../models/Appointment");
const Dentist = require("../models/Dentist");
const sendMail = require("../config/mail");
const Report = require("../models/Report");

//@dese     Get all appointments
//@route    Get  /api/v1/appointments
//@ts-check     Public
exports.getAppointments = async (req, res, next) => {
  let query;
  //General users can see only their appointments
  if (req.user.role !== "admin") {

    if(req.user.userType === "patient") {
      query = Appointment.find({ user: req.user.id, finished:false }).populate('dentist report');
    }
    else {
      query = Appointment.find({ dentist: req.user.id, finished:false }).populate('dentist report');
    }
  }
   else {
    //If you are an admin you can see all
    if (req.params.dentistID) {
      query = Appointment.find({
        dentist: req.params.dentistID,
      }).populate({
        path: "dentist"
      }).sort("finished");
    } else {
      query = Appointment.find().populate({
        path: "dentist"
      }).sort("finished");
    }
  }
  try {
    query.sort('appDate')
    const appointments = await query;
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@dese     Get single appointments
//@route    Get  /api/v1/appointments/:id
//@ts-check     Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate( req.user.role === "admin" ? 'dentist' : 'dentist report');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    if (
      (appointment.user.toString() !== req.user.id && appointment.dentist._id.toString() !== req.user.id ) &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this appointment `,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@dese     add appointments
//@route    post  /api/v1/dentist/:dentistId/appointment
//@ts-check     Public
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.dentist = req.params.dentistId;

    const dentist = await Dentist.findById(req.params.dentistId);

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: `No dentist with the id of ${req.params.dentistId}`,
      });
    }

    //add user Id to req.body
    req.body.user = req.user.id;
    req.body.userName = req.user.name;
    //Check for existed appointment
    const existedAppointments = await Appointment.find({ user: req.user.id });
    const existedAppointmentsForDentist = await Appointment.findOne({ 
      dentist: req.params.dentistId ,
      appDate: req.body.appDate
    });
    const activeAppointment = await Appointment.findOne({ 
      user: req.user.id, 
      finished: false
    });

    //If the user is not an admin , htey can only create 1 appointment
    // if (existedAppointments.length >= 1 && req.user.role !== "admin") {
    //   return res.status(400).json({
    //     success: false,
    //     message: `The user with id ${req.user.id} has already made 1 appointments`,
    //   });
    // }

    //Check if already active appointment
    if (activeAppointment && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with id ${req.user.id} already have an active appointment`,
      });
    }

    // Check if the appointment date is in the past
    const appointmentDate = new Date(req.body.appDate);
    const currentDate = new Date();
    if (appointmentDate < currentDate) {
      return res.status(418).json({
        success: false,
        message: 'You cannot create an appointment in the past.',
      });
    }

    if (existedAppointmentsForDentist) {
      return res.status(404).json({
        success: false,
        message: `The dentist with id ${req.params.dentistId} has already an appointment at ${req.body.appDate}`,
      });
    }

    const appointment = await Appointment.create(req.body);
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Appointment" });
  }
};

//@dese     update appointments
//@route    put  /api/v1/appointments/:id
//@ts-check     Public
exports.updateAppointment = async (req, res, next) => {
  try {
    
    const currentDate = new Date();
    let appointment = await Appointment.findById(req.params.id).populate('user dentist');
    let timeBeforeUpdate = appointment.appDate;
    if(currentDate > appointment.appDate && !req.body.finished){
      return res.status(400).json({
        success: false,
        message: 'This appointment is in progress',
      });
    }

    if(new Date(req.body.appDate) < currentDate){
      return res.status(400).json({
        success: false,
        message: 'You cannot update an appointment to the past.',
      });
    }
    let report = await Report.findOne({ appointmentId: req.params.id });
    const existedAppointmentsForDentist = await Appointment.findOne({ 
      dentist: req.body.dentist ,
      appDate: req.body.appDate
    });
    if (existedAppointmentsForDentist) {
      return res.status(400).json({
        success: false,
        message: `The dentist with id ${req.body.dentist} has already an appointment at ${req.body.appDate}`,
      });
    }
    if(!report && req.body.finished){
      return res.status(418).json({
        success: false,
        message: `No report with the appointment id of ${req.params.id}`,
      });
    }

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.dentistId}`,
      });
    }

    //Make sure user is the appointment owner
    if (
      appointment.user.id !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.userType !== "dentist"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment `,
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: appointment,
    });

    appointment = await Appointment.findById(req.params.id).populate('user dentist');

    var mailOptions = {
      from: `"DentNutz Support" <dentnutz@gmail.com>`,
      to: appointment.user.email,
      subject: "Your Appointment Has Been Updated",
      html: `
          <p>Dear ${appointment.userName},</p>
          <p>We would like to inform you that your appointment with <span style="color:red;">doctor ${appointment.dentist.name}</span> has been updated. The new details are as follows:</p>
          <ul>
              <li>Appointment Date: ${timeBeforeUpdate} -> <span style="color:red;">${appointment.appDate}</span></li>
              <li>Updated At: ${appointment.createdAt}</li>
          </ul>
          <p>John doe,</p>
          <p>DentNutz Support Team</p>
      `,
    };
    sendMail(mailOptions);

  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Appointment" });
  }
};

//@dese     delete appointments
//@route    DELETE  /api/v1/appointments/:id
//@ts-check     Peivate
exports.deleteAppointment = async (req, res, next) => {
  try {
    const currentDate = new Date();
    let appointment = await Appointment.findById(req.params.id).populate('user dentist');
    if(currentDate > appointment.appDate && req.user.role !== "admin"){
      return res.status(400).json({
        success: false,
        message: 'This appointment is in progress',
      });
    }
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.dentistId}`,
      });
    }
    
    //Make sure user is the appointment owner
    if (
      appointment.user.id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`,
      });
    }
    var mailOptions = {
      from: `"DentNutz Support" <dentnutz@gmail.com>`,
      to: appointment.user.email,
      subject: "Your Appointment Has Been Delete",
      html: `
          <p>Dear ${appointment.userName},</p>
          <p>We would like to inform you that your appointment with doctor ${appointment.dentist.name} has been Delete. The new details are as follows:</p>
          <ul>
              <li>Appointment Date: ${appointment.appDate}</li>
              <li>Deleted At: ${appointment.createdAt}</li>
          </ul>
          <p>John doe,</p>
          <p>DentNutz Support Team</p>
      `,
    };
    sendMail(mailOptions);
    await appointment.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Appointment" });
  }
};
