import { createRoom, joinRoom, startRound, playMove, leaveRoom } from './services/room.service.js'
import { showSection } from './utils/dom.helper.js'

let roomEventSource = null
export function connectToRoom(room, user) {
    roomEventSource = new EventSource(`http://localhost:8000/room/subscribe?room=${room}&user=${user}`)

    roomEventSource.onmessage = (e) => {
        handleServerEvent(JSON.parse(e.data))
    }
    roomEventSource.onerror = (err) => {
        console.error('EventSource error:', err)
        sessionStorage.clear()
        showSection('rooms-section')
    }
}

export function disconnectFromRoom() {
    if (roomEventSource) {
        roomEventSource.close()
        roomEventSource = null
        sessionStorage.clear()
        showSection('rooms-section')
    }
}

function handleServerEvent(msg) {
    console.log(msg)
    switch (msg.type) {
        case 'subscribed':
            if (msg.state === 'waiting')
                showSection('lobby-section')
            else if (msg.state === 'waiting')
                showSection('lobby-section')
            break
        case 'game_started':
            showSection('game-section')
            document.querySelector('p#opponent-status').innerHTML = 'Waiting for opponent\'s move..'
            break
        case 'move_played':
            document.querySelector('p#opponent-status').innerHTML = 'Opponent played their move'
            break
        case 'game_result':
            showSection('result-section')
            if (msg.result === 'win')
                document.querySelector('p#game-result').innerHTML = 'You win!'
            else if (msg.result === 'lose')
                document.querySelector('p#game-result').innerHTML = 'You lose!'
            else if (msg.result === 'draw')
                document.querySelector('p#game-result').innerHTML = 'Draw!'
            break
    }
}

async function initApp() {
    const room = sessionStorage.getItem('room')
    const user = sessionStorage.getItem('user')

    if (!room || !user) {
        showSection('rooms-section')
        sessionStorage.clear()
    }
    else connectToRoom(room, user)
}
initApp()

document.querySelector('form#create-room').addEventListener('submit', (e) => {
    e.preventDefault()  // stop page reload

    const name = e.target.name.value
    const password = e.target.password.value || null

    createRoom(name, password)
})

const roomsList = document.querySelector('ul#rooms')

async function displayRooms() {
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
displayRooms()
setInterval(displayRooms, 2500)

document.querySelectorAll('button.start-round').forEach((button) => {
    button.addEventListener('click', (e) => {
        startRound(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
    })
})

document.querySelectorAll('#game-section button.play-move').forEach((button) => {
    button.addEventListener('click', (e) => {
        if (button.id === 'rock')
            playMove(sessionStorage.getItem('room'), sessionStorage.getItem('user'), 'rock')
        else if (button.id === 'paper')
            playMove(sessionStorage.getItem('room'), sessionStorage.getItem('user'), 'paper')
        else if (button.id === 'scissors')
            playMove(sessionStorage.getItem('room'), sessionStorage.getItem('user'), 'scissors')
    })
})

document.querySelectorAll('button.leave-room').forEach((button) => {
    button.addEventListener('click', (e) => {
        leaveRoom(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
    })
})
