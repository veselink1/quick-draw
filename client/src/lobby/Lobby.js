import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../common/Modal';

import {
    StateProvider as LobbyStateProvider,
    store as lobbyStore,
    refreshRoomsAsync,
    createRoomAsync,
    leavePreviousRoomAsync,
    clearError,
} from './LobbyContext';

import { store as authStore } from '../auth/AuthContext';

import RoomList from './RoomList';
import RoomListOptions from './RoomListOptions';
import BlockSpinner from '../common/BlockSpinner';

function Lobby(props) {
    if (Object.keys(props).length) {
        throw new TypeError('Lobby does not receive any props');
    }

    const [state, dispatch] = useContext(lobbyStore);
    const [authState] = useContext(authStore);

    useEffect(() => {
        refreshRoomsAsync(dispatch);
    }, []);

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
        history.push(`/room/${room.id}`);
    };

    const onLeavePreviousRoom = async () => {
        leavePreviousRoomAsync(dispatch, authState.token);
    };

    const onRefresh = async () => {
        refreshRoomsAsync(dispatch, authState.token);
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

    const spinner = state.fetching ? <BlockSpinner /> : null;

    return (
        <div className="d-flex container flex-fill">
            <div className="row align-self-center justify-content-center flex-fill">
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
            </div>
            {errorModal}
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
