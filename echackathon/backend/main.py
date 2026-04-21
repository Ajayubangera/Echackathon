from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for React Native development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Device(BaseModel):
    id: str
    name: str
    room: str
    type: str 
    status: bool
    value: Optional[str] = None 
    icon: str
    wind: Optional[str] = None
    mode: Optional[str] = None
    child_lock: Optional[bool] = None

# Mock Database
devices = [
    {"id": "1", "name": "Light", "room": "Living room", "type": "light", "status": True, "icon": "lightbulb"},
    {"id": "2", "name": "Thermostat", "room": "Living room", "type": "thermostat", "status": False, "value": "30.5°C", "icon": "thermometer"},
    {"id": "3", "name": "Air purifier", "room": "Living room", "type": "air_purifier", "status": True, "icon": "wind"},
    {"id": "4", "name": "Switch", "room": "Living room", "type": "switch", "status": True, "icon": "toggle-right"},
    {"id": "5", "name": "Air conditioner", "room": "Living room", "type": "ac", "status": True, "value": "25°C", "icon": "snowflake", "wind": "Strong", "mode": "Mode 1", "child_lock": True},
    {"id": "6", "name": "Sweeper", "room": "Living room", "type": "sweeper", "status": False, "icon": "bot"},
    {"id": "7", "name": "Light", "room": "Bedroom", "type": "light", "status": false, "icon": "lightbulb"},
    {"id": "8", "name": "Light", "room": "Kitchen", "type": "light", "status": true, "icon": "lightbulb"},
    {"id": "9", "name": "Entrance Cam", "room": "Living room", "type": "video", "status": true, "icon": "video"},
    {"id": "10", "name": "Nursery Cam", "room": "Bedroom", "type": "video", "status": true, "icon": "video"},
    {"id": "11", "name": "Kitchen Cam", "room": "Kitchen", "type": "video", "status": false, "icon": "video"},
]

@app.get("/devices", response_model=List[Device])
async def get_devices():
    return devices

@app.post("/devices/{device_id}/toggle")
async def toggle_device(device_id: str):
    for device in devices:
        if device["id"] == device_id:
            device["status"] = not device["status"]
            return {"status": "success", "device_status": device["status"]}
    raise HTTPException(status_code=404, detail="Device not found")

@app.patch("/devices/{device_id}/value")
async def update_device_value(device_id: str, value: str):
    for device in devices:
        if device["id"] == device_id:
            device["value"] = value
            return {"status": "success", "device_value": device["value"]}
    raise HTTPException(status_code=404, detail="Device not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
