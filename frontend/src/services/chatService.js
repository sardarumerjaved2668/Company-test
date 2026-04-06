import api from './api';

export async function fetchCurrentChat() {
  const { data } = await api.get('/chats/current');
  return data.chat;
}

export async function appendMessages(messages) {
  const { data } = await api.post('/chats/current/messages', { messages });
  return data.chat;
}

export async function clearCurrentChat() {
  await api.delete('/chats/current');
}
