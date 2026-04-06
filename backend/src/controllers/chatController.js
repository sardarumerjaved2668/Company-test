const Chat = require('../models/Chat');

const MAX_MESSAGES = 300;

// GET /api/chats/current — get or create the user's active chat
exports.getCurrent = async (req, res, next) => {
  try {
    let chat = await Chat.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });
    if (!chat) chat = await Chat.create({ userId: req.user._id, messages: [] });
    res.json({ success: true, chat });
  } catch (err) { next(err); }
};

// POST /api/chats/current/messages — append messages to active chat
exports.addMessages = async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ success: false, message: 'messages array required' });

    let chat = await Chat.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });
    if (!chat) chat = await Chat.create({ userId: req.user._id, messages: [] });

    const validated = messages.filter(
      (m) => (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string' && m.text.trim()
    ).map((m) => ({ role: m.role, text: m.text.trim() }));

    chat.messages.push(...validated);
    // Keep within limit
    if (chat.messages.length > MAX_MESSAGES) {
      chat.messages = chat.messages.slice(-MAX_MESSAGES);
    }
    await chat.save();
    res.json({ success: true, chat });
  } catch (err) { next(err); }
};

// DELETE /api/chats/current — clear the user's active chat
exports.clearCurrent = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });
    if (chat) {
      chat.messages = [];
      await chat.save();
    }
    res.json({ success: true, message: 'Chat cleared' });
  } catch (err) { next(err); }
};
