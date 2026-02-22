const API_URL = window.location.hostname === 'localhost' || '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://rock-paper-scissors-kgfh.onrender.com'

export default API_URL