import axios from 'axios';

// Use relative path for API endpoints to work in any environment
const BASE_URL = '/api/chat';

export async function sendMessage(message, session_id) {
  const res = await axios.post(`${BASE_URL}`, { message, session_id });
  return res.data;
}

export async function fetchSession(session_id) {
  const res = await axios.get(`${BASE_URL}/session/${session_id}`);
  return res.data.history;
}

export async function resetSession(session_id) {
  await axios.post(`${BASE_URL}/reset`, { session_id });
}
