import axios from 'axios';

// API Base URL configuration
// In development: uses proxy from package.json (forwards /api to http://localhost:5000)
// In production: uses REACT_APP_API_BASE_URL environment variable
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    // Production: use the provided base URL
    return `${process.env.REACT_APP_API_BASE_URL}/api`;
  }
  // Development: use proxy
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging (development only)
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('API Error: No response received', error.request);
    } else {
      // Error in setting up request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

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
// Timeline (supports {date} or {timeline: {startDate, endDate}} or legacy {timeline_start, timeline_end})
export const updateItemTimeline = (id, data) => api.patch(`/items/${id}/timeline`, data);
// Date update (uses timeline endpoint with {date} format)
export const updateItemDate = (id, date) => api.patch(`/items/${id}/date`, { date });
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

