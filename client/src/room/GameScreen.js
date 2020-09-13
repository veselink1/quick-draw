import React, { useContext } from 'react';

import { store as authStore } from '../auth/AuthContext';
import { GAME_STAGE, store as roomStore, updateRoomStateAsync } from './RoomContext';
import DrawingScreen from './DrawingScreen';
import GuessingScreen from './GuessingScreen';

export default function GameScreen({ room, isCurrentPlayerTurn }) {
    const { stage, turn } = room.state;

    const [state, dispatch] = useContext(roomStore);
    const [authState] = useContext(authStore);

    function onDrawingCompleted({ image, description }) {
        updateRoomStateAsync(dispatch, authState.token, room.id, { stage: GAME_STAGE.GUESSING, image, description, });
    }

    if (stage === GAME_STAGE.DRAWING) {
        return (
            <DrawingScreen
                room={room}
                onCompleted={onDrawingCompleted}
                isCurrentPlayerTurn={isCurrentPlayerTurn}
            />
        );
    } else if (stage === GAME_STAGE.GUESSING) {
        return (
            <GuessingScreen
                room={room}
                isCurrentPlayerTurn={isCurrentPlayerTurn}
            />
        );
    } else {
        return null;
    }
}
