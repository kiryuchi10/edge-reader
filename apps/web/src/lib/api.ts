import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token } = response.data
        localStorage.setItem('access_token', access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Equipment API
export const equipmentApi = {
  list: () => api.get('/hardware/equipment'),
  get: (id: number) => api.get(`/hardware/equipment/${id}`),
  create: (data: any) => api.post('/hardware/equipment', data),
  update: (id: number, data: any) => api.put(`/hardware/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/hardware/equipment/${id}`),
  connect: (id: number) => api.post(`/hardware/equipment/${id}/connect`),
  disconnect: (id: number) => api.post(`/hardware/equipment/${id}/disconnect`),
  getStatus: (id: number) => api.get(`/hardware/equipment/${id}/status`),
}

// Telemetry API
export const telemetryApi = {
  getLatest: (id: number, keys?: string[]) => {
    const params = keys ? { keys: keys.join(',') } : {}
    return api.get(`/hardware/equipment/${id}/telemetry/latest`, { params })
  },
}

// Commands API
export const commandApi = {
  send: (id: number, command: { command: string; parameters: Record<string, any> }) =>
    api.post(`/hardware/equipment/${id}/command`, command),
}

// Alarms API
export const alarmApi = {
  getActive: (equipmentId?: number) => {
    const params = equipmentId ? { equipment_id: equipmentId } : {}
    return api.get('/hardware/alarms/active', { params })
  },
  acknowledge: (alarmId: number) => api.post(`/hardware/alarms/${alarmId}/ack`),
}

// Documents API
export const documentsApi = {
  upload: (file: File, projectId?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    if (projectId) formData.append('project_id', projectId.toString())
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: (skip = 0, limit = 100, projectId?: number) => {
    const params: any = { skip, limit }
    if (projectId) params.project_id = projectId
    return api.get('/documents', { params })
  },
  get: (id: number) => api.get(`/documents/${id}`),
  getPages: (id: number) => api.get(`/documents/${id}/pages`),
  delete: (id: number) => api.delete(`/documents/${id}`),
}

// Datasets API
export const datasetsApi = {
  create: (data: any) => api.post('/datasets', data),
  list: (skip = 0, limit = 100, projectId?: number) => {
    const params: any = { skip, limit }
    if (projectId) params.project_id = projectId
    return api.get('/datasets', { params })
  },
  get: (id: number) => api.get(`/datasets/${id}`),
  getPreview: (id: number, rows = 100) => api.get(`/datasets/${id}/preview`, { params: { rows } }),
  delete: (id: number) => api.delete(`/datasets/${id}`),
}

// Jobs API
export const jobsApi = {
  create: (data: any) => api.post('/jobs', data),
  list: (skip = 0, limit = 100, status?: string, jobType?: string) => {
    const params: any = { skip, limit }
    if (status) params.status = status
    if (jobType) params.job_type = jobType
    return api.get('/jobs', { params })
  },
  get: (id: number) => api.get(`/jobs/${id}`),
  getLogs: (id: number, tail = 100) => api.get(`/jobs/${id}/logs`, { params: { tail } }),
  getArtifacts: (id: number) => api.get(`/jobs/${id}/artifacts`),
  cancel: (id: number) => api.post(`/jobs/${id}/cancel`),
}

// ML Models API
export const mlModelsApi = {
  train: (data: any) => api.post('/models/train', data),
  list: (skip = 0, limit = 100, modelType?: string) => {
    const params: any = { skip, limit }
    if (modelType) params.model_type = modelType
    return api.get('/models', { params })
  },
  get: (id: number) => api.get(`/models/${id}`),
  predict: (id: number, data: any) => api.post(`/models/${id}/predict`, data),
  batchPredict: (id: number, datasetId: number) => api.post(`/models/${id}/batch-predict`, { dataset_id: datasetId }),
  delete: (id: number) => api.delete(`/models/${id}`),
}

// Analytics API
export const analyticsApi = {
  spc: (data: any) => api.post('/analytics/spc', data),
  predictiveMaintenance: (data: any) => api.post('/analytics/predictive-maintenance', data),
  yieldAnalysis: (equipmentId: number, startDate: string, endDate: string) =>
    api.post('/analytics/yield-analysis', null, {
      params: { equipment_id: equipmentId, start_date: startDate, end_date: endDate },
    }),
  qualityControl: (datasetId: number, parameters: Record<string, any>) =>
    api.post('/analytics/quality-control', parameters, { params: { dataset_id: datasetId } }),
}

// AI API
export const aiApi = {
  summarize: (data: any) => api.post('/ai/summarize', data),
  recommendPipeline: (data: any) => api.post('/ai/recommend-pipeline', data),
  extractEntities: (text: string, entityTypes?: string[]) =>
    api.post('/ai/extract-entities', { text, entity_types: entityTypes }),
  chat: (message: string, context?: Record<string, any>) =>
    api.post('/ai/chat', { message, context }),
}

// Re-export types and utilities
export * from '../types/domain'

// Type exports for convenience
export type { Equipment, EquipmentDetail, Job, JobDetail, JobArtifacts, TelemetryPoint, Run, Alarm } from '../types/domain'
