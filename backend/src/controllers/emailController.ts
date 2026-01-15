import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { pythonAgentService } from '../services/pythonAgent'
import { AppError } from '../middleware/errorHandler'

export const createEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email_body, from_email, subject } = req.body

    if (!email_body || !from_email) {
      throw new AppError('email_body and from_email are required', 400)
    }

    // Process with Python AI agent
    const analysis = await pythonAgentService.processEmail(email_body, from_email, subject)

    // Extract or create lead
    let lead = await prisma.lead.findUnique({
      where: { email: from_email },
    })

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          name: analysis.sender || 'Unknown',
          email: from_email,
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

    // Create email record
    const email = await prisma.email.create({
      data: {
        leadId: lead.id,
        fromEmail: from_email,
        subject: subject || 'No Subject',
        body: email_body,
        isOutbound: false,
        suggestedResponse: analysis.suggested_response,
      },
    })

    // Create interaction record
    await prisma.interaction.create({
      data: {
        leadId: lead.id,
        type: 'email',
        content: email_body,
        intent: analysis.intent,
        extractedData: analysis.extracted_data,
        suggestedAction: 'send_response',
      },
    })

    // Emit WebSocket event
    const io = req.app.get('io')
    if (io) {
      io.emit('email_processed', {
        emailId: email.id,
        leadId: lead.id,
        analysis,
      })
    }

    res.json({
      emailId: email.id,
      leadId: lead.id,
      analysis,
    })
  } catch (error: any) {
    next(error)
  }
}

export const getEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const email = await prisma.email.findUnique({
      where: { id },
      include: {
        lead: true,
      },
    })

    if (!email) {
      throw new AppError('Email not found', 404)
    }

    res.json(email)
  } catch (error: any) {
    next(error)
  }
}

export const sendEmailResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { responseBody } = req.body

    if (!responseBody) {
      throw new AppError('responseBody is required', 400)
    }

    const email = await prisma.email.findUnique({
      where: { id },
      include: { lead: true },
    })

    if (!email) {
      throw new AppError('Email not found', 404)
    }

    // TODO: Integrate with SendGrid or SMTP
    // For now, just mark as sent
    const updatedEmail = await prisma.email.update({
      where: { id },
      data: {
        responseGenerated: responseBody,
        sentAt: new Date(),
        isOutbound: true,
      },
    })

    res.json({
      message: 'Email sent successfully',
      email: updatedEmail,
    })
  } catch (error: any) {
    next(error)
  }
}

