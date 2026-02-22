import API_URL from './config.js'
import { createRoom, joinRoom, startRound, playMove, leaveRoom } from './services/room.service.js'
import { showSection } from './utils/dom.helper.js'

function clearIDsFromStorage() {
    localStorage.removeItem('room')
    localStorage.removeItem('user')
}

let roomEventSource = null
export function connectToRoom(room, user) {
    roomEventSource = new EventSource(API_URL + `/room/subscribe?room=${room}&user=${user}`)

    roomEventSource.onmessage = (e) => {
        handleServerEvent(JSON.parse(e.data))
        if (e.type === 'subscribed' && e.state === 'waiting')
            showSection('lobby-section')
    }
    roomEventSource.onerror = (err) => {
        console.error('EventSource error:', err)
    }
}

export function disconnectFromRoom() {
    if (roomEventSource) {
        roomEventSource.close()
        roomEventSource = null
        clearIDsFromStorage()
        showSection('rooms-section')
    }
}

function handleServerEvent(msg) {
    console.log(msg)
    switch (msg.type) {
        case 'subscribed':
            if (msg.state === 'waiting')
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
        case 'user_left':
            showSection('lobby-section')
            break
        case 'ownership_granted':
            localStorage.setItem('owner', 'true')
            break
        case 'room_closed':
            showSection('rooms-section')
            clearIDsFromStorage()
            break
    }
}
console.log(API_URL)

async function initApp() {
    const room = localStorage.getItem('room')
    const user = localStorage.getItem('user')

    if (!room || !user) {
        showSection('rooms-section')
        clearIDsFromStorage()
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
    if (!localStorage.getItem('room') && !roomsList.querySelector('form')) {
        const res = await fetch(API_URL + '/rooms')

        if (!res.ok) {
            roomsList.innerHTML = 'Failed to reach server'
            return
        }
        const data = await res.json()

        if (data.length < 1) {
            roomsList.innerHTML = 'No rooms'
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
        startRound(localStorage.getItem('room'), localStorage.getItem('user'))
    })
})

localStorage.setItem('owner', 'false')
let prev = localStorage.getItem('owner')
setInterval(() => {
    const current = localStorage.getItem('owner')
    if (prev !== 'true' && current === 'true') {
        document.querySelectorAll('button.start-round').forEach(button => button.style.display = 'inline-block')
    }
    if (prev === 'true' && current !== 'true') {
        document.querySelectorAll('button.start-round').forEach(button => button.style.display = 'none')
    }
    prev = current
}, 100)

document.querySelectorAll('#game-section button.play-move').forEach((button) => {
    button.addEventListener('click', (e) => {
        if (button.id === 'rock')
            playMove(localStorage.getItem('room'), localStorage.getItem('user'), 'rock')
        else if (button.id === 'paper')
            playMove(localStorage.getItem('room'), localStorage.getItem('user'), 'paper')
        else if (button.id === 'scissors')
            playMove(localStorage.getItem('room'), localStorage.getItem('user'), 'scissors')
    })
})

document.querySelectorAll('button.leave-room').forEach((button) => {
    button.addEventListener('click', (e) => {
        leaveRoom(localStorage.getItem('room'), localStorage.getItem('user'))
        localStorage.setItem('owner', 'false')
    })
})
