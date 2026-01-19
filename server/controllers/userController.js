const pool = require('../config/database');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users ORDER BY name ASC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllUsers
};


