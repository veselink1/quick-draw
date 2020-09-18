import React, { useContext, useEffect, useState } from 'react';
import Modal from '../common/Modal';

import {
    StateProvider as RoomStateProvider,
    store as roomStore,
    refreshRoomAsync,
    leaveRoomAsync,
    startGameAsync,
} from './RoomContext';

import {
    store as authStore,
} from '../auth/AuthContext';

import PlayerList from './PlayerList';
import BlockSpinner from '../common/BlockSpinner';
import GameScreen from './GameScreen';
import { useHistory } from 'react-router-dom';

function Room({ match, ...rest }) {
    const [state, dispatch] = useContext(roomStore);
    const [authState] = useContext(authStore);

    const { id } = match.params;
    const history = useHistory();

    useEffect(() => {
        if (!authState.token) {
            history.push('/');
            return;
        }
        refreshRoomAsync(dispatch, authState.token, id);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!state.fetching) {
                refreshRoomAsync(dispatch, authState.token, id);
            }
        }, 1000);
        return () => clearInterval(interval);
    });

    const onLeaveRoom = async () => {
        await leaveRoomAsync(dispatch, authState.token, id);
        history.push('/');
    };

    const spinner = !state.room ? <BlockSpinner /> : null;

    if (state.error && state.error.response && state.error.status === 404) {
        alert('Couldn\'t find room ' + id + '!');
        history.push('/');
    }

    let modal = null;

    if (state.room && !state.room.frozen) {
        // We are waiting for players to join
        if (state.room.owner.id === authState.user.id) {
            const onStart = async () => {
                await startGameAsync(dispatch, authState.token, id);
            };
            // We are the room host
            modal = (
                <StartGameModal
                    players={state.room.players}
                    onStartPressed={onStart}
                />
            );
        }
    }

    const isGameStarted = state.room && state.room.turnPlayer;
    const player = isGameStarted && state.room.players.find(p => p.id === authState.user.id);

    return (
        <div className="d-flex container flex-fill">
            <div className="card bg-white shadow-lg position-relative w-100 px-3 my-3 my-md-5">
                {modal}
                <div className="row p-3 flex-fill">
                    <div className="card bg-light overflow-hidden px-0 col-md-4 col-lg-2">
                        <div>
                            {spinner}
                            <button style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} className="btn btn-outline-danger btn-block" type="button" onClick={onLeaveRoom}>
                                Leave Room
                            </button>
                            {state.room && (
                                <PlayerList
                                    players={state.room.players}
                                    turnPlayer={state.room.turnPlayer}
                                    scores={state.room.state.scores}
                                />
                            )}
                        </div>
                    </div>
                    <div className="col-md-8 col-lg-10 d-flex justify-content-center">
                        {isGameStarted && (
                            <GameScreen player={player} room={state.room} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function (props) {
    return (
        <RoomStateProvider>
            <Room {...props} />
        </RoomStateProvider>
    );
}

function StartGameModal({ players, onStartPressed }) {
    return (
        <div className="modal show d-block qd-backdrop" tabIndex="-1" role="dialog" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLongTitle">Waiting for players to join...</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        Press [Start] when ready!
                        <div className="py-3">
                            <PlayerList
                                players={players}
                                turnPlayer={null}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={onStartPressed} disabled={players.length < 2}>
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
