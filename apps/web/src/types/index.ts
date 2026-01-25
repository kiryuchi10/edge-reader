export interface Equipment {
  id: number
  name: string
  type: string
  protocol: string
  status: 'offline' | 'idle' | 'running' | 'error'
  location?: string
  manufacturer?: string
  model?: string
  created_at: string
  config?: Record<string, any>
}

export interface TelemetryData {
  equipment_id: number
  timestamp: string
  metrics: Record<string, number>
  source?: string
}

export interface Alarm {
  id: number
  equipment_id: number
  ts: string
  severity: 'info' | 'warning' | 'critical'
  code?: string
  message: string
  acked_at?: string
  equipment_name?: string
}

export interface EquipmentStatus {
  equipment_id: number
  status: string
  connected: boolean
  timestamp: string
  error?: string
}
