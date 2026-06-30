from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import Room, RoomMember, get_db
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import random
import string

router = APIRouter(prefix="/rooms", tags=["rooms"])
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "fallbacksecret")
ALGORITHM = "HS256"

# --- Helper: get current user from token ---

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Helper: generate random room code ---

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# --- Endpoints ---

@router.post("/create")
def create_room(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Generate unique room code
    while True:
        code = generate_room_code()
        existing = db.query(Room).filter(Room.room_code == code).first()
        if not existing:
            break

    room = Room(room_code=code, host_id=current_user["id"])
    db.add(room)
    db.commit()
    db.refresh(room)

    # Add host as first member
    member = RoomMember(room_id=room.id, user_id=current_user["id"])
    db.add(member)
    db.commit()

    return {"room_code": code, "room_id": room.id}

@router.post("/join/{room_code}")
def join_room(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check if already a member
    existing = db.query(RoomMember).filter(
        RoomMember.room_id == room.id,
        RoomMember.user_id == current_user["id"]
    ).first()

    if not existing:
        member = RoomMember(room_id=room.id, user_id=current_user["id"])
        db.add(member)
        db.commit()

    return {"room_code": room.room_code, "room_id": room.id}