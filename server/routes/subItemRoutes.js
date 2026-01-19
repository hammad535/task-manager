const express = require('express');
const router = express.Router();
const {
  getSubItemsByParent,
  getSubItemById,
  createSubItem,
  updateSubItem,
  deleteSubItem
} = require('../controllers/subItemController');

router.get('/parent/:parentItemId', getSubItemsByParent);
router.get('/:id', getSubItemById);
router.post('/', createSubItem);
router.put('/:id', updateSubItem);
router.delete('/:id', deleteSubItem);

module.exports = router;

