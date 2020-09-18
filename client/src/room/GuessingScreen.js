import React, { useRef, useState, useEffect } from 'react';
import CanvasDraw from "react-canvas-draw";

/**
 * Displays the image in a canvas and allows the player to input their guess.
 * Also shows the remaining time.
 * @param {{
 *      image: string,
 *      remainingSeconds: number,
 *      onCompleted: (arg: { guess: string }) => void,
 * }} param0
 */
export default function DrawingScreen({ image, remainingSeconds, onCompleted }) {
    const canvas = useRef(null);
    const [guess, setGuess] = useState('');

    function onReadyPressed() {
        onCompleted({ guess });
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ zIndex: 20 }} className="qd-overlay d-flex flex-column justify-content-start align-items-center">
                <div style={{ width: 128 }} className="h3 bg-orange text-white rounded py-2 text-center qd-text-outline">
                    {Math.max(0, remainingSeconds)}s
                </div>
                <div className="inline-form">
                    <div className="input-group">
                        <input value={guess} onChange={e => setGuess(e.target.value)} type="text" className="form-control" placeholder="What do you see?" />
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
                saveData={image}
                disabled={true}
            />
        </div>
    );
}
