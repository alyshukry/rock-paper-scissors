export async function createRoom(name, password = null) {
    try {
        const res = await fetch('http://localhost:8000/room/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password, name: name })
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Failed to create room')
        }

        sessionStorage.setItem('user', data.user)
        sessionStorage.setItem('room', data.room)

        watchRoom(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
    }
    catch (err) {
        alert(err.message)
    }
}
export async function joinRoom(room, password = null) {
    try {
        const res = await fetch('http://localhost:8000/room/join', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: room, password: password })
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Failed to join room')
        }

        sessionStorage.setItem('user', data.user)
        sessionStorage.setItem('room', data.room)
        watchRoom(room, data.user)

    } catch (err) {
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