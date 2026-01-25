from fastapi import APIRouter
from app.api.v1.hardware import equipment, telemetry, commands, alarms

router = APIRouter()

router.include_router(equipment.router)
router.include_router(telemetry.router)
router.include_router(commands.router)
router.include_router(alarms.router)
