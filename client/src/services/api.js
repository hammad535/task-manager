import axios from 'axios';

// Use proxy from package.json (forwards /api requests to http://localhost:5000)
// For production or custom URLs, set REACT_APP_API_BASE_URL env variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL 
  ? `${process.env.REACT_APP_API_BASE_URL}/api` 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Boards
export const getBoards = () => api.get('/boards');
export const getBoardById = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards', data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);

// Groups
export const getGroupsByBoard = (boardId) => api.get(`/groups/board/${boardId}`);
export const createGroup = (data) => api.post('/groups', data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// Items
export const getItems = (params) => api.get('/items', { params });
export const getItemById = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const updateItemStatus = (id, status) => api.patch(`/items/${id}/status`, { status });
export const deleteItem = (id) => api.delete(`/items/${id}`);

// Sub-items
export const getSubItemsByParent = (parentItemId) => api.get(`/subitems/parent/${parentItemId}`);
export const createSubItem = (data) => api.post('/subitems', data);
export const updateSubItem = (id, data) => api.put(`/subitems/${id}`, data);
export const deleteSubItem = (id) => api.delete(`/subitems/${id}`);

// Teams
export const getTeams = () => api.get('/teams');
export const getTeamById = (id) => api.get(`/teams/${id}`);
export const createTeam = (data) => api.post('/teams', data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);
export const assignTeamToItem = (itemId, teamId) => api.post(`/teams/assign/${itemId}`, { team_id: teamId });

// Users
export const getUsers = () => api.get('/users');

// My Work
export const getMyWork = (userId, filter) => api.get('/mywork', { params: { userId, filter } });

// Activity Logs (already included in getItemById, but adding for clarity)
export const getActivityLogs = (itemId) => api.get(`/items/${itemId}`);

export default api;

