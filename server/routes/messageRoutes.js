const express = require('express');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/send', auth, messageController.sendMessage);
router.get('/conversation/:userId', auth, messageController.getMessages);
router.put('/:messageId/read', auth, messageController.markAsRead);
router.get('/conversations', auth, messageController.getConversations);

module.exports = router;
