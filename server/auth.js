const jwt = require('jsonwebtoken');
const { db } = require('./db');

const protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the db
        await db.read();
        const user = db.data.users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }
        
        // Exclude password from the user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

module.exports = { protect };