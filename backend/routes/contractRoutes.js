const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/accept-bid', authenticateToken, authorizeRole('client'), contractController.acceptBidAndCreateContract);
router.post('/release-escrow', authenticateToken, authorizeRole('client'), contractController.releaseEscrow);

module.exports = router;
