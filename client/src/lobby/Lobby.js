import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../common/Modal';

import {
    StateProvider as LobbyStateProvider,
    store as lobbyStore,
    refreshRoomsAsync,
    createRoomAsync,
    joinRoomAsync,
    leavePreviousRoomAsync,
    clearError,
} from './LobbyContext';

import { store as authStore } from '../auth/AuthContext';

import RoomList from './RoomList';
import RoomListOptions from './RoomListOptions';
import BlockSpinner from '../common/BlockSpinner';
import GithubLogin from '../auth/GithubLogin';

function Lobby(props) {
    if (Object.keys(props).length) {
        throw new TypeError('Lobby does not receive any props');
    }

    const [state, dispatch] = useContext(lobbyStore);
    const [authState] = useContext(authStore);

    useEffect(() => {
        if (authState.token) {
            refreshRoomsAsync(dispatch, authState.token);
            const interval = setInterval(() => refreshRoomsAsync(dispatch, authState.token), 5000);
            return () => clearInterval(interval);
        }
    }, [authState.token]);

    const [selectedID, setSelectedID] = useState(null);
    const onRoomSelected = room => {
        setSelectedID(room && room.id);
    };

    const selectedRoom = state.rooms && state.rooms.find(r => r.id === selectedID) || null;

    const history = useHistory();

    const onCreateRomm = async ({ }) => {
        const room = await createRoomAsync(dispatch, authState.token);
        if (room) {
            history.push(`/room/${room.id}`);
        }
    };

    const onJoinRoom = async ({ room }) => {
        if (authState.user) {
            await joinRoomAsync(dispatch, authState.token, room.id);
            history.push(`/room/${room.id}`);
        } else {
            console.log('Error');
        }
    };

    const onLeavePreviousRoom = async () => {
        leavePreviousRoomAsync(dispatch, authState.token);
    };

    const onRefresh = async () => {
        if (authState.token) {
            refreshRoomsAsync(dispatch, authState.token);
        }
    };

    const onClearError = () => {
        dispatch(clearError());
    };

    const errorModal = state.error && (
        <Modal>
            <div className="modal show d-block qd-backdrop" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Ooops!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {state.error.message}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClearError}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );

    const loginModal = !authState.user && (
        <Modal>
            <div className="modal show d-block qd-backdrop" tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Login to continue</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <GithubLogin />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );

    const spinner = state.fetching ? <BlockSpinner /> : null;

    return (
        <div className="d-flex container flex-fill">
            <div className="row flex-column align-self-center align-items-center flex-fill">
                <div className="card bg-white shadow-lg position-relative col-lg-8 px-3" style={{ minHeight: 640 }}>
                    {spinner}
                    <div className="row p-3 flex-fill">
                        <div className="card bg-light overflow-hidden px-0 col-md-6">
                            <RoomList
                                rooms={state.rooms || []}
                                selectedRoom={selectedRoom}
                                onSelected={onRoomSelected}
                                onRefreshPressed={onRefresh}
                            />
                        </div>
                        <div className="col-md-6 d-flex justify-content-center">
                            <RoomListOptions
                                selectedRoom={selectedRoom}
                                onCreatePressed={onCreateRomm}
                                onJoinPressed={onJoinRoom}
                                onLeavePreviousPressed={onLeavePreviousRoom}
                            />
                        </div>
                    </div>
                </div>
                {authState.user && (
                    <div className="text-center bg-light text-muted p-3">
                        Logged in as <b>{authState.user.id}</b>
                    </div>
                )}
            </div>
            {errorModal}
            {loginModal}
        </div>
    );
}

export default function (props) {
    return (
        <LobbyStateProvider>
            <Lobby />
        </LobbyStateProvider>
    );
}
