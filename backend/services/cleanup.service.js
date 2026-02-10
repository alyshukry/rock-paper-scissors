import { rooms } from '../store/rooms.store.js'

const ROOM_MAX_AGE = 60 * 60 * 1000
const ROOM_INACTIVE_TIME = 10 * 60 * 1000

export function cleanupOldRooms() {
    const now = Date.now()
    const roomsToDelete = []

    for (const [id, room] of rooms) {
        const age = now - room.createdAt
        const inactiveTime = now - room.lastActivityAt

        if (age > ROOM_MAX_AGE || inactiveTime > ROOM_INACTIVE_TIME) roomsToDelete.push(id)
    }

    for (const id of roomsToDelete) {
        const room = rooms.get(id)

        for (const [user, res] of room.subscribers) {
            res.write(`data: ${JSON.stringify({
                'type': 'room_closed',
                'reason': 'inactivity'
            })}\n\n`)
            res.end()
        }

        rooms.delete(id)
        console.log(`Deleted room ${id} due to inactivity/age`)
    }

    return roomsToDelete.length
}

export function startCleanupScheduler() {
    setInterval(() => {
        const deleted = cleanupOldRooms()
        if (deleted > 0) {
            console.log(`Cleanup: Removed ${deleted} old/inactive rooms`)
        }
    }, 5 * 60 * 1000)
}