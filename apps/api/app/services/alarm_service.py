from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from app.models.alarm import Alarm, AlarmSeverity
from app.models.equipment import Equipment

async def create_alarm(db: Session, equipment_id: int, severity: AlarmSeverity,
                      message: str, code: Optional[str] = None) -> Alarm:
    """Create a new alarm"""
    alarm = Alarm(
        equipment_id=equipment_id,
        severity=severity,
        message=message,
        code=code
    )
    db.add(alarm)
    db.commit()
    db.refresh(alarm)
    return alarm

async def get_active_alarms(db: Session, 
                           equipment_id: Optional[int] = None) -> List[Alarm]:
    """Get all active (unacknowledged) alarms"""
    query = db.query(Alarm).filter(Alarm.acked_at.is_(None))
    
    if equipment_id:
        query = query.filter(Alarm.equipment_id == equipment_id)
    
    query = query.order_by(desc(Alarm.ts))
    
    return query.all()

async def acknowledge_alarm(db: Session, alarm_id: int, 
                           acked_by: str = "system") -> Alarm:
    """Acknowledge an alarm"""
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm:
        raise ValueError(f"Alarm {alarm_id} not found")
    
    alarm.acked_at = datetime.now()
    alarm.acked_by = acked_by
    db.commit()
    db.refresh(alarm)
    return alarm

async def evaluate_alarm_conditions(db: Session, equipment_id: int, 
                                   telemetry: Dict):
    """
    Evaluate telemetry data and create alarms if thresholds are exceeded
    MVP: Simple threshold-based alarms
    """
    metrics = telemetry.get('metrics', {})
    
    # Example thresholds (should come from equipment_config in production)
    thresholds = {
        'temperature': {'warning': 80, 'critical': 100},
        'pressure': {'warning': 2.5, 'critical': 3.0},
    }
    
    for key, value in metrics.items():
        if key not in thresholds:
            continue
        
        threshold = thresholds[key]
        
        if value >= threshold.get('critical', float('inf')):
            await create_alarm(
                db, equipment_id, AlarmSeverity.CRITICAL,
                f"{key.capitalize()} exceeded critical threshold: {value}",
                f"CRITICAL_{key.upper()}"
            )
        elif value >= threshold.get('warning', float('inf')):
            await create_alarm(
                db, equipment_id, AlarmSeverity.WARNING,
                f"{key.capitalize()} exceeded warning threshold: {value}",
                f"WARNING_{key.upper()}"
            )
