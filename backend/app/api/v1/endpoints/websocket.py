from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import asyncio

router = APIRouter()

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections: {user_id: {connection_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.connection_id_counter = 0

    async def connect(self, websocket: WebSocket, user_id: str, user_type: str = "customer") -> str:
        """Connect a WebSocket client and return connection ID"""
        await websocket.accept()
        connection_id = str(self.connection_id_counter)
        self.connection_id_counter += 1
        
        user_key = f"{user_type}:{user_id}"
        if user_key not in self.active_connections:
            self.active_connections[user_key] = {}
        
        self.active_connections[user_key][connection_id] = websocket
        return connection_id

    def disconnect(self, user_id: str, user_type: str = "customer", connection_id: str = None):
        """Disconnect a WebSocket client"""
        user_key = f"{user_type}:{user_id}"
        if user_key in self.active_connections:
            if connection_id:
                self.active_connections[user_key].pop(connection_id, None)
            else:
                # Disconnect all connections for this user
                self.active_connections[user_key].clear()
            
            # Clean up empty user entries
            if not self.active_connections[user_key]:
                del self.active_connections[user_key]

    async def send_personal_message(self, message: dict, user_id: str, user_type: str = "customer"):
        """Send a message to a specific user"""
        user_key = f"{user_type}:{user_id}"
        if user_key in self.active_connections:
            disconnected_connections = []
            for conn_id, websocket in self.active_connections[user_key].items():
                try:
                    await websocket.send_json(message)
                except:
                    disconnected_connections.append(conn_id)
            
            # Clean up disconnected connections
            for conn_id in disconnected_connections:
                self.disconnect(user_id, user_type, conn_id)

    async def broadcast_to_admin(self, message: dict):
        """Broadcast a message to all admin users"""
        for user_key in list(self.active_connections.keys()):
            if user_key.startswith("admin:"):
                user_id = user_key.split(":")[1]
                await self.send_personal_message(message, user_id, "admin")

    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected users"""
        for user_key in list(self.active_connections.keys()):
            user_type, user_id = user_key.split(":", 1)
            await self.send_personal_message(message, user_id, user_type)

manager = ConnectionManager()


@router.websocket("/ws/{user_id}/{user_type}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, user_type: str = "customer"):
    """
    WebSocket endpoint for real-time notifications.
    Clients connect with their user_id and user_type (customer/admin/rider).
    """
    connection_id = await manager.connect(websocket, user_id, user_type)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": f"Connected as {user_type}",
            "connection_id": connection_id
        })
        
        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_json()
            
            # Handle client messages (e.g., ping/pong)
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
    except WebSocketDisconnect:
        manager.disconnect(user_id, user_type, connection_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(user_id, user_type, connection_id)


# Helper function to send notification via WebSocket
async def send_websocket_notification(user_id: str, user_type: str, notification: dict):
    """Send a notification to a user via WebSocket if they're connected"""
    await manager.send_personal_message({
        "type": "notification",
        "data": notification
    }, user_id, user_type)


# Helper function to broadcast to all admins
async def broadcast_admin_notification(notification: dict):
    """Broadcast a notification to all connected admins"""
    await manager.broadcast_to_admin({
        "type": "notification",
        "data": notification
    })
