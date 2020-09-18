import React, { createContext, useReducer } from 'react';
import * as api from '../api/rooms';
import { fromEntries } from '../utils/objects';

const initialState = {
    fetching: true,
    room: null,
    updatedAt: 0,
};

export const store = createContext(initialState);

export const GAME_STAGE = {
    DRAWING: 'drawing',
    GUESSING: 'guessing',
    SCORING: 'scoring',
};

const ACTIONS = {
    BEGIN_REFRESH: 'ROOM/BEGIN_REFRESH',
    FAIL_REFRESH: 'ROOM/FAIL_REFRESH',
    END_REFRESH: 'ROOM/END_REFRESH',

    BEGIN_LEAVE: 'ROOM/BEGIN_LEAVE',
    FAIL_LEAVE: 'ROOM/FAIL_LEAVE',
    END_LEAVE: 'ROOM/END_LEAVE',

    BEGIN_START_GAME: 'ROOM/BEGIN_START_GAME',
    FAIL_START_GAME: 'ROOM/FAIL_START_GAME',
    END_START_GAME: 'ROOM/END_START_GAME',

    BEGIN_SET_STATE: 'ROOM/BEGIN_SET_STATE',
    FAIL_SET_STATE: 'ROOM/FAIL_SET_STATE',
    END_SET_STATE: 'ROOM/END_SET_STATE',

    BEGIN_SET_PLAYER_STATE: 'ROOM/BEGIN_SET_PLAYER_STATE',
    FAIL_SET_PLAYER_STATE: 'ROOM/FAIL_SET_PLAYER_STATE',
    END_SET_PLAYER_STATE: 'ROOM/END_SET_PLAYER_STATE',

    BEGIN_CHANGE_TURN: 'ROOM/BEGIN_CHANGE_TURN',
    FAIL_CHANGE_TURN: 'ROOM/FAIL_CHANGE_TURN',
    END_CHANGE_TURN: 'ROOM/END_CHANGE_TURN',
};

const getInitialRoomState = (stage = 'drawing') => ({
    stage: stage,
    turn: 0,
    timestamp: Date.now(),
    timeout: 30000,
    scores: {},
});

export const StateProvider = ( { children } ) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
        case ACTIONS.BEGIN_REFRESH:
            return { ...state, fetching: true };
        case ACTIONS.END_REFRESH:
            return { ...state, room: action.room, fetching: false };
        case ACTIONS.FAIL_REFRESH:
            return { ...state, error: action.error, fetching: false };

        case ACTIONS.BEGIN_LEAVE:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_LEAVE:
            return { ...state, fetching: false, error: null };
        case ACTIONS.FAIL_LEAVE:
            return { ...state, fetching: false, error: action.error };

        case ACTIONS.BEGIN_START_GAME:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_START_GAME:
            return { ...state, fetching: false, error: null };
        case ACTIONS.FAIL_START_GAME:
            return { ...state, fetching: false, error: action.error };

        case ACTIONS.BEGIN_SET_STATE:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_SET_STATE:
            return { ...state, fetching: false, error: null };
        case ACTIONS.FAIL_SET_STATE:
                return { ...state, fetching: false, error: action.error };

        case ACTIONS.BEGIN_SET_PLAYER_STATE:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_SET_PLAYER_STATE:
            return { ...state, fetching: false, error: null };
        case ACTIONS.FAIL_SET_PLAYER_STATE:
            return { ...state, fetching: false, error: action.error };

        case ACTIONS.BEGIN_CHANGE_TURN:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_CHANGE_TURN:
            return { ...state, fetching: false, error: null };
        case ACTIONS.FAIL_CHANGE_TURN:
            return { ...state, fetching: false, error: action.error };

        default:
            throw new Error();
        };
    }, initialState);

    const { Provider } = store;
    return <Provider value={[state, dispatch]}>{children}</Provider>;
};

export async function refreshRoomAsync(dispatch, token, id) {
    dispatch({ type: ACTIONS.BEGIN_REFRESH });
    try {
        const room = await api.getRoomAsync(token, id);
        dispatch({ type: ACTIONS.END_REFRESH, room: room });
        return room;
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_REFRESH, error: e });
        console.error(e);
    }
}

export async function leaveRoomAsync(dispatch, token, id) {
    dispatch({ type: ACTIONS.BEGIN_LEAVE });
    try {
        const room = await api.leaveRoomAsync(token, id);
        dispatch({ type: ACTIONS.END_LEAVE });
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_LEAVE, error: e });
        console.error(e);
    }
}

export async function startGameAsync(dispatch, token, id) {
    dispatch({ type: ACTIONS.BEGIN_START_GAME });
    try {
        await api.freezeRoomAsync(token, id);
        await api.setRoomStateAsync(token, id, getInitialRoomState());
        dispatch({ type: ACTIONS.END_START_GAME });
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_START_GAME, error: e });
        console.error(e);
    }
}

export async function updateRoomStateAsync(dispatch, token, id, state) {
    dispatch({ type: ACTIONS.BEGIN_SET_STATE });
    try {
        await api.setRoomStateAsync(token, id, state);
        dispatch({ type: ACTIONS.END_SET_STATE });
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_SET_STATE, error: e });
        console.error(e);
    }
}

export async function updatePlayerStateAsync(dispatch, token, id, playerID, state) {
    dispatch({ type: ACTIONS.BEGIN_SET_PLAYER_STATE });
    try {
        await api.setPlayerStateAsync(token, id, state);
        dispatch({ type: ACTIONS.END_SET_PLAYER_STATE });
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_SET_PLAYER_STATE, error: e });
        console.error(e);
    }
}

export async function changeTurnPlayerAsync(dispatch, token, id, playerID) {
    dispatch({ type: ACTIONS.BEGIN_CHANGE_TURN });
    try {
        await api.changeTurnPlayerAsync(token, id, playerID);
        dispatch({ type: ACTIONS.END_CHANGE_TURN });
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_CHANGE_TURN, error: e });
        console.error(e);
    }
}

export async function endTurnAsync(dispatch, token, room) {
    const { turn } = room;
    const currentPlayerIndex = room.players.findIndex(p => p.id === room.turnPlayer.id);
    const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
    changeTurnPlayerAsync(dispatch, token, room.id, room.players[nextPlayerIndex].id);
    updateRoomStateAsync(dispatch, token, room.id, {
        stage: GAME_STAGE.DRAWING,
        turn: turn + 1,
        timestamp: Date.now(),
        timeout: 30000,
    });
}

export async function doGameTickAsync(dispatch, token, room, player, remainingSeconds) {
    const { stage, turn } = room;
    if (room.owner.id === player.id) {
        if (stage === GAME_STAGE.DRAWING) {
            // Turn player must have submitted the image
            const turnPlayerState = room.turnPlayer.state;
            if (turnPlayerState && turnPlayerState.image && turnPlayerState.turn === turn) {
                // OK, go to next stage
                updateRoomStateAsync(dispatch, token, room.id, {
                    stage: GAME_STAGE.GUESSING,
                    timestamp: Date.now(),
                    timeout: 15000,
                });
            } else if (remainingSeconds < 0) {
                endTurnAsync(dispatch, token, room);
            }
        } else if (stage === GAME_STAGE.GUESSING) {
            // All other players must have submitted their guesses
            const guesses = room.players
                .filter(p => p.id !== room.turnPlayer.id && p.state.turn === turn && typeof p.state.guess === 'string')
                .map(p => p.state.guess);

            // OK, go to next stage
            if (guesses.length === room.players.length - 1) {
                updateRoomStateAsync(dispatch, token, room.id, {
                    stage: GAME_STAGE.SCORING,
                    timestamp: Date.now(),
                    timeout: Number.MAX_SAFE_INTEGER,
                });
            } else if (remainingSeconds < 0) {
                updateRoomStateAsync(dispatch, token, room.id, {
                    stage: GAME_STAGE.SCORING,
                    timestamp: Date.now(),
                    timeout: Number.MAX_SAFE_INTEGER,
                });
            }
        } else if (stage === GAME_STAGE.SCORING) {
            const additionalScores = room.turnPlayer.state.scores;
            if (additionalScores) {
                const newScores = fromEntries(room.players.map(p => [
                    p.id,
                    (room.state.scores[p.id] || 0) + (additionalScores[p.id] || 0),
                ]));
                updateRoomStateAsync(dispatch, token, room.id, {
                    stage: GAME_STAGE.DRAWING,
                    timestamp: Date.now(),
                    timeout: 30000,
                    scores: newScores,
                });
            }
        } else {
            throw new Error();
        }
    }
}
