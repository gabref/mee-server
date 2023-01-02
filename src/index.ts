import { Server } from 'http'
import express from 'express'

import init from './config/initializers'
import { normalizePort, onError, onProcessError, onProcessRejection, onListening, onClose, gracefulShutdown } from './utils/serverInits'

const { PORT } = process.env
const initialAttempts = 1

function main() {
    let port = normalizePort(PORT || '3000')

    const server: Server = init(express())

    server.listen(port)
    server.on('error', (err) => onError(err, server, initialAttempts, port))
    server.on('listening', () => onListening(server))
    server.on('close', () => onClose())

    process.on('uncaughtException', (err) => onProcessError(err, server))
    process.on('unhandledRejection', (reason, promise) => onProcessRejection(reason, promise))
    process.on('SIGINT', (signal) => gracefulShutdown(signal, server))
    process.on('SIGTERM', (signal) => gracefulShutdown(signal, server))
}

main()
