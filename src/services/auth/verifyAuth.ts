import { verify } from 'jsonwebtoken'

import { ApiError } from '../../config/types/error'
import { findUserById } from '../user'

async function ensureAuth(authorization: string) {
    if (!authorization) throw new ApiError(403, 'Token missing')

    const [, token] = authorization.split(' ')

    const verifyReturn = verify(token, process.env.JWT_ESL_PASS ?? '') as unknown //as { id: string, exp: string }
    const { id, exp } = verifyReturn as { id: string, exp: number }
    
    if (!id) throw new ApiError(400, 'Something went wrong with id')
    
    // check if in databse
    const userInfo = await findUserById(id)

    
    if (!userInfo) throw new ApiError(401, 'No user found')
    
    return { success: true, exp }
}

export { ensureAuth }