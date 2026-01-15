import express from 'express'
import {
  createFollowUp,
  getFollowUps,
  updateFollowUp,
} from '../controllers/followupController'

const router = express.Router()

router.post('/', createFollowUp)
router.get('/', getFollowUps)
router.patch('/:id', updateFollowUp)

export default router

