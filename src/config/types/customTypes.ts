import { Namespace } from 'socket.io'

export type TRoom = {
    broadcaster: string,
    room: string,
    user: string,
}

export type TUser = {
    id: string,
    name: string
}

export type TMessage = {
    id: string,
    user: TUser,
    value: string,
    time: number
}

export type THandler = {
    handle(namespace: Namespace): void
}
