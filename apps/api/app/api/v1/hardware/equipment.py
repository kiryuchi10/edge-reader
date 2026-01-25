from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.models.equipment import Equipment, EquipmentStatus
from app.models.equipment_config import EquipmentConfig
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentResponse,
    EquipmentDetailResponse
)
from app.hardware.services import hardware_manager

router = APIRouter(prefix="/hardware/equipment", tags=["equipment"])

@router.post("", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    """Register new equipment in the system"""
    # Create equipment record
    db_equipment = Equipment(
        name=equipment.name,
        type=equipment.type,
        protocol=equipment.protocol,
        location=equipment.location,
        manufacturer=equipment.manufacturer,
        model=equipment.model,
        status=EquipmentStatus.OFFLINE
    )
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    
    # Create equipment config
    db_config = EquipmentConfig(
        equipment_id=db_equipment.id,
        config_json=equipment.config
    )
    db.add(db_config)
    db.commit()
    
    # Initialize hardware adapter (but don't connect yet)
    try:
        hardware_manager.add_equipment(
            equipment_id=db_equipment.id,
            equipment_type=equipment.type,
            protocol=equipment.protocol,
            config=equipment.config
        )
    except Exception as e:
        # Log error but don't fail equipment creation
        print(f"Warning: Failed to initialize hardware adapter: {e}")
    
    return db_equipment

@router.get("", response_model=List[EquipmentResponse])
async def list_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of all equipment"""
    equipment = db.query(Equipment).offset(skip).limit(limit).all()
    return equipment

@router.get("/{equipment_id}", response_model=EquipmentDetailResponse)
async def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Get equipment details"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    config = db.query(EquipmentConfig).filter(
        EquipmentConfig.equipment_id == equipment_id
    ).first()
    
    response = EquipmentDetailResponse.model_validate(equipment)
    if config:
        response.config = config.config_json
    
    return response

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_update: EquipmentUpdate,
    db: Session = Depends(get_db)
):
    """Update equipment information"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_data = equipment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    return equipment

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Delete equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Remove from hardware manager
    hardware_manager.remove_equipment(equipment_id)
    
    db.delete(equipment)
    db.commit()
    return None

@router.post("/{equipment_id}/connect")
async def connect_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Connect to equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Ensure adapter exists
    adapter = hardware_manager.get_equipment(equipment_id)
    if not adapter:
        config = db.query(EquipmentConfig).filter(
            EquipmentConfig.equipment_id == equipment_id
        ).first()
        if not config:
            raise HTTPException(status_code=400, detail="Equipment config not found")
        
        adapter = hardware_manager.add_equipment(
            equipment_id=equipment_id,
            equipment_type=equipment.type,
            protocol=equipment.protocol,
            config=config.config_json
        )
    
    success = await hardware_manager.connect(equipment_id)
    if success:
        equipment.status = EquipmentStatus.IDLE
        db.commit()
        return {"success": True, "message": "Connected"}
    else:
        equipment.status = EquipmentStatus.ERROR
        db.commit()
        return {"success": False, "message": "Connection failed"}

@router.post("/{equipment_id}/disconnect")
async def disconnect_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Disconnect from equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    success = await hardware_manager.disconnect(equipment_id)
    if success:
        equipment.status = EquipmentStatus.OFFLINE
        db.commit()
        return {"success": True, "message": "Disconnected"}
    else:
        return {"success": False, "message": "Disconnect failed"}

@router.get("/{equipment_id}/status")
async def get_equipment_status(equipment_id: int, db: Session = Depends(get_db)):
    """Get current equipment status"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    try:
        status_data = await hardware_manager.get_status(equipment_id)
        return status_data
    except ValueError:
        # Equipment not in hardware manager, return DB status
        return {
            'equipment_id': equipment_id,
            'status': equipment.status.value,
            'connected': False,
            'timestamp': equipment.updated_at.isoformat() if equipment.updated_at else None
        }
