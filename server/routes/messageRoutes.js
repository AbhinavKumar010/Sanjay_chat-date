const express = require('express');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/send', auth, messageController.sendMessage);
router.get('/conversation/:userId', auth, messageController.getMessages);
router.put('/:messageId/read', auth, messageController.markAsRead);
// Clear chat history for current user (only messages sent by current user to the other user)
router.delete('/conversation/:userId/clear', auth, messageController.clearChatHistory);
router.get('/conversations', auth, messageController.getConversations);


module.exports = router;