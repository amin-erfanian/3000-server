const express = require('express');
const router = express.Router();
const Seller = require('../../models/seller');

const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

router.use(authMiddleware);
router.use(roleMiddleware(['seller']));

router.post('/complete-registration', async (req, res) => {
  const { type, nationalId, title, address } = req.body;
  const sellerId = req.seller._id;

  try {
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { type, nationalId, title, 'contactInfo.address': address },
      { runValidators: true },
    );
    res.json({ success: true, seller });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'nationalId already exists' });
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
