import pino, { DestinationStream} from 'pino'
import pretty from 'pino-pretty'
import dayjs from 'dayjs'
import path from 'path'
import fs from 'fs'

const logFile = path.join(__dirname, '..', '..', 'logs', 'mee-server.log')
const fileStream = fs.createWriteStream(logFile, { flags: 'a' })

const streams = [
    { stream: process.stdout },
    { stream: pino.destination(logFile) }
]

const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
}

const Logger = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty'
    },
    customLevels: levels,
    useOnlyCustomLevels: true,
    formatters: {
        level: (label) => {
            return { level: label }
        }
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
}, 
pino.destination(logFile) )

export { Logger }
