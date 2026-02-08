import fs from 'fs'
import path from 'path'

const ROOMS_FILE = path.resolve('./rooms.json')

// Load rooms from file if it exists
let initialRooms = {}
try {
    if (fs.existsSync(ROOMS_FILE)) {
        const data = fs.readFileSync(ROOMS_FILE, 'utf-8')
        const parsed = JSON.parse(data)
        
        // Convert subscribers and moves back to Maps for each room
        for (const roomId in parsed) {
            parsed[roomId].subscribers = new Map()
            parsed[roomId].moves = new Map()
        }
        
        initialRooms = parsed
    }
} catch (err) {
    console.error('Failed to load rooms:', err)
}

// Convert loaded object to Map
export const rooms = new Map(Object.entries(initialRooms))

// Temporary function to save rooms to file
export function saveRooms() {
    try {
        const obj = {}
        for (const [id, room] of rooms) {
            obj[id] = {
                ...room,
                subscribers: {}, // Don't persist subscribers (they're active connections)
                moves: Object.fromEntries(room.moves) // Convert Map to object
            }
        }
        fs.writeFileSync(ROOMS_FILE, JSON.stringify(obj, null, 4), 'utf-8')
    } catch (err) {
        console.error('Failed to save rooms:', err)
    }
}