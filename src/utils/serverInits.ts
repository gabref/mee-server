import { Server } from 'http'
import { Logger } from '../helpers/logger'

const duration = 2000

/**
 * Normalize port into number, string or false
 */
export function normalizePort(val: string) {
    const port = parseInt(val, 10)

    if (isNaN(port)) return val

    if (port >= 0) return port

    return 3000
}

/**
 * Event listener for HTTP server 'error' event
 * @param error Error
 */
export function onError(error: NodeJS.ErrnoException, server: Server, attempts: number, port: string | number) {
    if (error.syscall !== 'listen') throw error

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            Logger.error(bind + ' requires elevated privileges')
            process.exit(1)
        case 'EADDRINUSE':
            Logger.error(bind + ' is already in use')
            if (attempts >= 5) {
                Logger.error('Max attempts to start server')
                process.exit(1)
            }
            // setTimeout(() => { startServer(server, attempts, port) }, duration)
        default:
            throw error
    }

}

export function onProcessError(error: NodeJS.ErrnoException, server: Server) {
    if (error.code === 'EADDRINUSE') 
        return Logger.error('Unhandled Exception already in use port: ' + error)

    Logger.error('Unkown error')
    Logger.error(error)
    gracefulShutdown(error.code, server)
}

export function onProcessRejection(reason: any, promise: any) {
    console.log('Unhadled Rejection')
    console.log(reason)
    console.log('------------------------')
    console.log(promise)
}

/**
 * Event listener for HTTP server 'listening' event
 */
export function onListening(server: Server) {
    const addr = server.address()
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port
    Logger.info('Listening on ' + bind)
}

/**
 * Event listener for HTTP server 'close' event
 */
export function onClose() {
    Logger.info('Bye!')
}

/**
 * Event listener for process events 'SIGINT' and 'SIGTERM'
 */
export function gracefulShutdown(signal: any, server: Server) {
    if (signal) Logger.info(`\nReceived signal ${signal}`)
    Logger.info('Gracefully closing server')

    if (server.closeAllConnections) server.closeAllConnections()
    else setTimeout(() => { process.exit(1) }, 5000)

    try {
        server.close(function(err) {
            if (err) {
                Logger.error('There was an error', err)
                process.exit(1)
            } else {
                Logger.info('server closed succesfully. Bye!')
                process.exit(1)
            }
        })
    } catch (err) {
        Logger.error('There was an error', err)
        setTimeout(() => { process.exit(1) }, 500)
    }
}

function startServer(server: Server, attempts: number, port: string | number) {

    server.removeAllListeners('error')

    let newPort: number

    if (typeof port === 'string') {
        newPort = parseInt(port) + attempts
        attempts++
    } else {
        newPort = port + attempts
        attempts++
    }

    Logger.info(`Retrying with port: ${newPort}`)

    server.listen(newPort)
    server.on('error', (err) => onError(err, server, attempts, newPort))
}
