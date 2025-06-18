import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Games API calls
export const gamesAPI = {
  getAllGames: () => api.get('/games'),
  getGameById: (id) => api.get(`/games/${id}`),
  createGame: (gameData) => api.post('/games', gameData),
  updateGame: (id, gameData) => api.put(`/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/games/${id}`),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
  setActive: (game) => api.post('/users/me/active', { game }),
  setInactive: () => api.post('/users/me/inactive'),
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  getActiveMembers: (game) => api.get(`/users/members?game=${encodeURIComponent(game)}`),
};

// Chat API calls
export const chatAPI = {
  getChats: () => api.get('/users/me/chats'),
  getChatWithUser: (userId) => api.get(`/users/me/chats/${userId}`),
  sendMessage: (userId, text) => api.post(`/users/me/chats/${userId}`, { text }),
  deleteChat: (chatId) => api.delete(`/users/me/chats/${chatId}`),
};

export default api; 