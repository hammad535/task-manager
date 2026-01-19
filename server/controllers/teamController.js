const pool = require('../config/database');

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const [teams] = await pool.execute(
      `SELECT t.*, 
       GROUP_CONCAT(DISTINCT u.id) as member_ids, 
       GROUP_CONCAT(DISTINCT u.name) as member_names 
       FROM teams t 
       LEFT JOIN team_members tm ON t.id = tm.team_id 
       LEFT JOIN users u ON tm.user_id = u.id 
       GROUP BY t.id 
       ORDER BY t.id DESC`
    );

    const formattedTeams = teams.map(team => ({
      ...team,
      member_ids: team.member_ids ? team.member_ids.split(',').map(Number) : [],
      member_names: team.member_names ? team.member_names.split(',') : []
    }));

    res.json({ success: true, data: formattedTeams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get team by ID
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const [teams] = await pool.execute(
      `SELECT t.*, 
       GROUP_CONCAT(DISTINCT u.id) as member_ids, 
       GROUP_CONCAT(DISTINCT u.name) as member_names 
       FROM teams t 
       LEFT JOIN team_members tm ON t.id = tm.team_id 
       LEFT JOIN users u ON tm.user_id = u.id 
       WHERE t.id = ? 
       GROUP BY t.id`,
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const team = {
      ...teams[0],
      member_ids: teams[0].member_ids ? teams[0].member_ids.split(',').map(Number) : [],
      member_names: teams[0].member_names ? teams[0].member_names.split(',') : []
    };

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create team
const createTeam = async (req, res) => {
  try {
    const { name, member_ids } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Team name is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO teams (name) VALUES (?)',
      [name]
    );

    const teamId = result.insertId;

    // Add members if provided
    if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
      for (const userId of member_ids) {
        await pool.execute(
          'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
          [teamId, userId]
        );
      }
    }

    const [newTeam] = await pool.execute(
      `SELECT t.*, 
       GROUP_CONCAT(DISTINCT u.id) as member_ids, 
       GROUP_CONCAT(DISTINCT u.name) as member_names 
       FROM teams t 
       LEFT JOIN team_members tm ON t.id = tm.team_id 
       LEFT JOIN users u ON tm.user_id = u.id 
       WHERE t.id = ? 
       GROUP BY t.id`,
      [teamId]
    );

    const team = {
      ...newTeam[0],
      member_ids: newTeam[0].member_ids ? newTeam[0].member_ids.split(',').map(Number) : [],
      member_names: newTeam[0].member_names ? newTeam[0].member_names.split(',') : []
    };

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, member_ids } = req.body;

    const [teams] = await pool.execute('SELECT * FROM teams WHERE id = ?', [id]);

    if (teams.length === 0) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    if (name !== undefined) {
      await pool.execute('UPDATE teams SET name = ? WHERE id = ?', [name, id]);
    }

    // Update members if provided
    if (member_ids !== undefined) {
      // Remove existing members
      await pool.execute('DELETE FROM team_members WHERE team_id = ?', [id]);

      // Add new members
      if (Array.isArray(member_ids) && member_ids.length > 0) {
        for (const userId of member_ids) {
          await pool.execute(
            'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
            [id, userId]
          );
        }
      }
    }

    const [updatedTeam] = await pool.execute(
      `SELECT t.*, 
       GROUP_CONCAT(DISTINCT u.id) as member_ids, 
       GROUP_CONCAT(DISTINCT u.name) as member_names 
       FROM teams t 
       LEFT JOIN team_members tm ON t.id = tm.team_id 
       LEFT JOIN users u ON tm.user_id = u.id 
       WHERE t.id = ? 
       GROUP BY t.id`,
      [id]
    );

    const team = {
      ...updatedTeam[0],
      member_ids: updatedTeam[0].member_ids ? updatedTeam[0].member_ids.split(',').map(Number) : [],
      member_names: updatedTeam[0].member_names ? updatedTeam[0].member_names.split(',') : []
    };

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete team
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const [teams] = await pool.execute('SELECT * FROM teams WHERE id = ?', [id]);

    if (teams.length === 0) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    // Delete related records
    await pool.execute('DELETE FROM team_members WHERE team_id = ?', [id]);
    await pool.execute('DELETE FROM teams WHERE id = ?', [id]);

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Assign team to item
const assignTeamToItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { team_id } = req.body;

    if (!team_id) {
      return res.status(400).json({ success: false, error: 'team_id is required' });
    }

    // Get team members
    const [members] = await pool.execute(
      'SELECT user_id FROM team_members WHERE team_id = ?',
      [team_id]
    );

    // Remove existing assignees
    await pool.execute('DELETE FROM item_assignees WHERE item_id = ?', [itemId]);

    // Add all team members as assignees
    for (const member of members) {
      await pool.execute(
        'INSERT INTO item_assignees (item_id, user_id) VALUES (?, ?)',
        [itemId, member.user_id]
      );
    }

    res.json({ success: true, message: 'Team assigned to item successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  assignTeamToItem
};

