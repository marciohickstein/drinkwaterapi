const jwt = require('jsonwebtoken');
const Perfil = require('../models/perfil');

const jwtSecret = process.env.JWT_SECRET || 'drinkwater-jwt-secret-key-2026';

// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Voce nao esta logado. Faca login para acessar.'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token expirado. Faca login novamente.'
                });
            }
            return res.status(401).json({
                status: 'error',
                message: 'Token invalido.'
            });
        }

        // Check if user still exists
        const currentUser = await Perfil.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'O usuario deste token nao existe mais.'
            });
        }

        // Grant access - attach user to request
        req.user = currentUser;
        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Voce nao tem permissao para executar esta acao'
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
