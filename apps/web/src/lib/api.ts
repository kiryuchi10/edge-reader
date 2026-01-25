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

// Re-export types and utilities
export * from '../types/domain'

// Type exports for convenience
export type { Equipment, EquipmentDetail, Job, JobDetail, JobArtifacts, TelemetryPoint, Run, Alarm } from '../types/domain'
