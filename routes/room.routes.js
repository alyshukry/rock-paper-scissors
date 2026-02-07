import { addPlayerToRoom, initRoom } from '../services/room.service.js'

export async function createRoom(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        const room = initRoom(data.password)
        const user = addPlayerToRoom(room.id)

        res.writeHead(201, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'room_id': room.id,
            'user_id': user
        }))
    }
    catch (err) {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'status': 400,
            'message': err
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
            'room_id': room,
            'user_id': user
        }))
    }
    catch (err) {
        if (err.message === 'ROOM_NOT_FOUND') {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({
                'status': 400,
                'message': 'Room not found'
            }))

        }
        res.writeHead(400, {
            'Content-Type': 'application/json'
        })
        res.end(JSON.stringify({
            'status': 400,
            'message': err.message
        }))
    }
}