const pool = require('../config/database');

const logActivity = async (itemId, userId, action, description) => {
  try {
    // Get or create default user if needed
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      await pool.execute('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [userId, 'System User', 'system@example.com']);
    }
    
    // Use action field for description if description column doesn't exist
    await pool.execute(
      'INSERT INTO activity_logs (item_id, user_id, action, timestamp) VALUES (?, ?, ?, NOW())',
      [itemId, userId, description || action]
    );
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

module.exports = { logActivity };

