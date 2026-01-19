const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', createItem);
router.put('/:id', updateItem);
router.patch('/:id/status', updateItem); // Use same controller, status will be in body
router.delete('/:id', deleteItem);

module.exports = router;

