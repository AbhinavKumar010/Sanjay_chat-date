const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/users', auth, requireAdmin, userController.adminListUsers);
router.post('/users/:id/block', auth, requireAdmin, userController.adminBlockUser);
router.post('/users/:id/unblock', auth, requireAdmin, userController.adminUnblockUser);
router.delete('/users/:id', auth, requireAdmin, userController.adminRemoveUser);


module.exports = router;

