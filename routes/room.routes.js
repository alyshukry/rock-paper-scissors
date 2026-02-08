import { addPlayerToRoom, initRoom, setOwnerOfRoom, addSubscriberToRoom, attemptStart, registerMove } from '../services/room.service.js'

export async function createRoom(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        const data = body ? JSON.parse(body) : {}

        const room = initRoom(data.password)
        const user = addPlayerToRoom(room.id)
        setOwnerOfRoom(room.id, user)

        res.writeHead(201, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'room': room.id,
            'user': user
        }))
    }
    catch (err) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'status': 400,
            'message': err.message
        }))
    }
}

export async function joinRoom(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        const user = addPlayerToRoom(data.room)

        res.writeHead(200, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'room': data.room,
            'user': user
        }))
    }
    catch (err) {
        if (err.message === 'ROOM_NOT_FOUND') {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 404,
                'message': 'Room not found'
            }))
        }
        else {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 400,
                'message': err.message
            }))
        }
    }
}

export function subscribeToRoom(req, res) {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const params = url.searchParams

        if (!params.get('room') || !params.get('user'))
            throw new Error('MISSING_PARAMS')

        const room = addSubscriberToRoom(params.get('room'), params.get('user'), res)

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        })

        res.write(`data: ${JSON.stringify({ type: 'subscribed' })}\n\n`)

        req.on('close', () => {
            room.subscribers.delete(params.get('user'))
        })
    }
    catch (err) {
        if (err.message === 'ROOM_NOT_FOUND') {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 404,
                'message': 'Room not found'
            }))
        }
        else if (err.message === 'USER_NOT_FOUND') {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 404,
                'message': 'User not found'
            }))
        }
        else if (err.message === 'MISSING_PARAMS') {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 400,
                'message': 'Missing parameters'
            }))
        }
        else {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 400,
                'message': err.message
            }))
        }
    }
}

export async function startGame(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        attemptStart(data.room, data.user)

        res.writeHead(200, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'room': data.room,
            'message': 'Room started game'
        }))
    }
    catch (err) {
        if (err.message === 'ROOM_NOT_FOUND') {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 404,
                'message': 'Room not found'
            }))
        }
        else if (err.message === 'USER_NOT_FOUND') {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 404,
                'message': 'User not found'
            }))
        }
        else if (err.message === 'USER_NOT_OWNER') {
            res.writeHead(403, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 403,
                'message': 'User doesn\'t own room'
            }))
        }
        else {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 400,
                'message': err.message
            }))
        }
    }
}

export async function playMove(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        registerMove(data.user, data.room, data.move)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
    }
    catch (err) {

    }
}