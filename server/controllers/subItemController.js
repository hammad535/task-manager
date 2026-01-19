const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

// Get sub-items by parent item ID
const getSubItemsByParent = async (req, res) => {
  try {
    const { parentItemId } = req.params;
    const [subItems] = await pool.execute(
      'SELECT * FROM sub_items WHERE parent_item_id = ? ORDER BY id ASC',
      [parentItemId]
    );
    res.json({ success: true, data: subItems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sub-item by ID
const getSubItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const [subItems] = await pool.execute(
      'SELECT * FROM sub_items WHERE id = ?',
      [id]
    );

    if (subItems.length === 0) {
      return res.status(404).json({ success: false, error: 'Sub-item not found' });
    }

    res.json({ success: true, data: subItems[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create sub-item
const createSubItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      parent_item_id, 
      status, 
      priority, 
      timeline_start, 
      timeline_end 
    } = req.body;

    if (!title || !parent_item_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and parent_item_id are required' 
      });
    }

    // Verify parent item exists
    const [parentItems] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [parent_item_id]
    );

    if (parentItems.length === 0) {
      return res.status(404).json({ success: false, error: 'Parent item not found' });
    }

    const [result] = await pool.execute(
      `INSERT INTO sub_items (title, description, parent_item_id, status, priority, timeline_start, timeline_end) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, parent_item_id, status || 'to_do', priority || 'medium', timeline_start || null, timeline_end || null]
    );

    const [newSubItem] = await pool.execute(
      'SELECT * FROM sub_items WHERE id = ?',
      [result.insertId]
    );

    // Log activity on parent item
    await logActivity(parent_item_id, req.user?.id || 1, 'subitem_created', `Sub-item "${title}" was created`);

    res.status(201).json({ success: true, data: newSubItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update sub-item
const updateSubItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      status, 
      priority, 
      timeline_start, 
      timeline_end 
    } = req.body;

    const [subItems] = await pool.execute(
      'SELECT * FROM sub_items WHERE id = ?',
      [id]
    );

    if (subItems.length === 0) {
      return res.status(404).json({ success: false, error: 'Sub-item not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (priority !== undefined) { updateFields.push('priority = ?'); updateValues.push(priority); }
    if (timeline_start !== undefined) { updateFields.push('timeline_start = ?'); updateValues.push(timeline_start); }
    if (timeline_end !== undefined) { updateFields.push('timeline_end = ?'); updateValues.push(timeline_end); }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE sub_items SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Log activity on parent item
      await logActivity(subItems[0].parent_item_id, req.user?.id || 1, 'subitem_updated', `Sub-item "${subItems[0].title}" was updated`);
    }

    const [updatedSubItem] = await pool.execute(
      'SELECT * FROM sub_items WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updatedSubItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete sub-item
const deleteSubItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [subItems] = await pool.execute(
      'SELECT * FROM sub_items WHERE id = ?',
      [id]
    );

    if (subItems.length === 0) {
      return res.status(404).json({ success: false, error: 'Sub-item not found' });
    }

    const parentItemId = subItems[0].parent_item_id;
    await pool.execute('DELETE FROM sub_items WHERE id = ?', [id]);

    // Log activity on parent item
    await logActivity(parentItemId, req.user?.id || 1, 'subitem_deleted', `Sub-item "${subItems[0].title}" was deleted`);

    res.json({ success: true, message: 'Sub-item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getSubItemsByParent,
  getSubItemById,
  createSubItem,
  updateSubItem,
  deleteSubItem
};

