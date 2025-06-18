// verifyToken.js
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
    // Get secret inside the function, not at module level
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
        const token = auth.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ msg: 'Access denied. Invalid token format.' });
        }
        
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ msg: 'Invalid token.' });
    }
}