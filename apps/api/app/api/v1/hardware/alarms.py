from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.schemas.alarm import AlarmResponse
from app.services.alarm_service import (
    get_active_alarms,
    acknowledge_alarm
)

router = APIRouter(prefix="/hardware/alarms", tags=["alarms"])

@router.get("/active", response_model=List[AlarmResponse])
async def get_active_alarms_endpoint(
    equipment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all active (unacknowledged) alarms"""
    alarms = await get_active_alarms(db, equipment_id)
    
    # Add equipment names
    result = []
    for alarm in alarms:
        alarm_dict = AlarmResponse.model_validate(alarm).model_dump()
        alarm_dict['equipment_name'] = alarm.equipment.name if alarm.equipment else None
        result.append(alarm_dict)
    
    return result

@router.post("/{alarm_id}/ack")
async def acknowledge_alarm_endpoint(
    alarm_id: int,
    acked_by: str = "system",
    db: Session = Depends(get_db)
):
    """Acknowledge an alarm"""
    try:
        alarm = await acknowledge_alarm(db, alarm_id, acked_by)
        return {"success": True, "alarm_id": alarm_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
