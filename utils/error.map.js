export const ERROR_MESSAGES = {
    // room errors
    'ROOM_NOT_FOUND': { status: 404, message: 'Room not found' },
    'ROOM_FULL': { status: 400, message: 'Room is full' },
    'INVALID_ROOM_ID': { status: 400, message: 'Room ID is required and must be a string' },
    'INVALID_ROOM_FORMAT': { status: 400, message: 'Invalid room ID format' },
    
    // user errors
    'USER_NOT_FOUND': { status: 404, message: 'User not found' },
    'USER_NOT_OWNER': { status: 403, message: 'User doesn\'t own room' },
    'INVALID_USER_ID': { status: 400, message: 'User ID is required and must be a string' },
    'INVALID_USER_FORMAT': { status: 400, message: 'Invalid user ID format' },
    
    // password errors
    'INVALID_PASSWORD': { status: 401, message: 'Invalid password' },
    'INVALID_PASSWORD_TYPE': { status: 400, message: 'Password must be a string' },
    'INVALID_PASSWORD_LENGTH': { status: 400, message: 'Password must be between 4 and 50 characters' },
    
    // game errors
    'GAME_NOT_STARTED': { status: 400, message: 'Game has not started' },
    'GAME_ALREADY_STARTED': { status: 400, message: 'Game already started' },
    'NOT_ENOUGH_PLAYERS': { status: 400, message: 'Need 2 players to start' },
    'INVALID_MOVE': { status: 400, message: 'Invalid move. Use rock, paper, or scissors' },
    'INVALID_MOVE_TYPE': { status: 400, message: 'Move is required and must be a string' },
    'MOVE_ALREADY_PLAYED': { status: 400, message: 'Move already played' },
    
    // request errors
    'MISSING_PARAMS': { status: 400, message: 'Missing required parameters' },
    'EMPTY_BODY': { status: 400, message: 'Request body is required' }
}