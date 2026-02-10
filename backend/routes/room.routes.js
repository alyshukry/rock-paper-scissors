import { addPlayerToRoom, initRoom, setOwnerOfRoom, addSubscriberToRoom, attemptStart, registerMove, removePlayerFromRoom } from '../services/room.service.js'
import { sendError, sendSuccess } from '../utils/response.helper.js'

export async function createRoom(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        const data = body ? JSON.parse(body) : {}

        if (data.password !== undefined && data.password !== null) {
            if (typeof data.password !== 'string') throw new Error('INVALID_PASSWORD_TYPE')
            if (data.password.length < 4 || data.password.length > 50) throw new Error('INVALID_PASSWORD_LENGTH')
        }
        const room = initRoom(data.password)
        const user = addPlayerToRoom(room.id)
        setOwnerOfRoom(room.id, user)

        sendSuccess(res, {
            'room': room.id,
            'user': user
        }, 201)
    }
    catch (err) {
        sendError(res, err.message)
    }
}

export async function joinRoom(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        if (!data.room || typeof data.room !== 'string') throw new Error('INVALID_ROOM_ID')
        if (data.password !== undefined && data.password !== null && typeof data.password !== 'string') throw new Error('INVALID_PASSWORD_TYPE')

        const user = addPlayerToRoom(data.room)

        sendSuccess(res, {
            'room': data.room,
            'user': user
        }, 200)
    }
    catch (err) {
        sendError(res, err.message)
    }
}

export function subscribeToRoom(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const params = url.searchParams

        if (!params.get('room') || !params.get('user')) throw new Error('MISSING_PARAMS')

        const room = addSubscriberToRoom(params.get('room'), params.get('user'), res)

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        })

        res.write(`data: ${JSON.stringify({ type: 'subscribed' })}\n\n`)

        req.on('close', () => {
            removePlayerFromRoom(params.get('room'), params.get('user'))
        })
    }
    catch (err) {
        sendError(res, err.message)
    }
}

export async function startGame(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        if (!data.room || typeof data.room !== 'string') throw new Error('INVALID_ROOM_ID')
        if (!data.user || typeof data.user !== 'string') throw new Error('INVALID_USER_ID')

        attemptStart(data.room, data.user)

        sendSuccess(res, {
            'room': data.room,
            'message': 'Room started game'
        }, 200)
    }
    catch (err) {
        sendError(res, err.message)
    }
}

export async function playMove(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        if (!data.room || typeof data.room !== 'string') throw new Error('INVALID_ROOM_ID')
        if (!data.room || typeof data.room !== 'string') throw new Error('INVALID_ROOM_ID')
        if (!data.move || typeof data.move !== 'string') throw new Error('INVALID_MOVE_TYPE')

        registerMove(data.user, data.room, data.move)

        sendSuccess(res, {
            'message': 'Move registered successfully'
        })
    }
    catch (err) {
        sendError(res, err.message)
    }
}