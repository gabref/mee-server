import { Application } from 'express'
import { router } from '../../routes'

export default (app: Application): void => {
    app.use(router)

    /** Error handling */
    app.use((_, res) => {
        const error = new Error('Not found')

        res.status(404).json({
            message: error.message
        })
    })
}
