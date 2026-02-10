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
        moves: new Map(),
        created: Date.now(),
        lastActive: Date.now()
    }
    rooms.set(id, room)

    return room
}

// creates player and adds them to the room
export function addPlayerToRoom(room) {
    room = rooms.get(room)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.password && room.password !== password) throw new Error('INVALID_PASSWORD')
    if (room.players.length >= 2) throw new Error('ROOM_FULL')

    const user = crypto.randomUUID()
    room.players.push(user)
    room.lastActive = Date.now()
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
    room.lastActive = Date.now()
    return room
}

export function attemptStart(room, user) {
    room = rooms.get(room)

    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.players.includes(user)) throw new Error('USER_NOT_FOUND')
    if (room.owner !== user) throw new Error('USER_NOT_OWNER')
    if (room.players.length < 2) throw new Error('NOT_ENOUGH_PLAYERS')
    if (room.state === 'playing') throw new Error('GAME_ALREADY_STARTED')

    room.state = 'playing'
    for (const [user, res] of room.subscribers) {
        res.write(`data: ${JSON.stringify({
            'type': 'game_started'
        })}\n\n`)
    }
    room.lastActive = Date.now()
}

export function registerMove(user, room, move) {
    room = rooms.get(room)

    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (!room.players.includes(user)) throw new Error('USER_NOT_FOUND')
    if (room.state !== 'playing') throw new Error('GAME_NOT_STARTED')
    if (room.moves.has(user)) throw new Error('MOVE_ALREADY_PLAYED')
    if (![
        'rock', 'r',
        'paper', 'p',
        'scissors', 's'
    ].includes(move.toLowerCase())) throw new Error('INVALID_MOVE')

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
        room.state = 'waiting'
        room.lastActive = Date.now()
    }
}

export function removePlayerFromRoom(room, user) {
    room = rooms.get(room)
    if (!room) return

    room.subscribers.delete(user)

    if (room.subscribers.size === 0) {
        setTimeout(() => {
            const currentRoom = rooms.get(room)
            if (currentRoom && currentRoom.subscribers.size === 0) {
                rooms.delete(room)
                console.log(`Deleted empty room ${room}`)
            }
        }, 30 * 1000)
    }
}