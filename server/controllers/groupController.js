const pool = require('../config/database');

// Get groups by board ID
const getGroupsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const [groups] = await pool.execute(
      'SELECT * FROM board_groups WHERE board_id = ? ORDER BY id ASC',
      [boardId]
    );
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create group
const createGroup = async (req, res) => {
  try {
    const { name, board_id } = req.body;

    if (!name || !board_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group name and board_id are required' 
      });
    }

    // Verify board exists
    const [boards] = await pool.execute(
      'SELECT * FROM boards WHERE id = ?',
      [board_id]
    );

    if (boards.length === 0) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    const [result] = await pool.execute(
      'INSERT INTO board_groups (name, board_id) VALUES (?, ?)',
      [name, board_id]
    );

    const [newGroup] = await pool.execute(
      'SELECT * FROM board_groups WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newGroup[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update group (rename)
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Group name is required' });
    }

    const [groups] = await pool.execute(
      'SELECT * FROM board_groups WHERE id = ?',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    await pool.execute(
      'UPDATE board_groups SET name = ? WHERE id = ?',
      [name, id]
    );

    const [updatedGroup] = await pool.execute(
      'SELECT * FROM board_groups WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updatedGroup[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const [groups] = await pool.execute(
      'SELECT * FROM board_groups WHERE id = ?',
      [id]
    );

    if (groups.length === 0) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    await pool.execute('DELETE FROM board_groups WHERE id = ?', [id]);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getGroupsByBoard,
  createGroup,
  updateGroup,
  deleteGroup
};

