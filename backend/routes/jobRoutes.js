const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole('client'), jobController.createJob);
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

module.exports = router;
