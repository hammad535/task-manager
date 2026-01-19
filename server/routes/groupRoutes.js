const express = require('express');
const router = express.Router();
const {
  getGroupsByBoard,
  createGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groupController');

router.get('/board/:boardId', getGroupsByBoard);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;

