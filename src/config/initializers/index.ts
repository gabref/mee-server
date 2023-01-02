import express from 'express'
// import { Logger } from '../../helpers/logger'
import { Server } from 'http'

import useMiddlewares from './middlewares'
import useSocket from './socket'

const init = (app?: express.Application): Server => {
    if (!app) throw new Error('No Express Server Application, could not start')

    useMiddlewares(app)

    const server = useSocket(app)

    return server
}

export default init
