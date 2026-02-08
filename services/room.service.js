import crypto from 'node:crypto'
import { rooms } from '../store/rooms.store.js'
import { decideWinner } from './game.service.js'

export function initRoom(password = null) {
    const id = crypto.randomUUID()
    const room = {
        id: id,
        password: password,
        owner: '',
        players: [],
        subscribers: new Map(),
        state: 'waiting',
        moves: new Map()
    }
    rooms.set(id, room)

    return room
}

// creates player and adds them to the room
export function addPlayerToRoom(room) {
    room = rooms.get(room)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    const user = crypto.randomUUID()
    room.players.push(user)
    return user
}

export function setOwnerOfRoom(room, user) {
    room = rooms.get(room)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.players.includes(user)) throw new Error('USER_NOT_FOUND')

    room.owner = user
}

export function addSubscriberToRoom(room, user, res) {
    room = rooms.get(room)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.players.includes(user)) throw new Error('USER_NOT_FOUND')

    room.subscribers.set(user, res)
    return room
}

export function attemptStart(room, user) {
    room = rooms.get(room)

    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.players.includes(user)) throw new Error('USER_NOT_FOUND')
    if (room.owner !== user) throw new Error('USER_NOT_OWNER')

    room.state = 'playing'
    for (const [user, res] of room.subscribers) {
        res.write(`data: ${JSON.stringify({
            'type': 'game_started'
        })}\n\n`)
    }

}

export function registerMove(user, room, move) {
    room = rooms.get(room)

    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.players.includes(user)) throw new Error('USER_NOT_FOUND')

    room.moves.set(user, move[0].toLowerCase())
    for (const [u, res] of room.subscribers) {
        if (u !== user)
            res.write(`data: ${JSON.stringify({
                'type': 'move_played'
            })}\n\n`)
    }

    // check if both players played
    if (room.moves.size === 2) {
        const winner = decideWinner(room.moves)
        for (const [u, res] of room.subscribers) {
            res.write(`data: ${JSON.stringify({
                'type': 'game_result',
                'result': winner ? u === winner ? 'win' : 'lose' : 'draw'
            })}\n\n`)
        }

        room.moves.clear()
    }
}