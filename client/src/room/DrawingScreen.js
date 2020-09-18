import React, { useState, useRef, useEffect } from 'react';
import CanvasDraw from "react-canvas-draw";

import { compressSaveData } from '../utils/compression';

/**
 * Allows the player to draw an image on the canvas and input a description
 * of the image. Shows the remaining time.
 * @param {{
 *      remainingSeconds: number,
 *      onCompleted: (arg: { image: string, description: string }) => void,
 * }} param0
 */
export default function DrawingScreen({ remainingSeconds, onCompleted }) {
    const canvas = useRef(null);
    const [description, setDescription] = useState('');

    function onReadyPressed() {
        const compressedData = compressSaveData(canvas.current.getSaveData());
        onCompleted({ description, image: compressedData });
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ zIndex: 20 }} className="qd-overlay d-flex flex-column justify-content-start align-items-center">
                <div style={{ width: 128 }} className="h3 bg-orange text-white rounded py-2 text-center qd-text-outline">
                    {Math.max(0, remainingSeconds)}s
                </div>
                <div className="inline-form">
                    <div className="input-group">
                        <input value={description} onChange={e => setDescription(e.target.value)} type="text" className="form-control" placeholder="Describe your drawing" />
                        <div className="input-group-append">
                            <button className="btn btn-outline-orange" type="button" onClick={onReadyPressed}>Ready</button>
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
