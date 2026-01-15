import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const createFollowUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadId, scheduledDate, actionType, notes } = req.body

    if (!leadId || !scheduledDate || !actionType) {
      throw new AppError('leadId, scheduledDate, and actionType are required', 400)
    }

    const followUp = await prisma.followUp.create({
      data: {
        leadId,
        scheduledDate: new Date(scheduledDate),
        actionType,
        status: 'pending',
        notes: notes || null,
      },
    })

    res.json(followUp)
  } catch (error: any) {
    next(error)
  }
}

export const getFollowUps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, leadId } = req.query

    const where: any = {}
    if (status) where.status = status
    if (leadId) where.leadId = leadId

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        lead: true,
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    })

    res.json(followUps)
  } catch (error: any) {
    next(error)
  }
}

export const updateFollowUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'completed') {
        updateData.completedAt = new Date()
      }
    }
    if (notes !== undefined) updateData.notes = notes

    const followUp = await prisma.followUp.update({
      where: { id },
      data: updateData,
    })

    res.json(followUp)
  } catch (error: any) {
    next(error)
  }
}

