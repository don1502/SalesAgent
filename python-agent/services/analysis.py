from typing import Dict, List
from utils.logger import setup_logger

logger = setup_logger(__name__)

class AnalysisService:
    def score_lead(self, transcript: str, email_body: str = "") -> Dict:
        """Score lead on scale 1-100 based on conversation indicators"""
        score = 0
        factors = {}
        
        text = (transcript + " " + email_body).lower()
        
        # Check for budget mention
        budget_keywords = ['budget', 'price', 'cost', '$', 'dollar', 'afford', 'pricing', 'quote']
        if any(keyword in text for keyword in budget_keywords):
            score += 25
            factors['budget_mentioned'] = True
        
        # Check for timeline
        timeline_keywords = ['quarter', 'month', 'week', 'soon', 'asap', 'urgent', 'timeline', 'deadline', 'when']
        if any(keyword in text for keyword in timeline_keywords):
            score += 20
            factors['timeline_clear'] = True
        
        # Check for pain points
        pain_keywords = ['problem', 'issue', 'challenge', 'struggle', 'slow', 'difficult', 'need', 'want', 'looking for']
        if any(keyword in text for keyword in pain_keywords):
            score += 20
            factors['pain_points_clear'] = True
        
        # Check for decision authority
        authority_keywords = ['we', 'team', 'company', 'decision', 'decide', 'approve', 'manager', 'director', 'ceo']
        if any(keyword in text for keyword in authority_keywords):
            score += 15
            factors['authority_indicated'] = True
        
        # Length of conversation (engagement)
        total_length = len(transcript) + len(email_body)
        if total_length > 500:
            score += 20
            factors['high_engagement'] = True
        elif total_length > 200:
            score += 10
            factors['moderate_engagement'] = True
        
        # Ensure score is between 1-100
        score = max(1, min(score, 100))
        
        # Determine tier
        if score >= 70:
            tier = 'hot'
        elif score >= 40:
            tier = 'warm'
        else:
            tier = 'cold'
        
        return {
            'score': score,
            'tier': tier,
            'factors': factors
        }
    
    def extract_requirements(self, text: str) -> List[str]:
        """Extract basic requirements from text (simple keyword-based)"""
        requirements = []
        
        text_lower = text.lower()
        
        # Common requirement patterns
        requirement_patterns = {
            'integration': ['integrate', 'integration', 'connect', 'api'],
            'customization': ['custom', 'customize', 'tailor', 'specific'],
            'scalability': ['scale', 'scalable', 'growth', 'expand'],
            'security': ['security', 'secure', 'encryption', 'compliance'],
            'support': ['support', 'help', 'assistance', 'training'],
        }
        
        for req_type, keywords in requirement_patterns.items():
            if any(keyword in text_lower for keyword in keywords):
                requirements.append(req_type)
        
        return requirements

