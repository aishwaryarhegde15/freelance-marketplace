const db = require('../config/db');

exports.createJob = async (req, res) => {
    const { category_id, title, description, budget, skills } = req.body;
    const client_id = req.user.user_id; // from auth middleware

    try {
        await db.query('BEGIN');

        const insertJobText = `
            INSERT INTO Jobs (client_id, category_id, title, description, budget) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const jobResult = await db.query(insertJobText, [client_id, category_id, title, description, budget]);
        const job = jobResult.rows[0];

        // Insert job skills if array is passed
        if (skills && skills.length > 0) {
            for (let skill_id of skills) {
                await db.query(`INSERT INTO Job_Skills (job_id, skill_id) VALUES ($1, $2)`, [job.job_id, skill_id]);
            }
        }

        await db.query('COMMIT');
        res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        // Example of a slightly complex query joining category
        const queryText = `
            SELECT j.*, c.name as category_name, cl.company_name
            FROM Jobs j
            JOIN Categories c ON j.category_id = c.category_id
            JOIN Client_Profile cl ON j.client_id = cl.client_id
            ORDER BY j.created_at DESC
        `;
        const result = await db.query(queryText);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

exports.getJobById = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
            SELECT j.*, c.name as category_name, cl.company_name
            FROM Jobs j
            JOIN Categories c ON j.category_id = c.category_id
            JOIN Client_Profile cl ON j.client_id = cl.client_id
            WHERE j.job_id = $1
        `;
        const jobResult = await db.query(queryText, [id]);

        if (jobResult.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Fetch skills
        const skillsResult = await db.query(`
            SELECT s.name 
            FROM Job_Skills js
            JOIN Skills s ON js.skill_id = s.skill_id
            WHERE js.job_id = $1
        `, [id]);

        const job = jobResult.rows[0];
        job.skills = skillsResult.rows.map(s => s.name);

        res.status(200).json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
};
