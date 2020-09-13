import React from 'react';

export default function RoomListOptions({ selectedRoom, onJoinPressed, onCreatePressed, onLeavePreviousPressed }) {
    const onJoin = () => onJoinPressed({ room: selectedRoom });
    const onCreate = () => onCreatePressed({});

    return (
        <div className="d-flex flex-column align-items-center justify-content-around">
            <div className="text-center">
                <div className="display-4 text-orange qd-text-outline qd-text-title">
                    Quick, <span className="text-pink">D</span><span className="text-teal">R</span><span className="text-indigo">A</span><span className="text-yellow">W</span>!
                </div>
                by Veselin Karaganev
            </div>
            <div className="d-flex">
                <button className="btn btn-primary mx-3" disabled={!selectedRoom} type="button" onClick={onJoin}>
                    Join Room
                </button>
                <button className="btn btn-secondary mx-3" type="button" onClick={onCreate}>
                    Create Room
                </button>
            </div>
            <button className="btn btn-outline-secondary mx-3" type="button" onClick={onLeavePreviousPressed}>
                Leave all rooms
            </button>
        </div>
    );
}
