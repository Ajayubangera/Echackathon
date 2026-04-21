from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid

app = FastAPI()

# Enable CORS for React Native development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files to serve uploaded videos
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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
    video_url: Optional[str] = None

# Mock Database
devices = [
    {"id": "1", "name": "Light", "room": "Living room", "type": "light", "status": True, "icon": "lightbulb", "video_url": None},
    {"id": "2", "name": "Thermostat", "room": "Living room", "type": "thermostat", "status": False, "value": "30.5°C", "icon": "thermometer", "video_url": None},
    {"id": "3", "name": "Air purifier", "room": "Living room", "type": "air_purifier", "status": True, "icon": "wind", "video_url": None},
    {"id": "4", "name": "Switch", "room": "Living room", "type": "switch", "status": True, "icon": "toggle-right", "video_url": None},
    {"id": "5", "name": "Air conditioner", "room": "Living room", "type": "ac", "status": True, "value": "25°C", "icon": "snowflake", "wind": "Strong", "mode": "Mode 1", "child_lock": True, "video_url": None},
    {"id": "6", "name": "Sweeper", "room": "Living room", "type": "sweeper", "status": False, "icon": "bot", "video_url": None},
    {"id": "7", "name": "Light", "room": "Bedroom", "type": "light", "status": False, "icon": "lightbulb", "video_url": None},
    {"id": "8", "name": "Light", "room": "Kitchen", "type": "light", "status": True, "icon": "lightbulb", "video_url": None},
    {"id": "9", "name": "Entrance Cam", "room": "Living room", "type": "video", "status": True, "icon": "video", "video_url": None},
    {"id": "10", "name": "Nursery Cam", "room": "Bedroom", "type": "video", "status": True, "icon": "video", "video_url": None},
    {"id": "11", "name": "Kitchen Cam", "room": "Kitchen", "type": "video", "status": False, "icon": "video", "video_url": None},
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

@app.post("/devices/{device_id}/upload")
async def upload_video(device_id: str, file: UploadFile = File(...)):
    # Check if device exists
    target_device = None
    for device in devices:
        if device["id"] == device_id:
            target_device = device
            break
    
    if not target_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update device video_url
    video_url = f"/uploads/{unique_filename}"
    target_device["video_url"] = video_url
    
    return {"status": "success", "video_url": video_url}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
