const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Perfil = require('../models/perfil');
const { logRequest } = require('../utils');
const { protect } = require('../middleware/auth');

const jwtSecret = process.env.JWT_SECRET || 'drinkwater-jwt-secret-key-2026';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn
    });
};

// Send token response
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    const userObj = user.toObject();
    delete userObj.passwd;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: userObj
        }
    });
};

// POST /auth/register - Create new user
router.post('/register', logRequest, async (req, res) => {
    try {
        const { email, passwd, weight } = req.body;

        // Validate required fields
        if (!email || !passwd) {
            return res.status(400).json({
                status: 'error',
                message: 'Email e senha sao obrigatorios'
            });
        }

        // Check if user already exists
        const existingUser = await Perfil.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email ja cadastrado'
            });
        }

        // Generate next ID (simple auto-increment)
        const lastUser = await Perfil.findOne().sort({ id: -1 });
        const nextId = lastUser ? lastUser.id + 1 : 1;

        // Create user (password is hashed by pre-save hook)
        const newUser = await Perfil.create({
            id: nextId,
            email,
            passwd,
            weight: weight || 70,
            role: 'user'
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST /auth/login - Authenticate user
router.post('/login', logRequest, async (req, res) => {
    try {
        const { email, passwd } = req.body;

        // Validate input
        if (!email || !passwd) {
            return res.status(400).json({
                status: 'error',
                message: 'Por favor, forneca email e senha'
            });
        }

        // Find user and explicitly select password
        const user = await Perfil.findOne({ email: email.toLowerCase() }).select('+passwd');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Email ou senha incorretos no banco'
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(passwd);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'error',
                message: 'Email ou senha incorretos'
            });
        }

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET /auth/me - Get current user (protected route)
router.get('/me', protect, logRequest, async (req, res) => {
    try {
        const user = await Perfil.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario nao encontrado'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports.routerAuth = router;
