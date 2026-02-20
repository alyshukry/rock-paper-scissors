import { createRoom, joinRoom, startRound, watchRoom, playMove, leaveRoom } from './services/room.service.js'

if (sessionStorage.getItem('dont-remember')) {
    sessionStorage.removeItem('room')
    sessionStorage.removeItem('user')
}

let room = sessionStorage.getItem('room')
let user = sessionStorage.getItem('user')
if (room && user) { watchRoom(room, user) }

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

document.querySelector('#lobby-section button#start-round').addEventListener('click', (e) => {
    startRound(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
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
