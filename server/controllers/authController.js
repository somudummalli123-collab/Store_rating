import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { validatePassword } from '../middleware/validation.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_store_rating_key_2026!';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Purge previous JWT token sessions for this user
    await db.query('DELETE FROM jwt_tokens WHERE user_id = ?', [user.id]);

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        jti: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Record new fresh JWT token in history table
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] || 'Unknown').substring(0, 255);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
      'INSERT INTO jwt_tokens (user_id, token, ip_address, user_agent, status, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, token, ipAddress, userAgent, 'ACTIVE', expiresAt]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req, res) {
  try {
    const token = req.token || (req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null);
    if (token) {
      // Delete old JWT token directly from database on logout
      await db.query('DELETE FROM jwt_tokens WHERE token = ?', [token]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[AUTH LOGOUT ERROR]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function signup(req, res) {
  try {
    const { name, email, password, address } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists', errors: { email: 'Email is already registered' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, address.trim(), 'NORMAL_USER']
    );

    res.status(201).json({
      message: 'Signup successful. You can now log in.',
      userId: result.insertId
    });
  } catch (err) {
    console.error('[AUTH SIGNUP ERROR]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      return res.status(400).json({ message: passErr, errors: { newPassword: passErr } });
    }

    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect', errors: { currentPassword: 'Current password is incorrect' } });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[UPDATE PASSWORD ERROR]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getProfile(req, res) {
  try {
    const users = await db.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    console.error('[GET PROFILE ERROR]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
