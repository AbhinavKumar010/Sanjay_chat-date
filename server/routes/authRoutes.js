const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', upload.single('profilePhoto'), authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getUserProfile);
router.put('/profile', auth, upload.single('profilePhoto'), authController.updateUserProfile);

module.exports = router;
