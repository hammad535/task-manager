const pool = require('../config/database');

// Get my work items (filtered by user and date)
const getMyWork = async (req, res) => {
  try {
    const { userId, filter } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    let query = `
      SELECT i.*, 
             b.name as board_name,
             g.name as group_name,
             GROUP_CONCAT(DISTINCT u2.id) as assignee_ids, 
             GROUP_CONCAT(DISTINCT u2.name) as assignee_names 
      FROM items i
      INNER JOIN item_assignees ia ON i.id = ia.item_id
      INNER JOIN boards b ON i.board_id = b.id
      INNER JOIN board_groups g ON i.group_id = g.id
      LEFT JOIN item_assignees ia2 ON i.id = ia2.item_id
      LEFT JOIN users u2 ON ia2.user_id = u2.id
      WHERE ia.user_id = ?
    `;

    const params = [userId];

    // Apply date filters
    if (filter === 'this_week') {
      query += ` AND (i.timeline_start IS NULL OR i.timeline_start <= DATE_ADD(CURDATE(), INTERVAL 7 DAY))
                 AND (i.timeline_end IS NULL OR i.timeline_end >= CURDATE())`;
    } else if (filter === 'upcoming') {
      query += ` AND (i.timeline_start IS NULL OR i.timeline_start > DATE_ADD(CURDATE(), INTERVAL 7 DAY))`;
    }

    query += ' GROUP BY i.id ORDER BY i.timeline_start ASC, i.id DESC';

    const [items] = await pool.execute(query, params);

    const formattedItems = items.map(item => ({
      ...item,
      assignee_ids: item.assignee_ids ? item.assignee_ids.split(',').map(Number) : [],
      assignee_names: item.assignee_names ? item.assignee_names.split(',') : []
    }));

    res.json({ success: true, data: formattedItems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getMyWork
};

