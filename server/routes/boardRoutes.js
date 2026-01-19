const express = require('express');
const router = express.Router();
const {
  getAllBoards,
  getBoardById,
  createBoard,
  deleteBoard
} = require('../controllers/boardController');

router.get('/', getAllBoards);
router.get('/:id', getBoardById);
router.post('/', createBoard);
router.delete('/:id', deleteBoard);

module.exports = router;

