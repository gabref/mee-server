import { Namespace } from 'socket.io'

export type TRoom = {
    broadcaster: TUser,
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

export type TUser = {
    socketId: string,
    name: string
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