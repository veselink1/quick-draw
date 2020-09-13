import React, { createContext, useReducer } from 'react';
import * as api from '../api/rooms';

const initialState = {
    fetching: true,
};

export const store = createContext(initialState);

export const GAME_STAGE = {
    DRAWING: 'drawing',
    GUESSING: 'guessing',
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
};

const getInitialRoomState = (stage = 'drawing') => ({
    stage: stage,
    turn: 0,
    timestamp: Date.now(),
    timeout: 30000,
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
        const room = await api.getRoomAsync(id);
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
        const newState = Object.assign(getInitialRoomState(state.stage), state);
        await api.setRoomStateAsync(token, id, newState);
        dispatch({ type: ACTIONS.END_SET_STATE });
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_SET_STATE, error: e });
        console.error(e);
    }
}
