import { Namespace } from 'socket.io'

export type TRoom = {
    broadcaster: TBroadcaster,
    room: TRoomInfo,
    user: TUser | null,
}

export type TRoomInfo = {
    roomName: string,
    title: string,
    preview: string,
    ready: boolean,
    available: boolean
}

export type TBroadcaster = Omit<TUser, 'expirationTime' | 'kicked' > & {
    disconnectionTime?: number
}

export type TUser = {
    socketId: string,
    name: string,
    id: string,
    kicked: boolean,
    expirationTime: number
}

export type TDBUser = {
    doc: string,
    name: string,
    businessName: string,
    phoneNumber: string
    email: string,
    roles: string[]
}

export type TJwtPayload = {
    id: string,
}

export type THandler = {
    handle(namespace: Namespace): void
}

export type TCron = {
    id: string,
    cronExpression: string,
    updatedAt: Date,
    createdAt: Date
}