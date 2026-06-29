from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This class manages all connected users
class RoomManager:
    def __init__(self):
        # Dictionary: room_code -> list of connected websockets
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        # Create room if it doesn't exist
        if room_code not in self.rooms:
            self.rooms[room_code] = []
        self.rooms[room_code].append(websocket)
        print(f"User joined room {room_code}. Total: {len(self.rooms[room_code])}")

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.rooms:
            self.rooms[room_code].remove(websocket)
            print(f"User left room {room_code}. Total: {len(self.rooms[room_code])}")

    async def broadcast(self, message: str, room_code: str, sender: WebSocket):
        # Send to everyone in the room EXCEPT the sender
        if room_code in self.rooms:
            for connection in self.rooms[room_code]:
                if connection != sender:
                    await connection.send_text(message)

manager = RoomManager()

@app.get("/")
def read_root():
    return {"message": "Whiteboard backend is running!"}

@app.get("/test")
def test_endpoint():
    return {"status": "ok", "data": "Hello from FastAPI!"}

# WebSocket endpoint — users connect here
@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await manager.connect(websocket, room_code)
    try:
        while True:
            # Wait for a message from this user
            data = await websocket.receive_text()
            # Broadcast it to everyone else in the room
            await manager.broadcast(data, room_code, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code)