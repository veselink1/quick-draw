import React, { useRef, useState, useEffect } from 'react';
import CanvasDraw from "react-canvas-draw";

/**
 * Displays the image, the description provided by the player and the guesses
 * made by the other players and allows the player to decide whether the guesses
 * match the description or not.
 * @param {{
 *      image: string,
 *      description: string,
 *      guesses: {id: string, guess: string},
 *      onCompleted: (arg: { id: string, points: number }[]) => void,
 * }} param0
 */
export default function ValidationScreen({ image, description, guesses, onCompleted }) {
    const canvas = useRef(null);
    const [responses, setResponses] = useState({});

    function setResponse(id, value) {
        setResponses({ ...responses, [id]: value });
    }

    function onReadyPressed() {
        onCompleted(responses);
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{ zIndex: 20 }} className="qd-overlay d-flex flex-column justify-content-center align-items-center">
                <div>
                    {guesses.map(({ id, guess }) => (
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="card-title">{id}</div>
                                <div className="card-text">
                                    <span className="font-weight-bold text-blue">{guess}</span>
                                    <div className="btn-group ml-3" role="group">
                                        <button className={`btn btn-sm btn-outline-green ${responses[id] === true && 'active'}`} type="button" onClick={() => setResponse(id, 10)}>+10</button>
                                        <button className={`btn btn-sm btn-outline-orange ${responses[id] === null && 'active'}`} type="button" onClick={() => setResponse(id, 5)}>+5</button>
                                        <button className={`btn btn-sm btn-outline-red ${responses[id] === false && 'active'}`} type="button" onClick={() => setResponse(id, 0)}>0</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className={`btn btn-green mt-3 ${Object.keys(responses).length !== guesses.length && 'disabled'}`} type="button" onClick={onReadyPressed}>
                    Done
                </button>
            </div>
            <CanvasDraw
                ref={canvas}
                style={{ width: '100%', height: '100%', opacity: 0.5 }}
                lazyRadius={10}
                brushRadius={5}
                saveData={image}
                disabled={true}
            />
        </div>
    );
}
