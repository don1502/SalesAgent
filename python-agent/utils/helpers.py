import re
from typing import Dict, List, Optional

def extract_email(text: str) -> Optional[str]:
    """Extract email address from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else None

def extract_company_name(text: str) -> Optional[str]:
    """Extract company name from text (basic heuristic)"""
    # Look for common company indicators
    patterns = [
        r'(?:at|from|with)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company|Co))',
        r'([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd))',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

