const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/metrics', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        // Complex Queries for Admin Analytics
        const totalUsers = await db.query(`SELECT COUNT(*) as count FROM Users`);
        const totalRevenue = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM Payments WHERE status='released'`);
        const activeContracts = await db.query(`SELECT COUNT(*) as count FROM Contracts WHERE status='active'`);

        const topFreelancers = await db.query(`
            SELECT f.freelancer_id, u.email, AVG(r.rating) as avg_rating
            FROM Freelancer_Profile f
            JOIN Users u ON f.freelancer_id = u.user_id
            JOIN Reviews r ON f.freelancer_id = r.reviewee_id
            GROUP BY f.freelancer_id, u.email
            HAVING AVG(r.rating) >= 4
            ORDER BY avg_rating DESC
            LIMIT 10;
        `);

        res.status(200).json({
            metrics: {
                total_users: parseInt(totalUsers.rows[0].count),
                total_revenue_released: parseFloat(totalRevenue.rows[0].total),
                active_contracts: parseInt(activeContracts.rows[0].count)
            },
            top_freelancers: topFreelancers.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Analytics failure' });
    }
});

module.exports = router;
