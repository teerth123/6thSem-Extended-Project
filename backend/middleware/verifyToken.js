// verifyToken.js
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
    const secret = process.env.secret;
    
    if (!secret) {
        console.error('JWT SECRET not found in environment variables');
        return res.status(500).json({ msg: 'Server configuration error' });
    }
    
    const auth = req.headers.authorization;
    
    if (!auth) {
        console.error("Authorization header not found");
        return res.status(401).json({ msg: 'Access denied. No token provided.' });
    }
    
    try {
        // More robust token extraction
        let token;
        
        if (auth.startsWith('Bearer ')) {
            token = auth.split(" ")[1];
        } else {
            // Handle case where token is sent without "Bearer " prefix
            token = auth;
        }
        
        // Additional validation
        if (!token || token === 'undefined' || token === 'null') {
            console.error('Invalid token:', token);
            return res.status(401).json({ msg: 'Access denied. Invalid token format.' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        console.error('Token received:', auth);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired. Please login again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token. Please login again.' });
        } else {
            return res.status(401).json({ msg: 'Token verification failed.' });
        }
    }
}