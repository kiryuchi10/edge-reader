from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.models.telemetry import TelemetryPoint
from app.models.equipment import Equipment
from app.hardware.services import hardware_manager

async def save_telemetry_point(db: Session, equipment_id: int, 
                               key: str, value: float, unit: Optional[str] = None):
    """Save a single telemetry point to database"""
    telemetry = TelemetryPoint(
        equipment_id=equipment_id,
        key=key,
        value=value,
        unit=unit
    )
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    return telemetry

async def get_latest_telemetry(db: Session, equipment_id: int, 
                               keys: Optional[List[str]] = None) -> Dict:
    """
    Get latest telemetry data for equipment
    First tries to get from hardware, then falls back to database
    """
    try:
        # Try to get live data from hardware
        data = await hardware_manager.get_telemetry(equipment_id, keys)
        
        # Save to database
        if 'metrics' in data:
            for key, value in data['metrics'].items():
                await save_telemetry_point(db, equipment_id, key, value)
        
        return data
    except Exception as e:
        # Fallback to database
        query = db.query(TelemetryPoint).filter(
            TelemetryPoint.equipment_id == equipment_id
        )
        
        if keys:
            query = query.filter(TelemetryPoint.key.in_(keys))
        
        # Get latest point for each key
        latest_points = {}
        for key in (keys or []):
            point = query.filter(TelemetryPoint.key == key)\
                .order_by(desc(TelemetryPoint.ts))\
                .first()
            if point:
                latest_points[point.key] = point.value
        
        return {
            'equipment_id': equipment_id,
            'timestamp': datetime.now().isoformat(),
            'metrics': latest_points,
            'source': 'database'
        }

async def get_telemetry_history(db: Session, equipment_id: int,
                                keys: Optional[List[str]] = None,
                                from_time: Optional[datetime] = None,
                                to_time: Optional[datetime] = None,
                                limit: int = 1000) -> List[TelemetryPoint]:
    """Get telemetry history from database"""
    query = db.query(TelemetryPoint).filter(
        TelemetryPoint.equipment_id == equipment_id
    )
    
    if keys:
        query = query.filter(TelemetryPoint.key.in_(keys))
    
    if from_time:
        query = query.filter(TelemetryPoint.ts >= from_time)
    
    if to_time:
        query = query.filter(TelemetryPoint.ts <= to_time)
    
    query = query.order_by(desc(TelemetryPoint.ts)).limit(limit)
    
    return query.all()
