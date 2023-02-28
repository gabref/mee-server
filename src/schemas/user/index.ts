import { z } from 'zod'

const userCore = {
    id: z.string(),
    email: z.string({
        invalid_type_error: 'Password must be a string'
    }).email(),
    doc: z.string({
        required_error: 'Documento necessário'
    }),
    name: z.string(),
    businessName: z.string(),
    phoneNumber: z.string(),
    roles: z.array(z.string()).optional()
}


const createUserSchema = z.object({
    ...userCore,
    password: z.string({
        invalid_type_error: 'Password must be a string'
    }).optional(),
    passwordConfirmation: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Senhas não são iguais',
    path: ['passwordConfirmation']
})

export const createUserResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        doc: z.string(),
        name: z.string(),
        roles: z.array(z.string()),
    }),
    token: z.string()
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>