import express from 'express'
import {
  getLeads,
  getLead,
  updateLead,
  getLeadInteractions,
} from '../controllers/leadController'

const router = express.Router()

router.get('/', getLeads)
router.get('/:id', getLead)
router.patch('/:id', updateLead)
router.get('/:id/interactions', getLeadInteractions)

export default router

