import { Request, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { TJwtPayload } from '../../config/types/customTypes'
import { ApiError } from '../../config/types/error'
import { getElginUserById } from '../../services/elgin'
import { handleErrors } from '../../services/errors'
import { findUserById } from '../../services/user'

export default async function handleVerify( req: Request, res: Response ) {
    try {
        const { authorization } = req.headers
    
        if (!authorization) throw new ApiError(403, 'Token missing')
    
        const [, token] = authorization.split(' ')
        const { id } = verify(token, process.env.JWT_PASS ?? 'pass') as TJwtPayload

        if (!id) throw new ApiError(400, 'Something went wrong with id')
    
        // check if in databse
        // const userInfo = await getElginUserById(id)
        const user = await findUserById(id)

        return res.status(200).json({ user })

    } catch(err) { handleErrors(err, res) }
}