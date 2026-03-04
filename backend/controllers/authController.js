const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { email, password, role, profile_data } = req.body;

    if (!['client', 'freelancer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const checkUser = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Transaction for inserting User and corresponding Profile
        await db.query('BEGIN');

        const insertUserText = `INSERT INTO Users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role`;
        const userResult = await db.query(insertUserText, [email, hashedPassword, role]);
        const user = userResult.rows[0];

        if (role === 'client') {
            await db.query(`INSERT INTO Client_Profile (client_id, company_name) VALUES ($1, $2)`,
                [user.user_id, profile_data.company_name || null]);
        } else if (role === 'freelancer') {
            await db.query(`INSERT INTO Freelancer_Profile (freelancer_id, bio, hourly_rate, experience_years) VALUES ($1, $2, $3, $4)`,
                [user.user_id, profile_data.bio || null, profile_data.hourly_rate || 0, profile_data.experience_years || 0]);
        }

        await db.query('COMMIT');

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ message: 'User registered successfully', token, user });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Logged in successfully', token, user: { user_id: user.user_id, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};
