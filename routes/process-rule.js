const express = require('express');
const router = express.Router();
const ProcessRule = require('../models/process-rule');

router.get('/', async (req, res) => {
  try {
    const rules = await ProcessRule.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
