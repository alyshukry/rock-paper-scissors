const room = sessionStorage.getItem('room')
const user = sessionStorage.getItem('user')

if (room && user) { watchRoom(room, user) }

document.querySelector('form#create-room').addEventListener('submit', (e) => {
    e.preventDefault()  // stop page reload

    const name = e.target.name.value
    const password = e.target.password.value || null

    createRoom(name, password)
})

const roomsList = document.querySelector('ul#rooms')

async function getRooms() {
    if (!sessionStorage.getItem('room') && !roomsList.querySelector('form')) {
        const raw = await fetch('http://localhost:8000/rooms')
        const data = await raw.json()

        if (data.length < 1) {
            roomsList.innerHTML = 'no rooms'
            return
        }

        roomsList.innerHTML = ''
        for (let i = 0; i < data.length; i++) {
            const roomElement = document.createElement('li')

            roomElement.className = 'room'
            roomElement.innerHTML = data[i].name
            roomElement.onclick = () => {
                if (data[i].hasPassword) {
                    const form = document.createElement('form')
                    form.innerHTML = `
                    <label for="password">Password:</label>
                    <input type="text" id="password" name="password">
                    <input type="submit" value="Join room">
                    `
                    form.addEventListener('submit', (e) => {
                        e.preventDefault()  // stop page reload
                        const password = e.target.password.value || null
                        joinRoom(data[i].id, password)
                    })

                    roomElement.appendChild(form)
                    roomElement.onclick = () => { }
                }
                else joinRoom(data[i].id)
            }

            roomsList.appendChild(roomElement)
        }
    }
}
getRooms()
setInterval(getRooms, 2500)

function createRoom(name, password = null) {
    fetch('http://localhost:8000/room/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password, name: name })
    })
        .then(res => res.json())
        .then(data => {
            sessionStorage.setItem('user', data.user)
            sessionStorage.setItem('room', data.room)

            watchRoom(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
        })
        .catch(err => console.error(err))
}
window.createRoom = createRoom

async function joinRoom(room, password = null) {
    try {
        const res = await fetch('http://localhost:8000/room/join', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: room, password: password })
        })

        const data = await res.json()

        if (!res.ok) {
            alert(data.message || 'Failed to join room')
            return
        }

        sessionStorage.setItem('user', data.user)
        sessionStorage.setItem('room', data.room)
        watchRoom(room, data.user)

    } catch (err) {
        console.error(err)
        alert(err.message)
    }
}

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