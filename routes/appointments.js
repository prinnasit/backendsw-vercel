const express = require('express');

const {getAppointments , getAppointment , addAppointment , updateAppointment , deleteAppointment} = require('../controllers/appointments');

const ReportRouter = require('./reports') ;

const router = express.Router({mergeParams:true}) ;

const {protect  , authorize} = require('../middleware/auth') ;

//Re-route into other resource routers
router.use('/:appointmentId/reports/' , ReportRouter) ;

router.route('/').get(protect,getAppointments).post(protect, authorize('admin' , 'user'),addAppointment);
router.route('/:id').get(protect , getAppointment).put(protect, authorize('admin' , 'user') ,updateAppointment).delete(protect, authorize('admin' , 'user') ,deleteAppointment) ;

module.exports=router;