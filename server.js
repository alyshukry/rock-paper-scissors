import http from 'node:http'
import { createRoom } from './routes/room.routes'

const PORT = 8000
const server = http.createServer((req, res) => {
    if (req.url === '/room/create' && req.method === 'POST') {
        createRoom(req, res)
    }
})

server.listen(PORT, () => {
    console.log('Server listening on port ' + PORT + '...')
})