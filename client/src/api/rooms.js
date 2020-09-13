const ROOT_URL = 'http://localhost:8080/v1';

class APIError extends Error {
    constructor(message, response) {
        super(message);
        this.response = response;
        this.status = response.status;
    }
}

function createPlayer(data) {
    return {
        id: data.id,
        name: data.name,
    };
}

function createRoom(data) {
    const players = data.players.map(createPlayer);
    return {
        id: data.id,
        owner: players.find(p => p.id === data.owner_id),
        turnPlayer: players.find(p => p.id === data.turn_player_id),
        players,
        createdAt: data.created_at,
        frozen: data.frozen || false,
        state: data.state || null,
        updatedAt: data.updated_at || data.createdAt,
    };
}

export async function getRoomAsync(id) {
    const res = await fetch(`${ROOT_URL}/rooms/${id}`);
    if (res.status !== 200) {
        throw new APIError('Failed to get room', res);
    }
    const room = await res.json();
    return createRoom(room);
}

export async function leaveRoomAsync(token, id) {
    const res = await fetch(`${ROOT_URL}/rooms/${id}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
        },
    });
    if (res.status !== 200) {
        throw new APIError('Failed to delete room', res);
    }
}

export async function freezeRoomAsync(token, id) {
    const res = await fetch(`${ROOT_URL}/rooms/${id}/freeze`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
        },
    });
    if (res.status !== 200) {
        throw new APIError('Failed to delete room', res);
    }
}

export async function setRoomStateAsync(token, id, state) {
    const res = await fetch(`${ROOT_URL}/rooms/${id}/state`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        body: JSON.stringify({ state }),
    });
    if (res.status !== 200) {
        throw new APIError('Failed to update room state', res);
    }
}

export async function getRoomListAsync(token) {
    const res = await fetch(`${ROOT_URL}/rooms`);
    if (res.status !== 200) {
        throw new APIError('Failed to get room list', res);
    }
    const { items } = await res.json();
    return items.map(createRoom);
}

export async function createRoomAsync(token) {
    const res = await fetch(`${ROOT_URL}/rooms`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            'passcode': '',
        }),
    });

    const room = await res.json();
    if (res.status !== 201) {
        throw new APIError(room.message || 'Failed to create room', res);
    }
    return createRoom(room);
}

export async function leavePreviousAsync(token) {
    const res = await fetch(`${ROOT_URL}/rooms`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
        }
    });

    const data = await res.json();
    if (res.status !== 200) {
        throw new APIError(data.message || 'Failed to leave room', res);
    }
}
