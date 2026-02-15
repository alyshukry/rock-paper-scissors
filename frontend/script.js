
setInterval(async () => {
    const raw = await fetch('http://localhost:8000/rooms')
    const data = await raw.json()

    const list = document.querySelector('#rooms')
    list.innerHTML = ''

    if (data.length < 1) {
        list.innerHTML = 'No rooms available'
        return
    }

    for (let i = 0; i < data.length; i++) {
        const room = document.createElement('li')
        room.innerHTML = data[i].id
        list.appendChild(room)

        room.onclick = () => {
            fetch('http://localhost:8000/room/join', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ room: data[i].id })
            })
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem('user', data.user)
                    localStorage.setItem('room', data.room)
                })
                .catch(err => console.error(err))
        }
    }
}, 2500)