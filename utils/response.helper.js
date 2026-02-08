// utils/response.helper.js
import { ERROR_MESSAGES } from './error.map.js'

export function sendError(res, errorCode) {
    const error = ERROR_MESSAGES[errorCode]
    if (error) {
        res.writeHead(error.status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
            status: error.status,
            message: error.message,
            code: errorCode
        }))
    } else {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
            status: 500,
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }))
    }
}

export function sendSuccess(res, data, statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
}