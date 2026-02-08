import fs from 'fs'
import path from 'path'

const ROOMS_FILE = path.resolve('./rooms.json')

// Load rooms from file if it exists
let initialRooms = {}
try {
    if (fs.existsSync(ROOMS_FILE)) {
        const data = fs.readFileSync(ROOMS_FILE, 'utf-8')
        initialRooms = JSON.parse(data)
    }
} catch (err) {
    console.error('Failed to load rooms:', err)
}

// Convert loaded object to Map
export const rooms = new Map(Object.entries(initialRooms))

// Temporary function to save rooms to file
export function saveRooms() {
    try {
        const obj = Object.fromEntries(rooms)
        fs.writeFileSync(ROOMS_FILE, JSON.stringify(obj, null, 4), 'utf-8')
    } catch (err) {
        console.error('Failed to save rooms:', err)
    }
}
