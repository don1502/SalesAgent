import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = '50' } = req.query

    const where: any = {}
    if (status) {
      where.status = status
    }

    const leads = await prisma.lead.findMany({
      where,
      take: parseInt(limit as string),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            calls: true,
            emails: true,
            interactions: true,
          },
        },
      },
    })

    res.json(leads)
  } catch (error: any) {
    next(error)
  }
}

export const getLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        calls: {
          orderBy: { createdAt: 'desc' },
        },
        emails: {
          orderBy: { createdAt: 'desc' },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
    })

    if (!lead) {
      throw new AppError('Lead not found', 404)
    }

    res.json(lead)
  } catch (error: any) {
    next(error)
  }
}

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { status, score, notes } = req.body

    const updateData: any = {}
    if (status) updateData.status = status
    if (score !== undefined) updateData.score = score
    if (notes !== undefined) updateData.notes = notes

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
    })

    // Emit WebSocket event
    const io = req.app.get('io')
    if (io) {
      io.emit('lead_updated', {
        leadId: lead.id,
        lead,
      })
    }

    res.json(lead)
  } catch (error: any) {
    next(error)
  }
}

export const getLeadInteractions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const interactions = await prisma.interaction.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    })

    res.json(interactions)
  } catch (error: any) {
    next(error)
  }
}

