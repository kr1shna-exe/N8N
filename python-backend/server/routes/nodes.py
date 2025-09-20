from fastapi import APIRouter

router = APIRouter()

@router.get("/nodes/types")
async def get_node_types():
    """
    Return available node types
    """
    available_nodes = [
        {
            "type": "telegram",
            "name": "Telegram Bot",
            "description": "Send messages via Telegram Bot API",
            "category": "Communication",
            "icon": "📱"
        },
        {
            "type": "email",
            "name": "Email Service", 
            "description": "Send emails using Resend API",
            "category": "Communication",
            "icon": "📧"
        }
    ]
    
    return {
        "nodes": available_nodes,
        "total": len(available_nodes)
    }