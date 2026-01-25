export interface WebSocketOptions {
  onMessage: (data: any) => void
  onError?: (error: Event) => void
  onClose?: () => void
}

export function createWebSocket(url: string, options: WebSocketOptions): WebSocket {
  const ws = new WebSocket(url)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      options.onMessage(data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    options.onError?.(error)
  }

  ws.onclose = () => {
    options.onClose?.()
  }

  return ws
}

export function getTelemetryStreamUrl(equipmentId: number, keys?: string[], hz: number = 2.0): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const wsUrl = baseUrl.replace(/^http/, 'ws')
  const params = new URLSearchParams()

  if (keys && keys.length > 0) {
    params.append('keys', keys.join(','))
  }
  params.append('hz', hz.toString())

  return `${wsUrl}/hardware/ws/equipment/${equipmentId}/stream?${params.toString()}`
}

export function buildWsUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_API_BASE_URL?.replace(/^http/, 'ws') || 'ws://localhost:8000/api/v1'
  const url = new URL(path, baseUrl)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }
  
  return url.toString()
}
