import { CreateUserInput } from '../../schemas/user'
import prisma from '../prisma'

export async function createUser(userInput: Omit<CreateUserInput, 'id'>) {
    const { password, ...rest } = userInput

    const user = await prisma.user.create({
        data: {
            ...rest
        }
    })

    return user
}

export async function findUserById(id: string) {
    return prisma.user.findUnique({
        where: {
            id
        },
        select: {
            roles: true,
            id: true,
            name: true,
            doc: true
        }
    })
}

export async function findUserByDoc(doc: string) {
    return prisma.user.findUnique({
        where: {
            doc
        }
    })
}

export async function findUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
        }
    })
}