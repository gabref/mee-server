import cron from 'node-cron'
import init from '../config/initializers'
import { TCron } from '../config/types/customTypes'
import { Logger } from '../helpers/logger'
import { CronsService } from '../services/crons'
import userRoomTimeout from './userRoomTimeout'
import { v4 as uuid } from 'uuid'
import { Server } from 'socket.io'
import handleBroadcasterDisconnect from './handleBroadcasterDisconnect'

type TWorkers = {
    cron?: TCron,
    run(): void
}

async function getWorkers(io: Server): Promise<TWorkers[]> {
    const cronsService = new CronsService()
    return [
        {
            cron: cronsService.getByValue('user-room-timeout'),
            run: () => userRoomTimeout(io)
        },
        {
            cron: cronsService.getByValue('broadcaster-disconnect'),
            run: () => handleBroadcasterDisconnect(io)
        }
    ]
}

async function runWorkers(io: Server) {
    try {
        const workers = await getWorkers(io)

        workers.map(worker => {
            worker.cron ? cron.schedule(worker.cron.cronExpression, worker.run) : null
        })

    } catch (err) {
        Logger.error(`running workers: ${err}`)
    }
}

export function initWorkers(io: Server) {
    const cronsService = new CronsService()
    cronsService.create({ name: 'user-room-timeout', value: {
        id: uuid(),
        cronExpression: '*/15 * * * * *',
        updatedAt: new Date(),
        createdAt: new Date()
    } })
    cronsService.create({ name: 'broadcaster-disconnect', value: {
        id: uuid(),
        cronExpression: '*/1 * * * *',
        updatedAt: new Date(),
        createdAt: new Date()
    }})

    runWorkers(io)
}