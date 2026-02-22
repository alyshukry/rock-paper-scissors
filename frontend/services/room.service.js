import API_URL from '../config.js'
import { connectToRoom, disconnectFromRoom } from '../main.js'

export async function createRoom(name, password = null) {
    try {
        const res = await fetch(API_URL + '/room/create', {
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

        connectToRoom(sessionStorage.getItem('room'), sessionStorage.getItem('user'))
    }
    catch (err) {
        alert(err.message)
    }
}
export async function joinRoom(room, password = null) {
    try {
        const res = await fetch(API_URL + '/room/join', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: room, password: password })
        })

        const data = await res.json()
        if (!res.ok)
            throw new Error(data.message || 'Failed to join room')


        sessionStorage.setItem('user', data.user)
        sessionStorage.setItem('room', data.room)
        connectToRoom(room, data.user)

    } catch (err) {
        alert(err.message)
    }
}

export async function startRound(room, user) {
    try {
        const res = await fetch(API_URL + '/room/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room: room, user: user })
        })

        const data = await res.json()
        if (!res.ok)
            throw new Error(data.message || 'Failed to start round')
    }
    catch (err) {
        alert(err.message)
    }
}

export async function playMove(room, user, move) {
    try {
        const res = await fetch(API_URL + '/room/play', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room: room, user: user, move: move })
        })

        const data = await res.json()
        if (!res.ok)
            throw new Error(data.message || 'Failed to play move')
    }
    catch (err) {
        alert(err.message)
    }
}

export async function leaveRoom(room, user) {
    try {
        const res = await fetch(API_URL + '/room/leave', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room: room, user: user })
        })

        const data = await res.json()
        if (!res.ok)
            throw new Error(data.message || 'Failed to leave room')

        disconnectFromRoom()
    }
    catch (err) {
        alert(err.message)
    }
}