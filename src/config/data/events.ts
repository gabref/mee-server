const EVENTS = {
    TEST: 'test',
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    DISCONNECT_PEER: 'disconnectPeer',
    NAMESPACE: {
        ADMIN: '/admin',
        CLIENT: '/client'
    },
    ADMIN: {
        CONNECT_ERROR: 'admin:connect_error',
        START: 'admin:start',
        BRADCASTER: 'admin:broadcaster',
        OFFER: 'admin:offer',
        CANDIDATE: 'admin:candidate',
        END: 'admin:end',
        EMIT: {
            WATCHER: 'admin:watcher',
            ANSWER: 'admin:answer',
            CANDIDATE: 'admin:candidate',
        }
    },
    CLIENT: {
        CONNECT_ERROR: 'client:connect_error',
        CONNECTED: 'client:connected',
        WATCHER: 'client:watcher',
        ANSWER: 'client:answer',
        CANDIDATE: 'client:candidate',
        END: 'client:end',
        EMIT: {
            BROADCASTER: 'client:broadcaster',
            OFFER: 'client:offer',
            CANDIDATE: 'client:candidate',
            END_BROADCAST: 'client:end-broadcast'
        }
    }
}

export { EVENTS }
