import db from '../config/db.js';
import { validateRating } from '../middleware/validation.js';

// Get list of stores with overall rating and current user's submitted rating
export async function getStoresForUser(req, res) {
  try {
    const userId = req.user.id;
    const { name, address, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.created_at,
        COALESCE(AVG(r.rating), 0) as overall_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating,
        ur.id as user_rating_id
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (search) {
      sql += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }
    if (name) {
      sql += ` AND s.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }
    if (address) {
      sql += ` AND s.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    sql += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating, ur.id`;

    const validSortFields = {
      name: 's.name',
      address: 's.address',
      overall_rating: 'overall_rating',
      user_rating: 'ur.rating'
    };

    const sortColumn = validSortFields[sortBy.toLowerCase()] || 's.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const stores = await db.query(sql, params);

    const formatted = stores.map(s => ({
      ...s,
      overall_rating: Number(parseFloat(s.overall_rating).toFixed(2)),
      user_rating: s.user_rating ? Number(s.user_rating) : null
    }));

    res.json({ stores: formatted });
  } catch (err) {
    console.error('[GET STORES FOR USER ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
}

// Submit or modify rating for a store
export async function submitOrUpdateRating(req, res) {
  try {
    const userId = req.user.id;
    const { storeId } = req.params;
    const { rating } = req.body;

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(400).json({ message: ratingErr, errors: { rating: ratingErr } });
    }

    // Check if store exists
    const storeCheck = await db.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeCheck.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if rating exists
    const existing = await db.query('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);

    const numRating = parseInt(rating);

    if (existing.length > 0) {
      // Update existing rating
      await db.query(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [numRating, existing[0].id]
      );
      res.json({ message: 'Rating updated successfully', ratingId: existing[0].id, rating: numRating });
    } else {
      // Insert new rating
      const result = await db.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, numRating]
      );
      res.status(201).json({ message: 'Rating submitted successfully', ratingId: result.insertId, rating: numRating });
    }
  } catch (err) {
    console.error('[SUBMIT RATING ERROR]', err);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
}
