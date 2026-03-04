const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRole('freelancer'), bidController.submitBid);
router.get('/job/:job_id', authenticateToken, authorizeRole('client', 'admin'), bidController.getBidsForJob);

module.exports = router;
