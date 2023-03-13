import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { ApiError } from '../../../config/types/error'
import { Logger } from '../../../helpers/logger'
import { handleErrors } from '../../../services/errors'
import { findUserByDoc } from '../../../services/user'
import { dateAdd } from '../../../utils/dates'

export async function handleEslLogin( req: Request, res: Response ) {
    try {
        const { doc } = req.body
        
        if (!doc) throw new ApiError(400, 'Missing "doc" in body')
    
        // get user
        const userInfo = await findUserByDoc(doc)
    
        // autenticate user
        const token = sign({ id: userInfo?.id }, process.env.JWT_ESL_PASS ?? 'pass', {
            expiresIn: 60 * 30 // 30 minutes
        })
    
        return res.status(200).json({ token: token })

    } catch(err) { Logger.debug(err); handleErrors(err, res) }
}