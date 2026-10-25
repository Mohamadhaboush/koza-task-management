import client from './client';

export const getTasks = (params) => client.get('/tasks', { params });
export const getTask = (id) => client.get(`/tasks/${id}`);
export const createTask = (data) => client.post('/tasks', data);
export const updateTask = (id, data) => client.patch(`/tasks/${id}`, data);
export const deleteTask = (id) => client.delete(`/tasks/${id}`);

export const getChecklists = (taskId) => client.get(`/tasks/${taskId}/checklists`);
export const createChecklist = (taskId, data) => client.post(`/tasks/${taskId}/checklists`, data);
export const updateChecklist = (taskId, id, data) => client.patch(`/tasks/${taskId}/checklists/${id}`, data);
export const deleteChecklist = (taskId, id) => client.delete(`/tasks/${taskId}/checklists/${id}`);

export const getActivityLogs = (taskId) => client.get(`/tasks/${taskId}/activity-logs`);
