const express = require('express');
const router = express.Router();
const { getMyWork } = require('../controllers/myWorkController');

router.get('/', getMyWork);

module.exports = router;

