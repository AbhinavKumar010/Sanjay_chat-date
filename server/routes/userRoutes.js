const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/browse', auth, userController.browseUsers);
router.get('/list', auth, userController.getAllUsers);
router.post('/like', auth, userController.likeUser);
router.get('/matches', auth, userController.getMatches);

module.exports = router;
