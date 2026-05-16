const express = require('express');
const notificationController = require('../controllers/notificationController');
const notificationQuickController = require('../controllers/notificationQuickController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, notificationController.getMyNotifications);
router.put('/mark-read/:id', auth, notificationController.markNotificationAsRead);
router.post('/quick', auth, notificationQuickController.quickCreate);

module.exports = router;


