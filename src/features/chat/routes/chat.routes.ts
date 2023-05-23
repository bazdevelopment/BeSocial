import express from 'express';

import { verifyUser } from 'middleware/auth-middleware';
import { addChatSchema, markChatSchema } from '../schemes/Chat';
import { addChatMessage } from '../controllers/add-chat-message';
import { joiValidation } from 'middleware/joi-validation';
import { getChatConversationMessage } from '../controllers/get-chat-messages';
import { getChatMessages } from '../controllers/get-messages';
import { deleteChatMessage } from '../controllers/delete-chat-message';
import { readChatMessages } from '../controllers/read-chat-messages';
import { addChatMessageReaction } from '../controllers/add-chat-message-reaction';

const router = express.Router();
/* GET */
router.route('/get-conversation-list').get(verifyUser, getChatConversationMessage);
router.route('/get-messages/:receiverId').get(verifyUser, getChatMessages);

/* POST */
router.route('/send-message').post(verifyUser, joiValidation(addChatSchema), addChatMessage);

/* PUT */
router.route('/read-messages').put(verifyUser, joiValidation(markChatSchema), readChatMessages);
router.route('/reaction').put(verifyUser, addChatMessageReaction);

/* DELETE */
router.route('/mark-as-deleted/:senderId/:receiverId/:messageId/:type').delete(verifyUser, deleteChatMessage);

export default router;
