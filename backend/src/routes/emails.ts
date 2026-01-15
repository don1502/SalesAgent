import express from 'express'
import { createEmail, getEmail, sendEmailResponse } from '../controllers/emailController'

const router = express.Router()

router.post('/', createEmail)
router.get('/:id', getEmail)
router.post('/:id/send-response', sendEmailResponse)

export default router

