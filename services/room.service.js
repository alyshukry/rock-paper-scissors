import crypto from 'node:crypto'
import { rooms } from '../store/rooms.store.js'

export function initRoom(password = null) {
    const id = crypto.randomUUID()
    const room = {
        id: id,
        password: password,
        players: [],
        state: 'waiting',
        moves: {}
    }
    rooms.set(id, room)

    return room
}

// creates player and adds them to the room
export function addPlayerToRoom(id) {
    const room = rooms.get(id)
    if (!room) 
        throw new Error('ROOM_NOT_FOUND')
    const user = crypto.randomUUID()
    room.players.push(user)
    return user
}