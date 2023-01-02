import { Router } from 'express'
import { router as status } from './status'

const router = Router()

router.use('/', status)

export { router }
