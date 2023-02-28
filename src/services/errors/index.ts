import { Response } from 'express'
import { TokenExpiredError } from 'jsonwebtoken'

import { ApiError } from '../../config/types/error'
import { Logger } from '../../helpers/logger'

export function handleErrors(
    err: ApiError | Error | unknown,
    res: Response
) {
    if (err instanceof ApiError) 
        return handleApiError(err, res)
    if (err instanceof Error)
        return handleError(err, res)
    if (err instanceof TokenExpiredError)
        return handleTokenExpiredError(err, res)

    return res.status(500).json({ message: 'Unknown Error' })
}

function handleApiError(err: ApiError, res: Response) {
    const statusCode = err.statusCode ?? 500
    const message = err.statusCode ? err.message : 'Internal Server Error'
    Logger.info( 'handle Errors: ' + message )
    return res.status(statusCode).json({ message })
}

function handleError(err: Error, res: Response) {
    Logger.info( 'handle Errors: ' + err.message )
    if (err.message == 'invalid signature') 
        return handleApiError(new ApiError(401, 'Invalid Token'), res)

    return res.status(500).json({ message: err.message })
}

function handleTokenExpiredError(err: TokenExpiredError, res: Response) {
    const statusCode = 401
    const message = err.message || 'Internal Server Error'
    Logger.info('handle Errors: ' + message )
    return res.status(statusCode).json({ message })
}