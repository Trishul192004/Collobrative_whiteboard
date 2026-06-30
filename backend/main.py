from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models.database import init_db
from routers import auth, rooms
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
init_db()

# Include routers
app.include_router(auth.router)
app.include_router(rooms.router)

# WebSocket manager (same as Day 3)
class RoomManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        if room_code not in self.rooms:
            self.rooms[room_code] = []
        self.rooms[room_code].append(websocket)
        print(f"User joined room {room_code}. Total: {len(self.rooms[room_code])}")

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.rooms:
            self.rooms[room_code].remove(websocket)
            print(f"User left room {room_code}. Total: {len(self.rooms[room_code])}")

    async def broadcast(self, message: str, room_code: str, sender: WebSocket):
        if room_code in self.rooms:
            for connection in self.rooms[room_code]:
                if connection != sender:
                    await connection.send_text(message)

manager = RoomManager()

@app.get("/")
def read_root():
    return {"message": "Whiteboard backend is running!"}

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await manager.connect(websocket, room_code)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, room_code, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code)