import { Router } from 'express'
import { handleLogin } from '../../controllers/auth/login'
import handleVerify from '../../controllers/auth/verify'

const router = Router()

router.post('/login', handleLogin)
router.get('/verify', handleVerify)

export { router }