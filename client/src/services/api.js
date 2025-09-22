import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
};

// Projects API
export const projectsAPI = {
  getProjects: () => api.get("/projects"),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post("/projects", projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Prompts API
export const promptsAPI = {
  getPrompts: (projectId) => api.get(`/prompts/project/${projectId}`),
  getPrompt: (id) => api.get(`/prompts/${id}`),
  createPrompt: (promptData) => api.post("/prompts", promptData),
  updatePrompt: (id, promptData) => api.put(`/prompts/${id}`, promptData),
  deletePrompt: (id) => api.delete(`/prompts/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (messageData) => api.post("/chat", messageData),
  getConversation: (conversationId) =>
    api.get(`/chat/conversation/${conversationId}`),
  getConversations: (projectId) => api.get(`/chat/project/${projectId}`),
};

export default api;

