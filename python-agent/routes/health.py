from fastapi import APIRouter
from config import config

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "python-ai-agent",
        "openai_configured": bool(config.OPENAI_API_KEY),
        "claude_configured": bool(config.CLAUDE_API_KEY),
    }

