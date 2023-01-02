import express from 'express'
// import { Logger } from '../../helpers/logger'
import { Server } from 'http'

import useSocket from './socket'

// TODO imports

const init = (app?: express.Application): Server => {
    if (!app) throw new Error('No Express Server Application, could not start')

    const server = useSocket(app)

    return server
}

export default init
