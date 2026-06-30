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
        "http://localhost:5174",
        "http://127.0.0.1:5174",
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
        self.usernames: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, room_code: str, username: str):
        await websocket.accept()
        if room_code not in self.rooms:
            self.rooms[room_code] = []
        self.rooms[room_code].append(websocket)
        self.usernames[websocket] = username

        # Tell everyone in the room about the updated user list
        await self.broadcast_user_list(room_code)
        print(f"{username} joined room {room_code}. Total: {len(self.rooms[room_code])}")

    async def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.rooms and websocket in self.rooms[room_code]:
            username = self.usernames.get(websocket, "Unknown")
            self.rooms[room_code].remove(websocket)
            del self.usernames[websocket]
            await self.broadcast_user_list(room_code)
            print(f"{username} left room {room_code}. Total: {len(self.rooms[room_code])}")

    async def broadcast(self, message: str, room_code: str, sender: WebSocket):
        if room_code in self.rooms:
            for connection in self.rooms[room_code]:
                if connection != sender:
                    await connection.send_text(message)

    async def broadcast_user_list(self, room_code: str):
        if room_code in self.rooms:
            usernames = [self.usernames[ws] for ws in self.rooms[room_code]]
            message = json.dumps({"type": "user_list", "users": usernames})
            for connection in self.rooms[room_code]:
                await connection.send_text(message)
manager = RoomManager()

@app.get("/")
def read_root():
    return {"message": "Whiteboard backend is running!"}

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, username: str = "Anonymous"):
    await manager.connect(websocket, room_code, username)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, room_code, websocket)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, room_code)