const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
    process.exit(1);
}
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';

//Registration route
router.post('/register', async (req, res, next) => {
    const { username, password, role } = req.body;
    try{
        let userRole= role;
        const userCount = await User.countDocuments();
        if(userCount === 0 &&(!role || role !== 'admin')) {
            userRole = 'admin'; // First user is admin
        }
        else if(role=== 'admin' && userCount >0)
        {
            console.warn(`Attempt to register user ${username} as admin by non-first user. Defaulting to 'user'.`);
            userRole = 'user';
        }

        const newUser = new User({ username, password, role: userRole || 'user' });
        await newUser.save();
        res.status(201).json({
            message: 'User registered successfully'});
    }
    catch(error)
    {
        next(error);
    }
})

//Login route
router.post('/login',async (req, res, next) => {
    const {username, password} = req.body;

    if(!username || !password) {
        const error = new Error('Username and password are required.');
        error.statusCode = 400;
        return next(error);
    }

    try{
        const user = await User.findOne({username: username.toLowerCase()});
        if(!user){
            const error = new Error('Invalid credentials. (User not found)');
            error.statusCode = 401;
            return next(error);
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            const error = new Error('Invalid credentials. (Password mismatch)');
            error.statusCode = 401;
            return next(error);
        }

        const payload = {
            userId: user._id,
            username: user.username,
            role: user.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch(error) {
        next(error);
    }
})

module.exports = router;