import { Router } from 'express'

const router = Router()

/** Healthcheck */
router.get('/ping', (_, res) => {
    return res.status(200).json({ hello: 'world' })
})

/** Socket Information */
router.get('/status', (_, res) => {
    return res.status(200).json({ users: 10 })
    // TODO
    // ServerSocket.instance.users
})

export { router }
