from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import Optional
from pydantic import BaseModel
import aiofiles
import os
from config import config
from services.transcription import TranscriptionService
from services.analysis import AnalysisService
from services.intent import IntentService
from services.llm import LLMService
from utils.logger import setup_logger

class EmailProcessRequest(BaseModel):
    email_body: str
    from_email: str
    subject: Optional[str] = None

logger = setup_logger(__name__)

router = APIRouter()
transcription_service = TranscriptionService()
analysis_service = AnalysisService()
intent_service = IntentService()
llm_service = LLMService()

@router.post("/process-call")
async def process_call(audio_file: UploadFile = File(...)):
    """Process sales call audio"""
    try:
        # Ensure upload directory exists
        os.makedirs(config.UPLOAD_DIR, exist_ok=True)
        
        # Save audio temporarily
        audio_path = os.path.join(config.UPLOAD_DIR, f"temp_{audio_file.filename}")
        
        async with aiofiles.open(audio_path, 'wb') as f:
            content = await audio_file.read()
            await f.write(content)
        
        logger.info(f"Saved audio file: {audio_path}")
        
        # 1. Transcribe
        logger.info("Starting transcription...")
        transcription = await transcription_service.transcribe_audio(audio_path)
        
        # 2. Detect intent
        logger.info("Detecting intent...")
        intent_result = await intent_service.detect_intent(transcription)
        
        # 3. Analyze lead
        logger.info("Analyzing lead...")
        lead_analysis = analysis_service.score_lead(transcription)
        
        # 4. Extract requirements
        logger.info("Extracting requirements...")
        requirements = await llm_service.extract_requirements(transcription)
        
        # 5. Extract lead info
        logger.info("Extracting lead information...")
        lead_info = await llm_service.extract_lead_info(transcription)
        
        # 6. Generate email response
        logger.info("Generating email response...")
        email_response = await llm_service.generate_email_response(
            transcription,
            {**lead_info, **lead_analysis, 'requirements': requirements}
        )
        
        # 7. Suggest next step
        logger.info("Suggesting next step...")
        next_step = await llm_service.suggest_next_step(transcription, lead_analysis)
        
        # Clean up temp file
        try:
            os.remove(audio_path)
        except:
            pass
        
        return {
            "transcription": transcription,
            "intent": intent_result["intent"],
            "confidence": intent_result.get("confidence", 0.5),
            "lead_score": lead_analysis["score"],
            "lead_tier": lead_analysis["tier"],
            "requirements": requirements,
            "suggested_email": email_response,
            "next_step": next_step,
            "lead_name": lead_info.get("name"),
            "lead_email": lead_info.get("email"),
            "lead_phone": lead_info.get("phone"),
            "company": lead_info.get("company"),
        }
    except Exception as e:
        logger.error(f"Error processing call: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process call: {str(e)}")

@router.post("/process-email")
async def process_email(request: EmailProcessRequest):
    """Process email content"""
    try:
        email_body = request.email_body
        from_email = request.from_email
        subject = request.subject
        # 1. Detect intent
        logger.info("Detecting intent...")
        intent_result = await intent_service.detect_intent(email_body)
        
        # 2. Analyze lead
        logger.info("Analyzing lead...")
        lead_analysis = analysis_service.score_lead("", email_body)
        
        # 3. Extract requirements
        logger.info("Extracting requirements...")
        requirements = await llm_service.extract_requirements(email_body)
        
        # 4. Generate response
        logger.info("Generating email response...")
        email_response = await llm_service.generate_email_response(
            email_body,
            {
                'name': from_email.split('@')[0],
                'email': from_email,
                'requirements': requirements,
                **lead_analysis
            }
        )
        
        return {
            "sender": from_email,
            "intent": intent_result["intent"],
            "confidence": intent_result.get("confidence", 0.5),
            "lead_score": lead_analysis["score"],
            "lead_tier": lead_analysis["tier"],
            "suggested_response": email_response,
            "extracted_data": {
                "requirements": requirements,
                "factors": lead_analysis.get("factors", {})
            }
        }
    except Exception as e:
        logger.error(f"Error processing email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process email: {str(e)}")

