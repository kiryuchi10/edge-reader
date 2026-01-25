export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'
export type JobType = 'document' | 'chromatogram' | 'spectrum' | 'panel' | 'video'

export interface Job {
  id: string
  assetName: string
  assetType: JobType
  status: JobStatus
  createdAt: string
  updatedAt: string
  progress?: number
  meta?: Record<string, any>
}

export interface JobDetail extends Job {
  inputs?: { name: string; url?: string; sizeBytes?: number }[]
  outputs?: { name: string; url?: string; kind: 'json' | 'csv' | 'pdf' | 'image' }[]
}

export interface JobArtifacts {
  ocr?: { pages: { page: number; text: string }[] }
  tables?: {
    tables: { id: string; title?: string; rows: any[][]; columns?: string[] }[]
  }
  llm?: { summary: string; extractedFields?: Record<string, any>; schema?: any }
  logs?: { lines: string[] }
}

export type EquipmentStatus = 'idle' | 'running' | 'maintenance' | 'error' | 'offline'

export interface Equipment {
  id: number
  name: string
  protocol: 'opcua' | 'mqtt' | 'secs_gem' | 'modbus' | 'rest'
  type: string
  location?: string
  status: EquipmentStatus
}

export interface EquipmentDetail extends Equipment {
  config?: {
    endpoint_url?: string
    nodes?: Record<string, string>
  }
}

export interface TelemetryPoint {
  ts: string
  metrics: Record<string, number>
}

export interface Run {
  id: string
  equipmentId: number
  name?: string
  startedAt: string
  endedAt?: string
  notes?: string
  tags?: string[]
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
