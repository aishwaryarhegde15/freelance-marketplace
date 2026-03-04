const db = require('../config/db');

exports.submitBid = async (req, res) => {
    const { job_id, bid_amount, proposal } = req.body;
    const freelancer_id = req.user.user_id;

    try {
        const insertBidText = `
            INSERT INTO Bids (job_id, freelancer_id, bid_amount, proposal) 
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await db.query(insertBidText, [job_id, freelancer_id, bid_amount, proposal]);

        res.status(201).json({ message: 'Bid submitted successfully', bid: result.rows[0] });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // unique violation
            return res.status(400).json({ error: 'You have already placed a bid on this job' });
        }
        res.status(500).json({ error: 'Failed to submit bid' });
    }
};

exports.getBidsForJob = async (req, res) => {
    const { job_id } = req.params;
    const user_id = req.user.user_id;
    const user_role = req.user.role;

    try {
        // Validate job owner
        if (user_role === 'client') {
            const jobCheck = await db.query('SELECT client_id FROM Jobs WHERE job_id = $1', [job_id]);
            if (jobCheck.rows.length === 0 || jobCheck.rows[0].client_id !== user_id) {
                return res.status(403).json({ error: 'Unauthorized to view these bids' });
            }
        }

        const queryText = `
            SELECT b.*, f.bio, f.hourly_rate, f.experience_years, u.email
            FROM Bids b
            JOIN Freelancer_Profile f ON b.freelancer_id = f.freelancer_id
            JOIN Users u ON f.freelancer_id = u.user_id
            WHERE b.job_id = $1
            ORDER BY b.bid_amount ASC
        `;
        const result = await db.query(queryText, [job_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bids' });
    }
};
