import { Router } from 'express'
import { handleEslLogin } from '../../controllers/esl/auth/login'
import { handleHomologVerification } from '../../controllers/esl/auth/verifyHomolog'

const router = Router()

router.post('/auth/login', handleEslLogin)
router.get('/auth/verifyHomolog', handleHomologVerification)

export { router }