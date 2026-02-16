import http from 'node:http'
import { createRoom, joinRoom, startGame, subscribeToRoom, playMove, getRooms } from './routes/room.routes.js'
import { rooms } from './store/rooms.store.js'
import { startCleanupScheduler } from './services/cleanup.service.js'

const PORT = 8000
const server = http.createServer(async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }
    
    if (req.url.startsWith('/rooms') && req.method === 'GET')
        getRooms(res)
    else if (req.url.startsWith('/room/create') && req.method === 'POST')
        await createRoom(req, res)
    else if (req.url.startsWith('/room/join') && req.method === 'PUT')
        await joinRoom(req, res)
    else if (req.url.startsWith('/room/subscribe') && req.method === 'GET')
        subscribeToRoom(req, res)
    else if (req.url.startsWith('/room/start') && req.method === 'POST')
        await startGame(req, res)
    else if (req.url.startsWith('/room/play') && req.method === 'POST')
        await playMove(req, res)
})

server.listen(PORT, () => {
    console.log('Server listening on port ' + PORT + '...')
    startCleanupScheduler()
})