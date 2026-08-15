import bcrypt from 'bcryptjs';
import db from '../config/db.js';

// Get Admin Dashboard Stats
export async function getDashboardStats(req, res) {
  try {
    const usersCountRes = await db.query('SELECT COUNT(*) as total FROM users');
    const storesCountRes = await db.query('SELECT COUNT(*) as total FROM stores');
    const ratingsCountRes = await db.query('SELECT COUNT(*) as total FROM ratings');

    res.json({
      totalUsers: usersCountRes[0]?.total || 0,
      totalStores: storesCountRes[0]?.total || 0,
      totalRatings: ratingsCountRes[0]?.total || 0
    });
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
  }
}

// Add New Store
export async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existing = await db.query('SELECT id FROM stores WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Store email already exists', errors: { email: 'Email already exists' } });
    }

    if (ownerId) {
      const ownerCheck = await db.query('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (ownerCheck.length === 0 || ownerCheck[0].role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Assigned owner must be a valid Store Owner' });
      }
    }

    const result = await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, address.trim(), ownerId || null]
    );

    res.status(201).json({ message: 'Store created successfully', storeId: result.insertId });
  } catch (err) {
    console.error('[CREATE STORE ERROR]', err);
    res.status(500).json({ message: 'Failed to create store' });
  }
}

// Add New User (Admin, Normal User, or Store Owner)
export async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User email already exists', errors: { email: 'Email already exists' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, address.trim(), role]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (err) {
    console.error('[CREATE USER ERROR]', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
}

// Get Stores Listing (Name, Email, Address, Overall Rating) with Filters & Sorting
export async function getStores(req, res) {
  try {
    const { search, name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
        u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    if (name) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }
    if (email) {
      sql += ` AND s.email LIKE ?`;
      params.push(`%${email.trim()}%`);
    }
    if (address) {
      sql += ` AND s.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    sql += ` GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, u.name`;

    // Sorting validate
    const validSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating'
    };

    const sortColumn = validSortFields[sortBy.toLowerCase()] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const stores = await db.query(sql, params);
    // Round rating to 2 decimal places
    const formatted = stores.map(s => ({
      ...s,
      rating: Number(parseFloat(s.rating).toFixed(2))
    }));

    res.json({ stores: formatted });
  } catch (err) {
    console.error('[GET STORES ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch stores list' });
  }
}

// Get Normal & Admin Users (or all users) with Filters & Sorting
export async function getUsers(req, res) {
  try {
    const { name, email, address, role, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let sql = `
      SELECT id, name, email, address, role, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR address LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }
    if (name) {
      sql += ` AND name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }
    if (email) {
      sql += ` AND email LIKE ?`;
      params.push(`%${email.trim()}%`);
    }
    if (address) {
      sql += ` AND address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }
    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }

    const validSortFields = {
      name: 'name',
      email: 'email',
      address: 'address',
      role: 'role'
    };

    const sortColumn = validSortFields[sortBy.toLowerCase()] || 'name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const users = await db.query(sql, params);
    res.json({ users });
  } catch (err) {
    console.error('[GET USERS ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch users list' });
  }
}

// Get User Detailed Info (If Store Owner, display store overall rating)
export async function getUserDetails(req, res) {
  try {
    const { id } = req.params;

    const users = await db.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    let storeInfo = null;

    if (user.role === 'STORE_OWNER') {
      const storeRes = await db.query(
        `SELECT 
           s.id, s.name, s.email, s.address,
           COALESCE(AVG(r.rating), 0) as rating,
           COUNT(r.id) as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?
         GROUP BY s.id, s.name, s.email, s.address`,
        [user.id]
      );

      if (storeRes.length > 0) {
        storeInfo = {
          ...storeRes[0],
          rating: Number(parseFloat(storeRes[0].rating).toFixed(2))
        };
      }
    }

    res.json({
      user: {
        ...user,
        store: storeInfo,
        rating: storeInfo ? storeInfo.rating : null
      }
    });
  } catch (err) {
    console.error('[GET USER DETAILS ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
}
