import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import { ApiError } from '../../config/types/error'
import { CreateUserInput, CreateUserResponse, createUserResponseSchema } from '../../schemas/user'
import { getElginUserByDoc } from '../../services/elgin'
import { handleErrors } from '../../services/errors'
import { createUser, findUserByDoc } from '../../services/user'

export async function handleLogin( req: Request<{}, {}, { doc: string }>, res: Response<CreateUserResponse> ) {
    try {
        const { doc } = req.body
        
        if (!doc) throw new ApiError(400, 'Missing "doc" in body')
    
        // get user
        let user
        user = await findUserByDoc(doc)

        if (!user) {
            const elginUser = await getElginUserByDoc(doc)
            if (!elginUser) throw new ApiError(400, 'User not found')

            user = await createUser(elginUser)
        }

        if (!user) throw new ApiError(400, 'User not found')
    
        // verify password
        // if (user.roles.indexOf('host') !== -1)
    
        // authenticate user
        const token = sign({ id: user.id, roles: user.roles }, process.env.JWT_PASS ?? 'pass', {
            expiresIn: 60 * 60 * 24 // 24 hours
        })

        const userResponse = createUserResponseSchema.parse({ token, user })
    
        return res.status(200).json(userResponse)

    } catch(err) { handleErrors(err, res) }
}