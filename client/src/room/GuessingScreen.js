import React, { useState, useRef } from 'react';
import moment from 'moment';
import CanvasDraw from "react-canvas-draw";

import { decompressSaveData } from '../utils/compression';

export default function DrawingScreen({ room, isCurrentPlayerTurn }) {
    const canvas = useRef(null);

    if (false && isCurrentPlayerTurn) {
        return (
            'Waiting for everyone to respond...'
        );
    }

    if (!room.state.image) {
        return (
            'Waiting for player to finish drawing...'
        );
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <CanvasDraw
                ref={canvas}
                style={{ width: '100%', height: '100%' }}
                lazyRadius={10}
                brushRadius={5}
                saveData={decompressSaveData(room.state.image)}
                disabled={true}
            />
        </div>
    );
}
