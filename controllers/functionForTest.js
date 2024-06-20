const Report = require('../models/Report');
const Appointment = require('../models/Appointment');

exports.createReport = async (req,res,next)=>{
    //dentist
    if(req.user.userType === "dentist"){
        try{
            const currentDate = new Date();
            const appointment = await Appointment.findById(req.body.appointmentId);
            if(currentDate < appointment.appDate){
                return res.status(400).json({
                  success: false,
                  message: 'Can not create report before appointment time',
                });
              }

            if(req.user._id.toString() !== appointment.dentist.toString() ){
                return res.status(401).json({success: false , message: "You are not appointment's dentist"});
            }
            const dupReport = await Report.find({appointmentId:req.body.appointmentId});
            if(dupReport.length!=0){
                return res.status(400).json({success: false , message: "This appointment already have a report"}) ;
            }
            const report = await Report.create({patientId:appointment.user, dentistId:appointment.dentist, appointmentId: req.body.appointmentId, treatment: req.body.treatment, prescribed_medication: req.body.prescribed_medication, recommendations: req.body.recommendations,date:appointment.appDate});
            res.status(201).json({
                success: true,
                data: report,
            });
        }
        catch(error){
            res.status(400).json({success: false}) ;
        }
    }
    else{
        res.status(401).json({success: false , message: "You are not authorized to create a report"});
    }
    }
    exports.updateReport = async (req,res,next)=>{
    //dentistId
        if(req.user.userType === "dentist"){
            try {
                const report = await Report.findById(req.params.id);
            
                if (!report) {
                    return res.status(400).json({ success: false });
                }
            
                if (report.dentistId.toString() !== req.user.id) {
                    return res.status(401).json({ success: false, message: "You are not authorized to update this report" });
                }
            
                const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            
                res.status(200).json({ success: true, data: updatedReport });
            } catch (err) {
                res.status(400).json({ success: false });
            }
            
        }
        else{
            res.status(401).json({success: false , message: "You are not authorized to update this report"});
        }
    }