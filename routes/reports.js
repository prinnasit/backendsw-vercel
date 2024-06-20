const express = require('express') ;
const {getReports ,getReport ,createReport ,updateReport ,deleteReport , } = require('../controllers/reports');
const router = express.Router();

//Include other resource routers 

const { protect , authorize } = require('../middleware/auth');

//Re-route into other resource routers

router.route('/').get(protect , authorize('user'),getReports).post(protect , authorize('user'), createReport) ;
router.route('/:id').get(protect , authorize('user'), getReport).put(protect , authorize('user'), updateReport).delete(protect , authorize('admin'), deleteReport);

module.exports=router ;

