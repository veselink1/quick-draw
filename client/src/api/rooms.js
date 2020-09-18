import { APIError } from '../utils/api';
import { toQueryString } from '../utils/requests';
import { API_ROOT_URL } from '../config/constants';

function createPlayer(data) {
    return {
        id: data.id,
        name: data.name,
        state: data.state,
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

let lastRefresh = {
    id: '',
    refreshedAt: 0,
    room: null,
};

export async function getRoomAsync(token, id) {
    const lastRefreshAt = lastRefresh.id === id
        ? lastRefresh.refreshedAt
        : 0;
    const query = toQueryString({ last_refresh_at: lastRefreshAt });
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}?${query}`, {
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
    });
    if (res.status === 304) {
        return lastRefresh.room;
    } else if (res.status !== 200) {
        throw new APIError('Failed to get room', res);
    }
    const room = createRoom(await res.json());
    lastRefresh = {
        id,
        refreshedAt: (Date.now() / 1000) | 0,
        room,
    };
    return room;
}

export async function leaveRoomAsync(token, id) {
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}`, {
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
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}/freeze`, {
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
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}/state`, {
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

export async function setPlayerStateAsync(token, id, state) {
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}/player`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        body: JSON.stringify({ state }),
    });
    if (res.status !== 200) {
        throw new APIError('Failed to update player state', res);
    }
}

export async function changeTurnPlayerAsync(token, id, playerID) {
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}/turn`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        body: JSON.stringify({ turn_player_id: playerID }),
    });
    if (res.status !== 200) {
        throw new APIError('Failed to set player', res);
    }
}

export async function getRoomListAsync(token) {
    const res = await fetch(`${API_ROOT_URL}/rooms`, {
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
    });
    if (res.status !== 200) {
        throw new APIError('Failed to get room list', res);
    }
    const { items } = await res.json();
    return items.map(createRoom);
}

export async function createRoomAsync(token) {
    const res = await fetch(`${API_ROOT_URL}/rooms`, {
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

export async function joinRoomAsync(token, id, passcode) {
    const res = await fetch(`${API_ROOT_URL}/rooms/${id}`, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            'authorization': 'Bearer ' + token,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            'passcode': passcode,
        }),
    });

    const room = await res.json();
    if (res.status !== 201) {
        throw new APIError(room.message || 'Failed to join room', res);
    }
    return {};
}

export async function leavePreviousAsync(token) {
    const res = await fetch(`${API_ROOT_URL}/rooms`, {
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
