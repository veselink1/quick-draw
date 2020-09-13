import React, { createContext, useReducer } from 'react';
import * as api from '../api/rooms';

const initialState = {
    fetching: true,
    user: { id: '100', name: 'demo' },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMjY0MDgsImlkIjoiMTAwIiwibmFtZSI6ImRlbW8ifQ.BZNHiOHmUOblapAoT3xcdhoCdmBaQRDz3IiUxmS79z0',
};

export const store = createContext(initialState);

const ACTIONS = {

};

export const StateProvider = ( { children } ) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
        default:
            throw new Error();
        };
    }, initialState);

    const { Provider } = store;
    return <Provider value={[state, dispatch]}>{children}</Provider>;
};
