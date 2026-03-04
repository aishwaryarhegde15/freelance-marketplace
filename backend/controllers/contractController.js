const db = require('../config/db');

// Client accepts a bid, which creates a contract and triggers the escrow payment creation
exports.acceptBidAndCreateContract = async (req, res) => {
    const { bid_id } = req.body;
    const client_id = req.user.user_id;

    try {
        await db.query('BEGIN');

        // Verify the bid and checking if job belongs to client
        const bidResult = await db.query(`
            SELECT b.job_id, b.freelancer_id, b.bid_amount, j.client_id, b.status 
            FROM Bids b 
            JOIN Jobs j ON b.job_id = j.job_id 
            WHERE b.bid_id = $1
        `, [bid_id]);

        if (bidResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Bid not found' });
        }

        const bid = bidResult.rows[0];

        if (bid.client_id !== client_id) {
            await db.query('ROLLBACK');
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (bid.status !== 'pending') {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: 'Bid is already accepted or rejected' });
        }

        // 1. Update Bid to accepted
        await db.query(`UPDATE Bids SET status = 'accepted' WHERE bid_id = $1`, [bid_id]);

        // 2. Reject other pending bids for this job
        await db.query(`UPDATE Bids SET status = 'rejected' WHERE job_id = $1 AND bid_id != $2`, [bid.job_id, bid_id]);

        // 3. Create Contract (this will fire the trigger 'trg_create_payment_func' and insert into Payments)
        const insertContractText = `
            INSERT INTO Contracts (job_id, client_id, freelancer_id, agreed_amount)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const contractResult = await db.query(insertContractText, [bid.job_id, client_id, bid.freelancer_id, bid.bid_amount]);

        // 4. Update Job status
        await db.query(`UPDATE Jobs SET status = 'in_progress' WHERE job_id = $1`, [bid.job_id]);

        await db.query('COMMIT');

        // Fetch the payment created by the trigger
        const paymentResult = await db.query(`SELECT * FROM Payments WHERE contract_id = $1`, [contractResult.rows[0].contract_id]);

        res.status(201).json({
            message: 'Bid accepted, Contract created, and Payment escrowed successfully',
            contract: contractResult.rows[0],
            payment: paymentResult.rows[0]
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Contract already exists for this job' });
        }
        res.status(500).json({ error: 'Failed to accept bid and create contract' });
    }
};

// Client releases payment upon job completion (Calls Stored Procedure)
exports.releaseEscrow = async (req, res) => {
    const { contract_id } = req.body;
    const client_id = req.user.user_id;

    try {
        // Validation check
        const contractCheck = await db.query(`SELECT client_id, status FROM Contracts WHERE contract_id = $1`, [contract_id]);

        if (contractCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        if (contractCheck.rows[0].client_id !== client_id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        if (contractCheck.rows[0].status !== 'active') {
            return res.status(400).json({ error: 'Contract is already completed or cancelled' });
        }

        // Use Stored Procedure
        await db.query(`CALL release_payment($1)`, [contract_id]);

        res.status(200).json({ message: 'Payment released successfully to the freelancer' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to release escrow payment' });
    }
};
