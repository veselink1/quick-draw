import React, { createContext, useReducer } from 'react';
import * as api from '../api/rooms';

const initialState = {
    fetching: true,
    rooms: [],
    error: null,
};

export const store = createContext(initialState);

const ACTIONS = {
    BEGIN_REFRESH: 'LOBBY/BEGIN_REFRESH',
    END_REFRESH: 'LOBBY/END_REFRESH',
    FAIL_REFRESH: 'LOBBY/END_REFRESH',

    BEGIN_CREATE_ROOM: 'LOBBY/BEGIN_CREATE_ROOM',
    FAIL_CREATE_ROOM: 'LOBBY/FAIL_CREATE_ROOM',
    END_CREATE_ROOM: 'LOBBY/END_CREATE_ROOM',

    BEGIN_LEAVE_PREVIOUS: 'LOBBY/BEGIN_LEAVE_PREVIOUS',
    FAIL_LEAVE_PREVIOUS: 'LOBBY/FAIL_LEAVE_PREVIOUS',
    END_LEAVE_PREVIOUS: 'LOBBY/END_LEAVE_PREVIOUS',

    CLEAR_ERROR: 'LOBBY/CLEAR_ERROR',
};

export const StateProvider = ( { children } ) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch(action.type) {
        case ACTIONS.BEGIN_REFRESH:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_REFRESH:
            return { ...state, rooms: action.rooms, fetching: false, error: null };
        case ACTIONS.FAIL_REFRESH:
            return { ...state, rooms: action.rooms, fetching: false, error: action.error };

        case ACTIONS.BEGIN_CREATE_ROOM:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_CREATE_ROOM:
            return { ...state, rooms: [action.room, ...state.rooms], fetching: false, error: null };
        case ACTIONS.FAIL_CREATE_ROOM:
            return { ...state, fetching: false, error: action.error };

        case ACTIONS.BEGIN_LEAVE_PREVIOUS:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_LEAVE_PREVIOUS:
            return { ...state, fetching: false, error: null };
        case ACTIONS.FAIL_LEAVE_PREVIOUS:
            return { ...state, fetching: false, error: action.error };

        case ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };
        default:
            throw new Error();
        };
    }, initialState);

    const { Provider } = store;
    return <Provider value={[state, dispatch]}>{children}</Provider>;
};

export async function refreshRoomsAsync(dispatch) {
    dispatch({ type: ACTIONS.BEGIN_REFRESH });
    try {
        const rooms = await api.getRoomListAsync();
        dispatch({ type: ACTIONS.END_REFRESH, rooms });
        return rooms;
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_REFRESH, error: { message: e.message } });
        console.error(e);
    }
}

export async function createRoomAsync(dispatch, token) {
    dispatch({ type: ACTIONS.BEGIN_CREATE_ROOM });
    try {
        const room = await api.createRoomAsync(token);
        dispatch({ type: ACTIONS.END_CREATE_ROOM, room });
        return room;
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_CREATE_ROOM, error: { message: `Couldn't create room (Reason: ${e.message})` } });
        console.error(e);
    }
}

export async function leavePreviousRoomAsync(dispatch, token) {
    dispatch({ type: ACTIONS.BEGIN_LEAVE_PREVIOUS });
    try {
        const room = await api.leavePreviousAsync(token);
        dispatch({ type: ACTIONS.END_LEAVE_PREVIOUS });
        await refreshRoomsAsync(dispatch);
        return room;
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_LEAVE_PREVIOUS, error: { message: `Couldn't leave previous room (Reason: ${e.message})` } });
        console.error(e);
    }
}

export function clearError() {
    return { type: ACTIONS.CLEAR_ERROR };
}
