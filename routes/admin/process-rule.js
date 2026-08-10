const express = require('express');
const router = express.Router();
const ProcessRule = require('../../models/process-rule');

const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.post('/', async (req, res) => {
  try {
    const rule = await ProcessRule.create(req.body);
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
