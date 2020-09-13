import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import CanvasDraw from "react-canvas-draw";

import { compressSaveData } from '../utils/compression';

export default function DrawingScreen({ room, onCompleted }) {
    const [canvasData, setCanvasData] = useState({});
    const canvas = useRef(null);

    const { timestamp, timeout } = room.state;
    const [time, setTime] = useState(Date.now());

    const [description, setDescription] = useState('');

    const remainingSeconds = Math.round((timestamp + timeout - time) / 1000);

    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => clearInterval(interval);
    });

    function simplify(saveData) {
        const lines = saveData.lines.map(line => {
            const points = line.points.map(pt => [Number(pt.x.toFixed(4)), Number(pt.y.toFixed(4))]);
            return { ...line, points };
        });
        return { ...saveData, lines };
    }

    function onReadyPressed() {
        const compressedData = compressSaveData(canvas.current.getSaveData());
        onCompleted({ description: '', image: compressedData });
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ zIndex: 20 }} className="qd-overlay d-flex flex-column justify-content-start align-items-center">
                <div style={{ width: 128 }} className="h3 bg-orange text-white rounded py-2 text-center qd-text-outline">
                    {remainingSeconds}s
                </div>
                <div className="inline-form">
                    <div className="input-group">
                        <input value={description} onChange={e => setDescription(e.target.value)} type="text" class="form-control" placeholder="Describe your drawing" />
                        <div class="input-group-append">
                            <button class="btn btn-outline-orange" type="button" onClick={onReadyPressed}>Ready</button>
                        </div>
                    </div>
                </div>
            </div>
            <CanvasDraw
                ref={canvas}
                style={{ width: '100%', height: '100%' }}
                lazyRadius={10}
                brushRadius={5}
            />
        </div>
    );
}
