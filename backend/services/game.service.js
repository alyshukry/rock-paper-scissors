export function decideWinner(moves) {
    const users = Array.from(moves.keys())
    if (users.length !== 2) throw new Error('INVALID_MOVES_MAP')

    const [user1, user2] = users
    const move1 = moves.get(user1)
    const move2 = moves.get(user2)

    if (move1 === move2) return null // tie

    const wins = { r: 's', p: 'r', s: 'p' }

    return wins[move1] === move2 ? user1 : user2
}
