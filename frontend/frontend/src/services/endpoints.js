import api from "./api";

// Centralized API calls, grouped by resource
export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const doctorApi = {
  list: (params) => api.get("/doctors", { params }),
  get: (id) => api.get(`/doctors/${id}`),
  availability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
  updateProfile: (payload) => api.put("/doctors/profile", payload),
};

export const appointmentApi = {
  create: (payload) => api.post("/appointments", payload),
  list: (params) => api.get("/appointments", { params }),
  updateStatus: (id, payload) => api.put(`/appointments/${id}/status`, payload),
};

export const medicationApi = {
  create: (payload) => api.post("/medications", payload),
  list: (params) => api.get("/medications", { params }),
  update: (id, payload) => api.put(`/medications/${id}`, payload),
  logDose: (id, status) => api.post(`/medications/${id}/log`, { status }),
  remove: (id) => api.delete(`/medications/${id}`),
};

export const healthRecordApi = {
  create: (payload) => api.post("/health-records", payload),
  list: (params) => api.get("/health-records", { params }),
  remove: (id) => api.delete(`/health-records/${id}`),
};

export const reportApi = {
  upload: (formData) => api.post("/reports", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  list: (params) => api.get("/reports", { params }),
  remove: (id) => api.delete(`/reports/${id}`),
};

export const notificationApi = {
  list: (params) => api.get("/notifications", { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

export const userApi = {
  profile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.put("/users/profile", payload),
  changePassword: (payload) => api.put("/users/change-password", payload),
};
