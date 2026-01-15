import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { pythonAgentService } from '../services/pythonAgent'
import { AppError } from '../middleware/errorHandler'

export const createCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('Audio file is required', 400)
    }

    const audioPath = req.file.path

    // Create call record
    const call = await prisma.call.create({
      data: {
        audioUrl: audioPath,
        duration: 0,
      },
    })

    // Process with Python AI agent (async, don't wait)
    pythonAgentService
      .processCall(call.id, audioPath)
      .then(async (analysis) => {
        // Extract or create lead
        let lead = null
        if (analysis.lead_email) {
          lead = await prisma.lead.findUnique({
            where: { email: analysis.lead_email },
          })

          if (!lead) {
            lead = await prisma.lead.create({
              data: {
                name: analysis.lead_name || 'Unknown',
                email: analysis.lead_email,
                company: analysis.company,
                score: analysis.lead_score,
                status: analysis.lead_tier,
              },
            })
          } else {
            lead = await prisma.lead.update({
              where: { id: lead.id },
              data: {
                score: analysis.lead_score,
                status: analysis.lead_tier,
              },
            })
          }
        }

        // Update call with analysis
        await prisma.call.update({
          where: { id: call.id },
          data: {
            leadId: lead?.id,
            transcription: analysis.transcription,
            analysis: analysis as any,
          },
        })

        // Create interaction record
        if (lead) {
          await prisma.interaction.create({
            data: {
              leadId: lead.id,
              type: 'call',
              content: analysis.transcription,
              intent: analysis.intent,
              extractedData: {
                requirements: analysis.requirements,
                nextStep: analysis.next_step,
              },
              suggestedAction: analysis.next_step,
            },
          })
        }

        // Emit WebSocket event
        const io = req.app.get('io')
        if (io && lead) {
          io.emit('call_processed', {
            callId: call.id,
            leadId: lead.id,
            analysis,
          })
        }
      })
      .catch((error) => {
        console.error('Error processing call:', error)
      })

    res.json({
      callId: call.id,
      message: 'Call uploaded and processing started',
    })
  } catch (error: any) {
    next(error)
  }
}

export const getCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const call = await prisma.call.findUnique({
      where: { id },
      include: {
        lead: true,
      },
    })

    if (!call) {
      throw new AppError('Call not found', 404)
    }

    res.json(call)
  } catch (error: any) {
    next(error)
  }
}

