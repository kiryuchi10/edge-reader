# Edge Reader — Hardware Integration MVP

Industrial hardware integration MVP using **FastAPI + React**  
(Real-time telemetry via WebSocket, OPC UA first)

---

## 1. Project Goal (MVP)

This project builds a **minimum viable hardware integration platform** that can:

1. Register industrial equipment
2. Connect/disconnect equipment (OPC UA)
3. Read real-time telemetry (temperature, pressure)
4. Stream telemetry via WebSocket
5. Display live dashboards in a web UI

⚠️ **MVP focus**  
- OPC UA only  
- No advanced protocols (SECS/GEM, MQTT, Modbus) yet  
- No authentication complexity  
- No production optimizations  

---

## 2. Tech Stack (Fixed)

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- asyncua (OPC UA client)
- WebSocket (FastAPI native)

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS (or minimal CSS)
- Native WebSocket

### DevOps
- Docker
- docker-compose

---

## 3. Repository Structure (MVP Only)

```txt
edge-reader-platform/
├─ apps/
│  ├─ api/
│  │  ├─ Dockerfile
│  │  └─ app/
│  │     ├─ main.py
│  │     ├─ core/
│  │     │  ├─ config.py
│  │     │  └─ db.py
│  │     ├─ models/
│  │     │  ├─ equipment.py
│  │     │  ├─ equipment_config.py
│  │     │  └─ telemetry.py
│  │     ├─ schemas/
│  │     ├─ api/v1/hardware/
│  │     ├─ hardware/
│  │     │  ├─ base/equipment_interface.py
│  │     │  ├─ protocols/opcua_client.py
│  │     │  └─ services/hardware_manager.py
│  │     └─ services/
│  └─ web/
│     ├─ Dockerfile
│     └─ src/
│        ├─ app/
│        ├─ pages/
│        ├─ components/
│        ├─ hooks/
│        └─ lib/
├─ docker-compose.dev.yml
├─ .env.example
└─ README.md
```

---

## 4. Environment Variables

```env
# App
ENV=development
API_BASE_URL=http://localhost:8000/api/v1

# Database
DB_DSN=postgresql+psycopg://edge:edgepass@db:5432/edge_reader

# CORS
CORS_ORIGINS=http://localhost:5173

# OPC UA (example)
OPCUA_DEFAULT_TIMEOUT=5
```

---

## 5. Running Locally

### 5.1 Start all services

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Services:**
- API: http://localhost:8000
- Web: http://localhost:5173
- DB: postgres (container)
- **(Optional) OPC UA simulator**

---

## 6. API Endpoints (MVP)

### Health
- `GET /api/v1/health`

### Equipment
- `POST /api/v1/hardware/equipment`
- `GET  /api/v1/hardware/equipment`
- `GET  /api/v1/hardware/equipment/{id}`

**POST example:**

```json
{
  "name": "PLC-001",
  "type": "plc",
  "protocol": "opcua",
  "location": "Lab-1",
  "config": {
    "endpoint_url": "opc.tcp://opcua-sim:4840",
    "nodes": {
      "temperature": "ns=2;s=Temp",
      "pressure": "ns=2;s=Pressure"
    }
  }
}
```

### Connect / Disconnect
- `POST /api/v1/hardware/equipment/{id}/connect`
- `POST /api/v1/hardware/equipment/{id}/disconnect`

### Status
- `GET /api/v1/hardware/equipment/{id}/status`

### Telemetry (REST)
- `GET /api/v1/hardware/equipment/{id}/telemetry/latest?keys=temperature,pressure`

### Telemetry (WebSocket)
- `ws://localhost:8000/api/v1/hardware/ws/equipment/{id}/stream?keys=temperature,pressure&hz=2`

**WS payload:**

```json
{
  "equipment_id": 1,
  "timestamp": "2026-01-19T12:34:56Z",
  "metrics": {
    "temperature": 24.8,
    "pressure": 1.02
  }
}
```

---

## 7. Frontend Pages (MVP)

**Pages:**
- `/` Overview
- `/hardware` Equipment Dashboard
- `/hardware/:id` Equipment Detail
- `/hardware/:id/live` Live Telemetry

**Components:**
- EquipmentCard
- TelemetryChart (line chart)
- ControlPanel (connect / disconnect / set)
- AlarmPanel (optional MVP)

---

## 8. UI / Visual Design (Minimal)

- **Dark industrial theme**
- Background: slate-900
- Cards: slate-800 + border
- **Status colors:**
  - 🟢 running
  - 🔵 idle
  - 🟡 warning
  - 🔴 error
  - ⚪ offline

**Layout:**
```
[ TopBar ]
[ SideNav | Equipment Cards Grid ]
[ Detail: Charts | Control Panel ]
```

---

## 9. Definition of Done (MVP)

✅ docker-compose up works  
✅ Equipment CRUD works  
✅ OPC UA connect logs appear  
✅ WebSocket streams telemetry  
✅ React chart updates in real time

---

## 10. Next Phase (Not in MVP)

- MQTT / Modbus / SECS-GEM adapters
- Edge Gateway
- Paper2Code integration
- AI UI Builder
- RBAC / Audit logs
- SPC & predictive analytics
