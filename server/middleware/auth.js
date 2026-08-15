import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_store_rating_key_2026!';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token exists in database (has not been deleted on logout)
    const tokenRecords = await db.query('SELECT id FROM jwt_tokens WHERE token = ?', [token]);
    if (tokenRecords.length === 0) {
      return res.status(401).json({ message: 'Token has been deleted or logged out. Please log in again.' });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}
