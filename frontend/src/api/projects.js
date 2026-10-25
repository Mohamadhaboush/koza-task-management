import client from './client';

export const getProjects = (params) => client.get('/projects', { params });
export const getProject = (id) => client.get(`/projects/${id}`);
export const createProject = (data) => client.post('/projects', data);
export const updateProject = (id, data) => client.put(`/projects/${id}`, data);
export const deleteProject = (id) => client.delete(`/projects/${id}`);
export const archiveProject = (id) => client.patch(`/projects/${id}/archive`);

export const getStages = (projectId) => client.get(`/projects/${projectId}/stages`);
export const createStage = (projectId, data) => client.post(`/projects/${projectId}/stages`, data);
export const deleteStage = (projectId, stageId) => client.delete(`/projects/${projectId}/stages/${stageId}`);
