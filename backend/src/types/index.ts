export interface ProcessCallResponse {
  transcription: string
  intent: string
  lead_score: number
  lead_tier: 'hot' | 'warm' | 'cold'
  requirements?: string[]
  suggested_email?: string
  next_step?: string
  lead_name?: string
  lead_email?: string
  company?: string
}

export interface ProcessEmailResponse {
  sender: string
  intent: string
  lead_score: number
  lead_tier: 'hot' | 'warm' | 'cold'
  suggested_response: string
  extracted_data?: Record<string, any>
}

export interface LeadUpdate {
  id: string
  score?: number
  status?: string
  notes?: string
}

