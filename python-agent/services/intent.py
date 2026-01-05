import json
import anthropic
from typing import Dict
from utils.logger import setup_logger
from config import config

logger = setup_logger(__name__)

class IntentService:
    def __init__(self):
        if not config.CLAUDE_API_KEY:
            logger.warning("CLAUDE_API_KEY not set. Intent detection will use fallback.")
        else:
            self.client = anthropic.Anthropic(api_key=config.CLAUDE_API_KEY)
    
    async def detect_intent(self, text: str) -> Dict:
        """Detect intent using Claude API"""
        try:
            if not config.CLAUDE_API_KEY:
                # Fallback to rule-based detection
                return self._fallback_intent_detection(text)
            
            prompt = f"""Classify this message intent into EXACTLY ONE category:
1. sales_inquiry - Customer asking about product/pricing/features/services
2. performance_query - Customer asking "How are you doing?" or performance metrics/results
3. technical_question - Technical or product-specific questions about implementation
4. general_inquiry - General questions not fitting above categories

Message: {text}

Return ONLY valid JSON with this exact structure:
{{"intent": "sales_inquiry|performance_query|technical_question|general_inquiry", "confidence": 0.0-1.0}}"""
            
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text.strip()
            
            # Try to parse JSON from response
            try:
                # Extract JSON if wrapped in markdown
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0].strip()
                
                result = json.loads(response_text)
                
                # Validate intent
                valid_intents = ['sales_inquiry', 'performance_query', 'technical_question', 'general_inquiry']
                if result.get('intent') not in valid_intents:
                    result['intent'] = 'general_inquiry'
                
                return result
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse JSON from Claude response: {response_text}")
                return self._fallback_intent_detection(text)
                
        except Exception as e:
            logger.error(f"Error detecting intent: {str(e)}")
            return self._fallback_intent_detection(text)
    
    def _fallback_intent_detection(self, text: str) -> Dict:
        """Fallback rule-based intent detection"""
        text_lower = text.lower()
        
        # Sales inquiry keywords
        sales_keywords = ['price', 'pricing', 'cost', 'buy', 'purchase', 'product', 'service', 'feature', 'demo']
        if any(keyword in text_lower for keyword in sales_keywords):
            return {"intent": "sales_inquiry", "confidence": 0.7}
        
        # Performance query keywords
        perf_keywords = ['how are you', 'performance', 'results', 'metrics', 'doing', 'status']
        if any(keyword in text_lower for keyword in perf_keywords):
            return {"intent": "performance_query", "confidence": 0.7}
        
        # Technical question keywords
        tech_keywords = ['how to', 'implement', 'technical', 'api', 'integration', 'code', 'setup']
        if any(keyword in text_lower for keyword in tech_keywords):
            return {"intent": "technical_question", "confidence": 0.7}
        
        return {"intent": "general_inquiry", "confidence": 0.5}

