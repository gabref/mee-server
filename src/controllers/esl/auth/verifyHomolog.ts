import { Request, Response } from 'express'
import { ApiError } from '../../../config/types/error'
import { ensureAuth } from '../../../services/auth/verifyAuth'
import { handleErrors } from '../../../services/errors'

export async function handleHomologVerification(req: Request, res: Response) {
    if (req.method !== 'GET') res.status(405).json({ message: 'Accepts only GET method'})

    try {
        const { success: isAuth, exp } = await ensureAuth(req.headers.authorization!)
        if (!isAuth) throw new ApiError(403, 'Not Authenticated')

        const expDate = new Date(new Date(exp * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))

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
            expDate: expDate.toString(),
            expIsoDate: expDate.toISOString(),
            expLocaleDate: expDate.toLocaleTimeString(),
            expLocaleTime: expDate.toLocaleTimeString(),
            expDay: expDate.getDate(),
            expMonth: expDate.getDate(),
            expYear: expDate.getFullYear(),
            expHour: expDate.getHours(),
            expMinutes: expDate.getMinutes(),
            expSeconds: expDate.getSeconds(),
        })

    } catch(err) { handleErrors(err, res) }
}