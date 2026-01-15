import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { ProcessCallResponse, ProcessEmailResponse } from '../types'

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:8000'

class PythonAgentService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: PYTHON_AGENT_URL,
      timeout: 120000, // 2 minutes for processing
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async processCall(callId: string, audioPath: string): Promise<ProcessCallResponse> {
    try {
      const formData = new FormData()
      const fileStream = fs.createReadStream(audioPath)
      const stats = fs.statSync(audioPath)
      
      formData.append('audio_file', fileStream, {
        filename: path.basename(audioPath),
        contentType: 'audio/wav',
        knownLength: stats.size,
      })

      const response = await this.client.post<ProcessCallResponse>(
        '/ai/process-call',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Python agent error:', error.message)
      if (error.response) {
        console.error('Response data:', error.response.data)
      }
      throw new Error(`Failed to process call: ${error.message}`)
    }
  }

  async processEmail(emailBody: string, fromEmail: string, subject?: string): Promise<ProcessEmailResponse> {
    try {
      const response = await this.client.post<ProcessEmailResponse>(
        '/ai/process-email',
        {
          email_body: emailBody,
          from_email: fromEmail,
          subject: subject || '',
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Python agent error:', error.message)
      if (error.response) {
        console.error('Response data:', error.response.data)
      }
      throw new Error(`Failed to process email: ${error.message}`)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}

export const pythonAgentService = new PythonAgentService()

