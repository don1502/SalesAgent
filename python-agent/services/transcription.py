import openai
from typing import Optional
from utils.logger import setup_logger
from config import config

logger = setup_logger(__name__)

class TranscriptionService:
    def __init__(self):
        if not config.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY not set. Transcription will fail.")
        else:
            openai.api_key = config.OPENAI_API_KEY
    
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """Transcribe audio using OpenAI Whisper API"""
        try:
            if not config.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not configured")
            
            logger.info(f"Transcribing audio file: {audio_file_path}")
            
            with open(audio_file_path, "rb") as audio_file:
                client = openai.OpenAI(api_key=config.OPENAI_API_KEY)
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="en"
                )
            
            transcription_text = transcript.text
            logger.info(f"Transcription completed. Length: {len(transcription_text)} chars")
            
            return transcription_text
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise

