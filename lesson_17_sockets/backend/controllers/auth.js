const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// =====================
// SIGNUP
// =====================
exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed.');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const {email, name, password} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            name,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User created successfully',
            userId: user.id
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// LOGIN
// =====================
exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({where: {email}});
        if (!user) {
            const error = new Error('Invalid email.');
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Invalid password.');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                email: user.email,
                userId: user.id
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.status(200).json({
            token,
            userId: user.id.toString(),
            message: 'Logged in successfully'
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// GET STATUS
// =====================
exports.status = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!userId) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            status: user.status
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};

// =====================
// UPDATE STATUS
// =====================
exports.updateStatus = async (req, res, next) => {
    try {
        const userId = req.userId;
        const {status} = req.body;

        if (!userId) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            message: 'Status updated successfully',
            status: user.status
        });
    } catch (err) {
        err.statusCode ||= 500;
        next(err);
    }
};
