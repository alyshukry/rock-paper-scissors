const room = sessionStorage.getItem('room')
const user = sessionStorage.getItem('user')

if (room && user) { watchRoom(room, user) }

setInterval(async () => {
    if (!sessionStorage.getItem('room')) {
        const raw = await fetch('http://localhost:8000/rooms')
        const data = await raw.json()

        if (data.length < 1) {
            console.log('no rooms')
            return
        }

        console.log('rooms: \n')
        for (let i = 0; i < data.length; i++)
            console.log(data[i].id + '\n')
    }
}, 2500)

function createRoom() {
    fetch('http://localhost:8000/room/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(res => res.json())
        .then(data => {
            sessionStorage.setItem('user', data.user)
            sessionStorage.setItem('room', data.room)

            console.log(
                `created room '${sessionStorage.getItem('room')}' with user id '${sessionStorage.getItem('user')}'`
            )

            watchRoom(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
        })
        .catch(err => console.error(err))
}
window.createRoom = createRoom

function joinRoom(room) {
    fetch('http://localhost:8000/room/join', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room: room })
    })
        .then(res => res.json())
        .then(data => {
            sessionStorage.setItem('user', data.user)
            sessionStorage.setItem('room', data.room)

            console.log(
                `joined room '${sessionStorage.getItem('room')}' with user id '${sessionStorage.getItem('user')}'`
            )

            watchRoom(room, sessionStorage.getItem('user'))
        })
        .catch(err => console.error(err))
}
window.joinRoom = joinRoom

function watchRoom(room, user) {
    const es = new EventSource(
        `http://localhost:8000/room/subscribe?room=${room}&user=${user}`
    )

    es.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        console.log('Event received:', msg)
    }

    es.onerror = (err) => {
        console.error('EventSource error:', err)
    }
}
window.watchRoom = watchRoom

function startGame(room, user) {
    fetch('http://localhost:8000/room/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room: room, user: user })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.error(err))
}
window.startGame = startGame

function playMove(room, user, move) {
    fetch('http://localhost:8000/room/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room: room, user: user, move: move })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.error(err))
}
window.playMove = playMove