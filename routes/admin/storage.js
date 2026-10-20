const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');
const storageRoutes = require('../seller/storage');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Reuse the shared upload handler (POST /upload) behind admin auth
router.use(storageRoutes);

module.exports = router;
