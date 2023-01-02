import express, { Application } from 'express'
import cors from 'cors'
import { Logger } from '../../helpers/logger'

export default (app: Application): void => {
    app.use(cors())

    /** Parse the body of the request */
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    /** Log the request */
    app.use((req, res, next) => {
        Logger.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)

        res.on('finish', () => {
            Logger.info(`METHOD: [${req.method}] - URL: [${req.url}] STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`)
        })

        next()
    })

    /** Rules of use */
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATH, DELETE, GET')
            return res.status(200).json({})
        }
        next()
    })
}
