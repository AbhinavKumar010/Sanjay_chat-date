const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', (req, res, next) => upload.single('profilePhoto')(req, res, (err) => {
  if (err) return res.status(400).json({ message: err.message });
  return authController.register(req, res, next);
}), authController.register);

router.post('/login', authController.login);
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, upload.single('profilePhoto'), authController.updateUserProfile);

module.exports = router;
