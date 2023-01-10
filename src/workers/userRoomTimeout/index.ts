import { Server } from "socket.io"
import { Logger } from "../../helpers/logger"

export default (io: Server): void => {
    Logger.info('worker sample')  
    // get a list of all the tokens and expiration times from the backend

    // filter the list to only include tokens that have expired
    // const expiredTokens = token.filter(t => t.expirationTime < new Date().getTime())

    // disconnect the sockets associated with the expired tokens
    // expiredTokens.forEach(token => {
    //     const socket = io.sockets.sockets[token.socketId]
    //     if (socket)
    //         socket.disconnect()
    // })

    // delete the expired tokens from the backend
    // expiredTokens.forEach(t => deleteToken(t.token))
}