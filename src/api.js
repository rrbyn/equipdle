const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;

export async function startGame(type) {
    const response = await fetch(`${API_BASE_URL}/game/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
    });
    if (!response.ok) {
        throw new Error('Failed to start game');
    }
    return response.json();
}

export async function getAllItems() {
    const response = await fetch(`items.json`); 
    if (!response.ok) {
        throw new Error('Failed to get all items');
    }
    return response.json();
}

export async function getExamineText(gameId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/examine`);
    if (!response.ok) {
        throw new Error('Failed to get examine text');
    }
    return response.json();
}

export async function submitGuess(gameId, guessItemId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/guess`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guessItemId }),
    });
    if (!response.ok) {
        throw new Error('Failed to submit guess');
    }
    return response.json();
}

export async function getGameState(gameId) {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}`);
    if (!response.ok) {
        throw new Error('Failed to get game state');
    }
    return response.json();
}

export async function voteOnItem(gameId, vote) {
    const response = await fetch(`${API_BASE_URL}/item/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, vote }),
    });
    if (!response.ok) {
        throw new Error('Failed to vote on item');
    }
    return response.json();
}
