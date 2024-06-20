const express = require('express') ;
const {getDentists ,getDentist ,createDentist ,updateDentist ,deleteDentist , } = require('../controllers/dentists');
const router = express.Router();

//Include other resource routers 
const AppointmentRounter = require('./appointments') ;

const { protect , authorize } = require('../middleware/auth');
const swaggerJSDoc = require('swagger-jsdoc');

//Re-route into other resource routers
router.use('/:dentistId/appointments/' , AppointmentRounter) ;

router.route('/').get(getDentists).post(protect , authorize('admin'), createDentist) ;
router.route('/:id').get(getDentist).put(protect , authorize('admin'), updateDentist).delete(protect, authorize('admin') ,deleteDentist);

module.exports=router ;