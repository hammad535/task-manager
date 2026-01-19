const pool = require('../config/database');

// Get all boards (with groups and items)
const getAllBoards = async (req, res) => {
  try {
    const [boards] = await pool.execute(
      'SELECT * FROM boards ORDER BY id DESC'
    );

    // For each board, get groups and items
    const boardsWithData = await Promise.all(
      boards.map(async (board) => {
        // Get groups for this board
        const [groups] = await pool.execute(
          'SELECT * FROM board_groups WHERE board_id = ? ORDER BY id ASC',
          [board.id]
        );

        // Get items for each group
        const groupsWithItems = await Promise.all(
          groups.map(async (group) => {
            const [items] = await pool.execute(
              `SELECT i.*, 
               GROUP_CONCAT(DISTINCT u.id) as assignee_ids, 
               GROUP_CONCAT(DISTINCT u.name) as assignee_names 
               FROM items i 
               LEFT JOIN item_assignees ia ON i.id = ia.item_id 
               LEFT JOIN users u ON ia.user_id = u.id 
               WHERE i.group_id = ? 
               GROUP BY i.id 
               ORDER BY i.id DESC`,
              [group.id]
            );

        // Format items with assignees and fetch sub-items for each item
        const formattedItems = await Promise.all(items.map(async (item) => {
          const formattedItem = {
            ...item,
            assignee_ids: item.assignee_ids ? item.assignee_ids.split(',').map(Number) : [],
            assignee_names: item.assignee_names ? item.assignee_names.split(',') : []
          };

          // Fetch sub-items for this item
          const [subItems] = await pool.execute(
            'SELECT * FROM sub_items WHERE parent_item_id = ? ORDER BY id ASC',
            [item.id]
          );

          formattedItem.sub_items = subItems || [];
          return formattedItem;
        }));

        return { ...group, items: formattedItems };
          })
        );

        return { ...board, groups: groupsWithItems };
      })
    );

    res.json({ success: true, data: boardsWithData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get board by ID with groups and items
const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const [boards] = await pool.execute(
      'SELECT * FROM boards WHERE id = ?',
      [id]
    );

    if (boards.length === 0) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    const [groups] = await pool.execute(
      'SELECT * FROM board_groups WHERE board_id = ? ORDER BY id ASC',
      [id]
    );

    // Fetch items for each group
    const groupsWithItems = await Promise.all(
      groups.map(async (group) => {
        const [items] = await pool.execute(
          `SELECT i.*, 
           GROUP_CONCAT(DISTINCT u.id) as assignee_ids, 
           GROUP_CONCAT(DISTINCT u.name) as assignee_names 
           FROM items i 
           LEFT JOIN item_assignees ia ON i.id = ia.item_id 
           LEFT JOIN users u ON ia.user_id = u.id 
           WHERE i.group_id = ? 
           GROUP BY i.id 
           ORDER BY i.id DESC`,
          [group.id]
        );

        // Format items with assignees and fetch sub-items for each item
        const formattedItems = await Promise.all(items.map(async (item) => {
          const formattedItem = {
            ...item,
            assignee_ids: item.assignee_ids ? item.assignee_ids.split(',').map(Number) : [],
            assignee_names: item.assignee_names ? item.assignee_names.split(',') : []
          };

          // Fetch sub-items for this item
          const [subItems] = await pool.execute(
            'SELECT * FROM sub_items WHERE parent_item_id = ? ORDER BY id ASC',
            [item.id]
          );

          formattedItem.sub_items = subItems || [];
          return formattedItem;
        }));

        return { ...group, items: formattedItems };
      })
    );

    res.json({ success: true, data: { ...boards[0], groups: groupsWithItems } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create board
const createBoard = async (req, res) => {
  try {
    const { name, created_by } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Board name is required' });
    }

    // Get or create default user (user_id = 1)
    let userId = created_by || 1;
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      // Create default user if doesn't exist
      await pool.execute('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [userId, 'Default User', 'user@example.com']);
    }

    const [result] = await pool.execute(
      'INSERT INTO boards (name, created_by) VALUES (?, ?)',
      [name, userId]
    );

    const [newBoard] = await pool.execute(
      'SELECT * FROM boards WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newBoard[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete board
const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if board exists
    const [boards] = await pool.execute(
      'SELECT * FROM boards WHERE id = ?',
      [id]
    );

    if (boards.length === 0) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    await pool.execute('DELETE FROM boards WHERE id = ?', [id]);
    res.json({ success: true, message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllBoards,
  getBoardById,
  createBoard,
  deleteBoard
};

