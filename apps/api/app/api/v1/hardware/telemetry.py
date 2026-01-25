from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import asyncio
from app.core.db import get_db
from app.services.telemetry_service import get_latest_telemetry, save_telemetry_point
from app.services.alarm_service import evaluate_alarm_conditions
from app.hardware.services import hardware_manager

router = APIRouter(prefix="/hardware/equipment", tags=["telemetry"])

@router.get("/{equipment_id}/telemetry/latest")
async def get_equipment_telemetry_latest(
    equipment_id: int,
    keys: Optional[str] = Query(None, description="Comma-separated list of keys"),
    db: Session = Depends(get_db)
):
    """Get latest telemetry data for equipment"""
    key_list = [k.strip() for k in keys.split(",")] if keys else None
    
    data = await get_latest_telemetry(db, equipment_id, key_list)
    
    # Evaluate alarm conditions
    await evaluate_alarm_conditions(db, equipment_id, data)
    
    return data

@router.websocket("/ws/equipment/{equipment_id}/stream")
async def equipment_telemetry_stream(
    websocket: WebSocket,
    equipment_id: int,
    keys: Optional[str] = None,
    hz: float = 2.0
):
    """
    WebSocket endpoint for real-time telemetry streaming
    
    Query params:
    - keys: Comma-separated list of keys to stream (e.g., "temperature,pressure")
    - hz: Update frequency in Hz (default: 2.0)
    """
    await websocket.accept()
    
    key_list = [k.strip() for k in keys.split(",")] if keys else None
    
    try:
        async for data in hardware_manager.stream_telemetry(
            equipment_id=equipment_id,
            keys=key_list,
            hz=hz
        ):
            await websocket.send_json(data)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for equipment {equipment_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))
