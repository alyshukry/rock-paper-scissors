import { addPlayerToRoom, initRoom, setOwnerOfRoom } from '../services/room.service.js'

export async function createRoom(req, res) {
    let body = ''
    for await (const chunk of req) body += chunk

    try {
        if (!body) throw new Error('Empty body')
        const data = JSON.parse(body)

        const room = initRoom(data.password)
        const user = addPlayerToRoom(room.id)
        setOwnerOfRoom(room.id, user)

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
            'room_id': data.room,
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