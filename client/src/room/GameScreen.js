import React, { useContext, useEffect, useState } from 'react';

import { store as authStore } from '../auth/AuthContext';
import { GAME_STAGE, store as roomStore, updatePlayerStateAsync, doGameTickAsync, endTurnAsync } from './RoomContext';
import DrawingScreen from './DrawingScreen';
import GuessingScreen from './GuessingScreen';
import ValidationScreen from './ValidationScreen';
import { useTime } from '../utils/time';
import { decompressSaveData } from '../utils/compression';

export default function GameScreen({ room, player }) {
    const [state, dispatch] = useContext(roomStore);
    const [authState] = useContext(authStore);
    const [savedDescription, setSavedDescription] = useState(null);
    const [savedImage, setSavedImage] = useState(null);
    const time = useTime();

    const { stage, turn } = room.state;

    const isCurrentPlayerTurn = room.turnPlayer.id === player.id;
    const { timestamp, timeout } = room.state;
    const remainingSeconds = Math.round((timestamp + timeout - time) / 1000);

    useEffect(checkStageCompleted, [remainingSeconds < 0, room.state]);
    function checkStageCompleted() {
        doGameTickAsync();
    }

    useEffect(() => {
        if (savedImage && savedDescription) {
            updatePlayerStateAsync(dispatch, authState.token, room.id, player.id, { turn, image: savedImage, description: savedDescription });
        }
    }, [stage === GAME_STAGE.SCORING && isCurrentPlayerTurn]);

    function onDrawingCompleted({ image, description }) {
        updatePlayerStateAsync(dispatch, authState.token, room.id, player.id, { turn, image });
        setSavedDescription(description);
        setSavedImage(image);
    }

    function onGuessCompleted({ guess }) {
        updatePlayerStateAsync(dispatch, authState.token, room.id, player.id, { turn, guess });
    }

    function onValidationCompleted(scores) {
        updatePlayerStateAsync(dispatch, authState.token, room.id, player.id, { ...player.state, scores });
    }

    const image = room.turnPlayer.state || room.turnPlayer.image;

    if (stage === GAME_STAGE.DRAWING) {
        if (!isCurrentPlayerTurn) {
            return (
                'Waiting for turn player to submit their drawing...'
            );
        }
        return (
            <DrawingScreen
                room={room}
                isCurrentPlayerTurn={isCurrentPlayerTurn}
                onCompleted={onDrawingCompleted}
                remainingSeconds={remainingSeconds}
            />
        );
    } else if (stage === GAME_STAGE.GUESSING) {
        if (isCurrentPlayerTurn) {
            return (
                'Waiting for everyone to respond...'
            );
        }

        if (!image.image) {
            return (
                'Waiting for player to finish drawing...'
            );
        }

        return (
            <GuessingScreen
                image={decompressSaveData(image.image)}
                remainingSeconds={remainingSeconds}
                onCompleted={onGuessCompleted}
            />
        );
    } else if (stage === GAME_STAGE.SCORING) {
        if (!isCurrentPlayerTurn) {
            return (
                'Waiting for player to mark your response...'
            );
        }

        if (!image.image) {
            return (
                'Fetching image...'
            );
        }

        const playersWithGuesses = state.room.players
            .filter(p => p.id !== room.turnPlayer.id)
            .map(p => ({ id: p.id, guess: p.state.guess }));

        return (
            <ValidationScreen
                image={decompressSaveData(image.image)}
                description={savedDescription}
                guesses={playersWithGuesses}
                onCompleted={onValidationCompleted}
            />
        );
    } else {
        return null;
    }
}
