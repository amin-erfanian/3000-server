const express = require('express');
const router = express.Router();
const Resource = require('../models/resource');
const { ObjectId } = require('mongodb');
const { encrypt } = require('../utilities/crypto');

// Get all resources
router.get('/', async (req, res) => {
  const userId = new ObjectId(req.user._id);
  const resources = await Resource.find({ user: userId }).select('-_id -user');

  res.json(resources);
});

// Insert many resources
router.put('/', async (req, res) => {
  const resources = req.body;
  const userId = req.user._id;

  const bulkOps = resources.map((resource) => {
    const encryptedResource = {
      ...resource,
      user: userId,
      name: encrypt(resource.name),
      currentBalance: encrypt(resource.currentBalance.toString()),
    };

    return {
      updateOne: {
        filter: { id: resource.id, user: userId },
        update: { $set: encryptedResource },
        upsert: true,
      },
    };
  });

  await Resource.bulkWrite(bulkOps);
  res.status(201).json({ message: 'resources successfully added' });
});

module.exports = router;
