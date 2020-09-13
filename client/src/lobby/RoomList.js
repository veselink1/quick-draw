import React from 'react';
import moment from 'moment';

export default function RoomList({ rooms, selectedRoom, onSelected, onRefreshPressed }) {
    return (
        <div>
            <button style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} className="btn btn-outline-pink btn-block" type="button" onClick={onRefreshPressed}>
                Press to refresh
            </button>
            <div className="table-responsive">
                <table className="table table-sm table-striped table-hover table-pink">
                    <tbody>
                        {rooms.map(room => (
                            <RoomItem
                                key={room.id}
                                room={room}
                                isSelected={selectedRoom && selectedRoom.id === room.id}
                                onSelected={onSelected}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RoomItem({ room, isSelected, onSelected }) {
    const { id, owner, createdAt } = room;
    const className = isSelected
        ? 'table-indigo'
        : '';
    return (
        <tr className={className} onClick={() => isSelected ? onSelected(null) : onSelected(room)}>
            <th>
                {id}
            </th>
            <td>
                {owner.name}
            </td>
            <td className="text-right">
                {moment(createdAt).calendar()}
            </td>
        </tr>
    );
}
