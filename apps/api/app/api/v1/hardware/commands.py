from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.schemas.command import EquipmentCommand, CommandResponse
from app.hardware.services import hardware_manager

router = APIRouter(prefix="/hardware/equipment", tags=["commands"])

@router.post("/{equipment_id}/command", response_model=CommandResponse)
async def send_equipment_command(
    equipment_id: int,
    command: EquipmentCommand,
    db: Session = Depends(get_db)
):
    """Send command to equipment"""
    try:
        success = await hardware_manager.send_command(
            equipment_id=equipment_id,
            command=command.command,
            parameters=command.parameters
        )
        
        return CommandResponse(
            success=success,
            message="Command sent successfully" if success else "Command failed"
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
