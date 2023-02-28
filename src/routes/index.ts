import { Router } from 'express'
import { router as authRouter } from './auth'
import { router as status } from './status'
import { router as eslRouter} from './esl'

const router = Router()

router.use('/', status)
router.use('/api/auth', authRouter)
router.use('/api/esl', eslRouter)

export { router }
