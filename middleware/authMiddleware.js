const jwt= require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

exports.protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try{
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET);

            // Change this line to use 'userId' instead of 'id'
            req.user = await User.findById(decoded.userId).select('-password');

            if(!req.user){
                const error = new Error('User with this token does not exist.');
                error.statusCode = 401; 
                return next(error);
            }
            next();
        }
       catch (error) {
            // Handle token errors (expired, invalid, etc.)
            const err = new Error('Not authorized, token failed.');
            err.statusCode = 401;
            if (error.name === 'JsonWebTokenError') {
                err.message = 'Invalid token.';
            } else if (error.name === 'TokenExpiredError') {
                err.message = 'Token expired.';
            }
            return next(err);
        }

    }
    // If no token is provided in the Authorization header
    if (!token) 
    {
        const err = new Error('Not authorized, no token provided.');
        err.statusCode = 401;
        next(err);
    }
}

exports.authorize = (...roles) => 
    {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            const err = new Error(`User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.`);
            err.statusCode = 403; 
            return next(err);
        }
        next();
    };
};