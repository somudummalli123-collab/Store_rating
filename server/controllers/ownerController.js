import db from '../config/db.js';

// Get Dashboard Data for Store Owner
export async function getOwnerDashboard(req, res) {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'name', sortOrder = 'ASC' } = req.query;

    // Find store owned by this user
    const stores = await db.query('SELECT id, name, email, address FROM stores WHERE owner_id = ?', [ownerId]);
    if (stores.length === 0) {
      return res.json({
        hasStore: false,
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratingsList: []
      });
    }

    const store = stores[0];

    // Compute average rating and count
    const avgRes = await db.query(
      'SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const averageRating = Number(parseFloat(avgRes[0]?.avg_rating || 0).toFixed(2));
    const totalRatings = avgRes[0]?.total_ratings || 0;

    // Fetch list of users who submitted ratings
    let sql = `
      SELECT 
        r.id as rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `;

    const validSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      rating: 'r.rating',
      date: 'r.created_at'
    };

    const sortColumn = validSortFields[sortBy.toLowerCase()] || 'u.name';
    const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${direction}`;

    const ratingsList = await db.query(sql, [store.id]);

    res.json({
      hasStore: true,
      store,
      averageRating,
      totalRatings,
      ratingsList
    });
  } catch (err) {
    console.error('[OWNER DASHBOARD ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch store owner dashboard data' });
  }
}
