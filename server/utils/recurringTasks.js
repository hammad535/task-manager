const cron = require('node-cron');
const pool = require('../config/database');
const { logActivity } = require('./activityLogger');

// Check and create recurring tasks
const processRecurringTasks = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find recurring rules that need to be triggered
    const [rules] = await pool.execute(
      `SELECT rr.*, i.* 
       FROM recurring_rules rr 
       INNER JOIN items i ON rr.item_id = i.id 
       WHERE rr.next_trigger_date <= ?`,
      [today]
    );

    for (const rule of rules) {
      // Create a duplicate of the item
      const [newItem] = await pool.execute(
        `INSERT INTO items (title, description, group_id, board_id, status, priority, timeline_start, timeline_end) 
         SELECT title, description, group_id, board_id, 'to_do', priority, 
                CASE 
                  WHEN frequency = 'daily' THEN DATE_ADD(timeline_start, INTERVAL 1 DAY)
                  WHEN frequency = 'weekly' THEN DATE_ADD(timeline_start, INTERVAL 7 DAY)
                  WHEN frequency = 'monthly' THEN DATE_ADD(timeline_start, INTERVAL 1 MONTH)
                  ELSE timeline_start
                END,
                CASE 
                  WHEN frequency = 'daily' THEN DATE_ADD(timeline_end, INTERVAL 1 DAY)
                  WHEN frequency = 'weekly' THEN DATE_ADD(timeline_end, INTERVAL 7 DAY)
                  WHEN frequency = 'monthly' THEN DATE_ADD(timeline_end, INTERVAL 1 MONTH)
                  ELSE timeline_end
                END
         FROM items 
         WHERE id = ?`,
        [rule.item_id]
      );

      const newItemId = newItem.insertId;

      // Copy assignees
      const [assignees] = await pool.execute(
        'SELECT user_id FROM item_assignees WHERE item_id = ?',
        [rule.item_id]
      );

      for (const assignee of assignees) {
        await pool.execute(
          'INSERT INTO item_assignees (item_id, user_id) VALUES (?, ?)',
          [newItemId, assignee.user_id]
        );
      }

      // Copy recurring rule
      const nextTrigger = calculateNextTrigger(rule.frequency, today);
      await pool.execute(
        'INSERT INTO recurring_rules (item_id, frequency, next_trigger_date) VALUES (?, ?, ?)',
        [newItemId, rule.frequency, nextTrigger]
      );

      // Update next trigger date for original rule
      const nextOriginalTrigger = calculateNextTrigger(rule.frequency, today);
      await pool.execute(
        'UPDATE recurring_rules SET next_trigger_date = ? WHERE id = ?',
        [nextOriginalTrigger, rule.id]
      );

      await logActivity(newItemId, 1, 'recurring_created', `Recurring task created from rule: ${rule.frequency}`);
    }

    console.log(`✅ Processed ${rules.length} recurring tasks`);
  } catch (error) {
    console.error('❌ Error processing recurring tasks:', error.message);
  }
};

const calculateNextTrigger = (frequency, currentDate) => {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
};

// Run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('🔄 Running recurring tasks check...');
  processRecurringTasks();
});

// Also run on startup for immediate processing
processRecurringTasks();

module.exports = { processRecurringTasks };

