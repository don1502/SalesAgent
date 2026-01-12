from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config
from routes import process, health
from utils.logger import setup_logger

logger = setup_logger(__name__)

app = FastAPI(
    title="Sales AI Agent",
    description="Python AI service for processing sales calls and emails",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(process.router, prefix="/ai", tags=["AI Processing"])

@app.get("/")
async def root():
    return {
        "message": "Sales AI Agent API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "process_call": "/ai/process-call",
            "process_email": "/ai/process-email"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )

