import { Request, Response } from 'express'
import { ApiError } from '../../../config/types/error'
import { ensureAuth } from '../../../services/auth/verifyAuth'
import { handleErrors } from '../../../services/errors'

export async function handleHomologVerification(req: Request, res: Response) {
    if (req.method !== 'GET') res.status(405).json({ message: 'Accepts only GET method'})

    try {
        const { success: isAuth, exp } = await ensureAuth(req.headers.authorization!)
        if (!isAuth) throw new ApiError(403, 'Not Authenticated')

        const expDate = new Date(exp * 1000).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
        const brDate = new Date(expDate)

        res.status(200).json({
            clientId: process.env.HANSHOW_CLIENT_ID!,
            clientSecret: process.env.HANSHOW_CLIENT_SECRET!,
            user: process.env.HANSHOW_USER!,
            password: process.env.HANSHOW_PASS!,
            site: process.env.HANSHOW_SITE!,
            store: process.env.HANSHOW_STORE!,
            storeCode: process.env.HANSHOW_STORE_CODE!,
            expInSeconds: exp, 
            expInMilliseconds: exp * 1000,
            expDate: brDate.toString(),
            expIsoDate: brDate.toISOString(),
            expLocaleDate: brDate.toLocaleTimeString(),
            expLocaleTime: brDate.toLocaleTimeString(),
            expDay: brDate.getDate(),
            expMonth: brDate.getMonth(),
            expYear: brDate.getFullYear(),
            expHour: brDate.getHours(),
            expMinutes: brDate.getMinutes(),
            expSeconds: brDate.getSeconds(),
        })

    } catch(err) { console.log(err); handleErrors(err, res) }
}