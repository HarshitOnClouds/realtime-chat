import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests (works on client side)
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Rooms
export const createRoom = (data) => api.post('/rooms/create', data);
export const joinRoom = (data) => api.post('/rooms/join', data);
export const getMyRooms = () => api.get('/rooms/my-rooms');
export const getRoomMessages = (roomId) => api.get(`/rooms/${roomId}/messages`);
export const leaveRoom = (roomId) => api.post('/rooms/leave', { roomId });
export const deleteRoom = (roomId) => api.delete(`/rooms/${roomId}`);

// Direct Chats
export const createDirectChat = (data) => api.post('/direct-chats/create', data);
export const getMyDirectChats = () => api.get('/direct-chats/my-chats');
export const getDirectChatMessages = (chatId) => api.get(`/direct-chats/${chatId}/messages`);

export default api;