import mysql, { ConnectionOptions } from 'mysql2/promise'

import { TDBUser } from '../../config/types/customTypes'
import { ApiError } from '../../config/types/error'

export async function getElginUserById (userId: string) : Promise<TDBUser> {
    return getUserFromElginPortal(userId, 'Id')
}

export async function getElginUserByDoc (userDoc: string) : Promise<TDBUser> {
    return getUserFromElginPortal(userDoc, 'Documento')
}

async function getUserFromElginPortal (userDoc: string | string[], searchWhere: string): Promise<TDBUser> {

    // TODO
    if (host.checkHost(userDoc)) return host.values

    const dbConnectionConfigs: ConnectionOptions = {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    }

    const dbConnection = await mysql.createConnection(dbConnectionConfigs)

    const query = `select Documento,Nome,NomeFantasia,Email,Telefone from UsuarioDeveloper where ${searchWhere}='${userDoc}'`
    const [data] = await dbConnection.execute(query)
    dbConnection.end()

    if (!(Array.isArray(data) && data.length))
        throw new ApiError(404, 'User not found')

    const {
        'Documento': doc,
        'Nome': name,
        'NomeFantasia': businessName,
        'Email': email,
        'Telefone': phoneNumber
    } = JSON.parse(JSON.stringify(data))[0]
    return { doc, name, businessName, email, phoneNumber, roles: ['user'] }
}

const host = {
    checkHost: function (value: string | string[]) {
        if (value === '999.999.999-99') return true
    },
    values: {
        doc: '999.999.999-99',
        name: 'Host',
        businessName: 'Host Broadcaster',
        email: 'host@host.com',
        phoneNumber: '123213213',
        roles: ['host']
    }
}