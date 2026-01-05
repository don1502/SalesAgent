import anthropic
from typing import Dict, List, Optional
from utils.logger import setup_logger
from config import config

logger = setup_logger(__name__)

class LLMService:
    def __init__(self):
        if not config.CLAUDE_API_KEY:
            logger.warning("CLAUDE_API_KEY not set. LLM features will not work.")
        else:
            self.client = anthropic.Anthropic(api_key=config.CLAUDE_API_KEY)
    
    async def extract_requirements(self, text: str) -> List[str]:
        """Extract requirements and pain points using Claude"""
        try:
            if not config.CLAUDE_API_KEY:
                return []
            
            prompt = f"""Extract key requirements, pain points, and needs from this sales conversation.
Return a JSON array of strings, each representing a distinct requirement or pain point.

Conversation: {text}

Return ONLY a JSON array like: ["requirement1", "requirement2", ...]"""
            
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text.strip()
            
            # Extract JSON array
            import json
            import re
            
            # Try to find JSON array in response
            json_match = re.search(r'\[.*?\]', response_text, re.DOTALL)
            if json_match:
                requirements = json.loads(json_match.group(0))
                return requirements if isinstance(requirements, list) else []
            
            return []
        except Exception as e:
            logger.error(f"Error extracting requirements: {str(e)}")
            return []
    
    async def generate_email_response(self, email_body: str, lead_info: Dict) -> str:
        """Generate professional email response"""
        try:
            if not config.CLAUDE_API_KEY:
                return "Thank you for your inquiry. We will get back to you soon."
            
            prompt = f"""You are a professional sales representative. Generate a response email that is:
- Friendly but professional
- Addresses their specific concerns
- Includes a clear call-to-action
- 2-3 paragraphs maximum

From: {lead_info.get('name', 'Customer')} ({lead_info.get('company', 'Unknown Company')})
Original Email: {email_body}

Requirements to address: {', '.join(lead_info.get('requirements', []))}

Generate ONLY the email body (no subject line, no greeting formalities like "Dear X," or "Hi X," - just start with the content):"""
            
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return message.content[0].text.strip()
        except Exception as e:
            logger.error(f"Error generating email: {str(e)}")
            return "Thank you for your inquiry. We will get back to you soon."
    
    async def suggest_next_step(self, text: str, lead_info: Dict) -> str:
        """Suggest next action step"""
        try:
            if not config.CLAUDE_API_KEY:
                return "Schedule a follow-up call"
            
            prompt = f"""Based on this sales conversation, suggest the next best action step.
Options: schedule_demo, send_proposal, follow_up_call, send_information, close_deal

Conversation: {text}
Lead Score: {lead_info.get('score', 0)}
Lead Tier: {lead_info.get('tier', 'cold')}

Return ONLY the action (e.g., "schedule_demo" or "send_proposal"):"""
            
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=100,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return message.content[0].text.strip().lower()
        except Exception as e:
            logger.error(f"Error suggesting next step: {str(e)}")
            return "follow_up_call"
    
    async def extract_lead_info(self, text: str) -> Dict:
        """Extract lead information (name, email, company) from text"""
        try:
            if not config.CLAUDE_API_KEY:
                from utils.helpers import extract_email, extract_phone, extract_company_name
                return {
                    'name': 'Unknown',
                    'email': extract_email(text),
                    'phone': extract_phone(text),
                    'company': extract_company_name(text),
                }
            
            prompt = f"""Extract lead information from this conversation. Return JSON with:
- name: person's name (or "Unknown" if not found)
- email: email address (or null if not found)
- phone: phone number (or null if not found)
- company: company name (or null if not found)

Conversation: {text}

Return ONLY valid JSON: {{"name": "...", "email": "...", "phone": "...", "company": "..."}}"""
            
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text.strip()
            
            # Extract JSON
            import json
            import re
            
            json_match = re.search(r'\{.*?\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            
            # Fallback
            from utils.helpers import extract_email, extract_phone, extract_company_name
            return {
                'name': 'Unknown',
                'email': extract_email(text),
                'phone': extract_phone(text),
                'company': extract_company_name(text),
            }
        except Exception as e:
            logger.error(f"Error extracting lead info: {str(e)}")
            from utils.helpers import extract_email, extract_phone, extract_company_name
            return {
                'name': 'Unknown',
                'email': extract_email(text),
                'phone': extract_phone(text),
                'company': extract_company_name(text),
            }

