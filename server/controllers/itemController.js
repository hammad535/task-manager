const pool = require('../config/database');
const { logActivity } = require('../utils/activityLogger');
const { sendStatusChangeEmail } = require('../config/email');

/**
 * Normalize date to YYYY-MM-DD format using local timezone (no UTC conversion)
 * This prevents the "previous day" bug when selecting dates
 */
const normalizeDateOnly = (value) => {
  if (value === null || value === undefined || value === '') return null;

  // Accept already-normalized YYYY-MM-DD
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // Parse date and format as local YYYY-MM-DD (no UTC conversion)
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
const startOfTodayUtcDateOnly = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get all items (with optional filters)
const getItems = async (req, res) => {
  try {
    const { board_id, group_id } = req.query;
    let query = 'SELECT i.*, GROUP_CONCAT(DISTINCT u.id) as assignee_ids, GROUP_CONCAT(DISTINCT u.name) as assignee_names FROM items i LEFT JOIN item_assignees ia ON i.id = ia.item_id LEFT JOIN users u ON ia.user_id = u.id WHERE 1=1';
    const params = [];

    if (board_id) {
      query += ' AND i.board_id = ?';
      params.push(board_id);
    }

    if (group_id) {
      query += ' AND i.group_id = ?';
      params.push(group_id);
    }

    query += ' GROUP BY i.id ORDER BY i.id DESC';

    const [items] = await pool.execute(query, params);

    // Format items with assignees
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

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute(
      `SELECT i.*, 
       GROUP_CONCAT(DISTINCT u.id) as assignee_ids, 
       GROUP_CONCAT(DISTINCT u.name) as assignee_names 
       FROM items i 
       LEFT JOIN item_assignees ia ON i.id = ia.item_id 
       LEFT JOIN users u ON ia.user_id = u.id 
       WHERE i.id = ? 
       GROUP BY i.id`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const item = {
      ...items[0],
      assignee_ids: items[0].assignee_ids ? items[0].assignee_ids.split(',').map(Number) : [],
      assignee_names: items[0].assignee_names ? items[0].assignee_names.split(',') : []
    };

    // Get activity logs
    const [logs] = await pool.execute(
      'SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id WHERE al.item_id = ? ORDER BY al.timestamp DESC',
      [id]
    );

    // Get sub-items
    const [subItems] = await pool.execute(
      'SELECT * FROM sub_items WHERE parent_item_id = ? ORDER BY id ASC',
      [id]
    );

    res.json({ 
      success: true, 
      data: { ...item, activity_logs: logs, sub_items: subItems } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create item
const createItem = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      group_id, 
      board_id, 
      status, 
      priority, 
      timeline_start, 
      timeline_end,
      assignee_ids 
    } = req.body;

    if (!title || !group_id || !board_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, group_id, and board_id are required' 
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO items (title, description, group_id, board_id, status, priority, timeline_start, timeline_end) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, group_id, board_id, status || 'to_do', priority || 'medium', timeline_start || null, timeline_end || null]
    );

    const itemId = result.insertId;

    // Add assignees if provided
    if (assignee_ids && Array.isArray(assignee_ids) && assignee_ids.length > 0) {
      for (const userId of assignee_ids) {
        await pool.execute(
          'INSERT INTO item_assignees (item_id, user_id) VALUES (?, ?)',
          [itemId, userId]
        );
      }
    }

    // Log activity
    await logActivity(itemId, req.user?.id || 1, 'created', `Item "${title}" was created`);

    const [newItem] = await pool.execute(
      `SELECT i.*, 
       GROUP_CONCAT(DISTINCT u.id) as assignee_ids, 
       GROUP_CONCAT(DISTINCT u.name) as assignee_names 
       FROM items i 
       LEFT JOIN item_assignees ia ON i.id = ia.item_id 
       LEFT JOIN users u ON ia.user_id = u.id 
       WHERE i.id = ? 
       GROUP BY i.id`,
      [itemId]
    );

    const item = {
      ...newItem[0],
      assignee_ids: newItem[0].assignee_ids ? newItem[0].assignee_ids.split(',').map(Number) : [],
      assignee_names: newItem[0].assignee_names ? newItem[0].assignee_names.split(',') : []
    };

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      status, 
      priority, 
      timeline_start, 
      timeline_end,
      assignee_ids 
    } = req.body;

    // Validate timeline fields when provided (accepts YYYY-MM-DD or ISO strings)
    const normalizedStart = timeline_start !== undefined ? normalizeDateOnly(timeline_start) : undefined;
    const normalizedEnd = timeline_end !== undefined ? normalizeDateOnly(timeline_end) : undefined;
    if (timeline_start !== undefined && timeline_start !== null && timeline_start !== '' && normalizedStart === null) {
      return res.status(400).json({ success: false, error: 'Invalid start date format' });
    }
    if (timeline_end !== undefined && timeline_end !== null && timeline_end !== '' && normalizedEnd === null) {
      return res.status(400).json({ success: false, error: 'Invalid deadline/end date format' });
    }

    const today = startOfTodayUtcDateOnly();
    if (normalizedEnd && normalizedEnd < today) {
      return res.status(400).json({ success: false, error: 'Deadline cannot be in the past' });
    }
    if (normalizedStart && normalizedEnd && normalizedStart > normalizedEnd) {
      return res.status(400).json({ success: false, error: 'Start date cannot be after deadline' });
    }

    // Get current item to check status change
    const [currentItems] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [id]
    );

    if (currentItems.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const oldStatus = currentItems[0].status;
    const newStatus = status || oldStatus;

    // Update item
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    if (priority !== undefined) { updateFields.push('priority = ?'); updateValues.push(priority); }
    if (timeline_start !== undefined) { updateFields.push('timeline_start = ?'); updateValues.push(normalizedStart); }
    if (timeline_end !== undefined) { updateFields.push('timeline_end = ?'); updateValues.push(normalizedEnd); }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update assignees if provided
    if (assignee_ids !== undefined) {
      // Remove existing assignees
      await pool.execute('DELETE FROM item_assignees WHERE item_id = ?', [id]);

      // Add new assignees
      if (Array.isArray(assignee_ids) && assignee_ids.length > 0) {
        for (const userId of assignee_ids) {
          await pool.execute(
            'INSERT INTO item_assignees (item_id, user_id) VALUES (?, ?)',
            [id, userId]
          );
        }
      }
    }

    // Log activity for status change
    if (status && status !== oldStatus) {
      await logActivity(id, req.user?.id || 1, 'status_changed', `Status changed from "${oldStatus}" to "${newStatus}"`);

      // Send email notifications to assignees
      const [assignees] = await pool.execute(
        'SELECT u.email, u.name FROM users u INNER JOIN item_assignees ia ON u.id = ia.user_id WHERE ia.item_id = ?',
        [id]
      );

      const [item] = await pool.execute('SELECT title FROM items WHERE id = ?', [id]);
      const itemTitle = item[0]?.title || 'Task';

      for (const assignee of assignees) {
        if (assignee.email) {
          await sendStatusChangeEmail(assignee.email, itemTitle, oldStatus, newStatus, assignee.name);
        }
      }
    } else if (updateFields.length > 0) {
      await logActivity(id, req.user?.id || 1, 'updated', 'Item was updated');
    }

    // Get updated item
    const [updatedItems] = await pool.execute(
      `SELECT i.*, 
       GROUP_CONCAT(DISTINCT u.id) as assignee_ids, 
       GROUP_CONCAT(DISTINCT u.name) as assignee_names 
       FROM items i 
       LEFT JOIN item_assignees ia ON i.id = ia.item_id 
       LEFT JOIN users u ON ia.user_id = u.id 
       WHERE i.id = ? 
       GROUP BY i.id`,
      [id]
    );

    const item = {
      ...updatedItems[0],
      assignee_ids: updatedItems[0].assignee_ids ? updatedItems[0].assignee_ids.split(',').map(Number) : [],
      assignee_names: updatedItems[0].assignee_names ? updatedItems[0].assignee_names.split(',') : []
    };

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Patch item timeline (supports {date} or {timeline: {startDate, endDate}} or legacy {timeline_start, timeline_end})
const updateItemTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeline, timeline_start, timeline_end } = req.body || {};

    let start = null;
    let end = null;

    // Handle new API format: { timeline: { startDate, endDate } }
    if (timeline && typeof timeline === 'object') {
      start = normalizeDateOnly(timeline.startDate);
      end = normalizeDateOnly(timeline.endDate);
    }
    // Handle single date: { date: "YYYY-MM-DD" }
    else if (date) {
      start = normalizeDateOnly(date);
    }
    // Handle legacy format: { timeline_start, timeline_end }
    else {
      start = normalizeDateOnly(timeline_start);
      end = normalizeDateOnly(timeline_end);
    }

    if (start === null && end === null) {
      return res.status(400).json({
        success: false,
        error: 'Provide {date} or {timeline: {startDate, endDate}} or {timeline_start, timeline_end}'
      });
    }

    // Validate parsing (normalizeDateOnly returns null on invalid input)
    if (timeline?.startDate !== undefined && timeline.startDate !== null && start === null) {
      return res.status(400).json({ success: false, error: 'Invalid start date format' });
    }
    if (timeline?.endDate !== undefined && timeline.endDate !== null && end === null) {
      return res.status(400).json({ success: false, error: 'Invalid end date format' });
    }
    if (date !== undefined && date !== null && start === null) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }

    // Validate timeline rules
    const today = startOfTodayUtcDateOnly();
    
    // Ensure endDate >= today (deadline cannot be in the past)
    if (end && end < today) {
      return res.status(400).json({ success: false, error: 'Deadline cannot be in the past' });
    }

    // Ensure startDate <= endDate when both provided
    if (start && end && start > end) {
      return res.status(400).json({ success: false, error: 'Start date cannot be after end date' });
    }

    // Ensure item exists
    const [currentItems] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);
    if (currentItems.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const updateFields = [];
    const updateValues = [];
    if (start !== null) { updateFields.push('timeline_start = ?'); updateValues.push(start); }
    if (end !== null) { updateFields.push('timeline_end = ?'); updateValues.push(end); }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.execute(
        `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    await logActivity(id, req.user?.id || 1, 'timeline_updated', 'Timeline was updated');

    const [updatedItems] = await pool.execute(
      `SELECT i.*, 
       GROUP_CONCAT(DISTINCT u.id) as assignee_ids, 
       GROUP_CONCAT(DISTINCT u.name) as assignee_names 
       FROM items i 
       LEFT JOIN item_assignees ia ON i.id = ia.item_id 
       LEFT JOIN users u ON ia.user_id = u.id 
       WHERE i.id = ? 
       GROUP BY i.id`,
      [id]
    );

    const item = {
      ...updatedItems[0],
      assignee_ids: updatedItems[0].assignee_ids ? updatedItems[0].assignee_ids.split(',').map(Number) : [],
      assignee_names: updatedItems[0].assignee_names ? updatedItems[0].assignee_names.split(',') : []
    };

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.execute('SELECT * FROM items WHERE id = ?', [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Delete related records
    await pool.execute('DELETE FROM item_assignees WHERE item_id = ?', [id]);
    await pool.execute('DELETE FROM activity_logs WHERE item_id = ?', [id]);
    await pool.execute('DELETE FROM sub_items WHERE parent_item_id = ?', [id]);
    await pool.execute('DELETE FROM recurring_rules WHERE item_id = ?', [id]);
    await pool.execute('DELETE FROM items WHERE id = ?', [id]);

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  updateItemTimeline,
  deleteItem
};

