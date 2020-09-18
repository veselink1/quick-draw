import React, { createContext, useReducer } from 'react';
import * as api from '../api/auth';

const initialState = {
    fetching: false,
    user: null,
    token: null,
    error: null,
};

export const store = createContext(initialState);

const ACTIONS = {
    BEGIN_LOGIN: 'AUTH/BEGIN_LOGIN',
    END_LOGIN: 'AUTH/END_LOGIN',
    FAIL_LOGIN: 'AUTH/FAIL_LOGIN',
};

export const StateProvider = ( { children } ) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
        case ACTIONS.BEGIN_LOGIN:
            return { ...state, fetching: true, error: null };
        case ACTIONS.END_LOGIN:
            return { ...state, user: action.user, token: action.token, fetching: false, error: null };
        case ACTIONS.FAIL_LOGIN:
            return { ...state, user: null, token: null, fetching: false, error: action.error };
        default:
            throw new Error();
        };
    }, initialState);

    const { Provider } = store;
    return <Provider value={[state, dispatch]}>{children}</Provider>;
};

async function oauth2LoginAsync(dispatch, provider, body) {
    dispatch({ type: ACTIONS.BEGIN_LOGIN });
    try {
        const { user, token } = await api.oauth2LoginAsync(provider, body);
        dispatch({ type: ACTIONS.END_LOGIN, user, token });
        localStorage.setItem('qd-auth', JSON.stringify({ user, token }));
    } catch (e) {
        dispatch({ type: ACTIONS.FAIL_LOGIN, error: e });
        console.error(e);
    }
}

export async function githubOauth2LoginAsync(dispatch, code) {
    return await oauth2LoginAsync(dispatch, 'github', { code });
}

export async function tryReuseSavedTokenAsync(dispatch) {
    const { user, token } = JSON.parse(localStorage.getItem('qd-auth')) || {};
    try {
        if (token) {
            await api.verifyTokenAsync(token);
            dispatch({ type: ACTIONS.BEGIN_LOGIN });
            dispatch({ type: ACTIONS.END_LOGIN, user, token });
            return true;
        }
    } catch (e) {
        // Ignore
    }
    return false;
}
