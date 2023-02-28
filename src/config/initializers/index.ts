import express from 'express'
// import { Logger } from '../../helpers/logger'
import { Server } from 'http'
import dotenv from 'dotenv'

import useMiddlewares from './middlewares'
import useSocket from './socket'
import useRoutes from './routes'

const init = (app?: express.Application): Server => {
    dotenv.config()

    if (!app) throw new Error('No Express Server Application, could not start')

    useMiddlewares(app)
    useRoutes(app)

    const server = useSocket(app)

    return server
}

export default init
