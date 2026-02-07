import http from 'node:http'
import { createRoom, joinRoom, startGame, subscribeToRoom } from './routes/room.routes.js'

const PORT = 8000
const server = http.createServer((req, res) => {
    if (req.url === '/room/create' && req.method === 'POST') 
        createRoom(req, res)
    if (req.url === '/room/join' && req.method === 'PUT') 
        joinRoom(req, res)
    if (req.url === '/room/subscribe' && req.method === 'GET') 
        subscribeToRoom(req, res)
    if (req.url === '/room/start' && req.method === 'POST') 
        startGame(req, res)
})

server.listen(PORT, () => {
    console.log('Server listening on port ' + PORT + '...')
})