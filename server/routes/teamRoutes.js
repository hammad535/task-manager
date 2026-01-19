const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  assignTeamToItem
} = require('../controllers/teamController');

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/assign/:itemId', assignTeamToItem);

module.exports = router;

