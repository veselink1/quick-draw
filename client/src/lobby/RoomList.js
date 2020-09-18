import React from 'react';
import moment from 'moment';

export default function RoomList({ rooms, selectedRoom, onSelected, onRefreshPressed }) {
    return (
        <div>
            <button style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}} className="btn btn-outline-pink btn-block" type="button" onClick={onRefreshPressed}>
                Press to refresh
            </button>
            <div className="table-responsive">
                <table className="table table-sm table-hover">
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
        ? 'table-pink'
        : '';
    return (
        <tr className={className} onClick={() => isSelected ? onSelected(null) : onSelected(room)}>
            <th>
                {id}
            </th>
            <td>
                {owner.id}
            </td>
            <td className="text-right">
                {moment(createdAt).calendar()}
            </td>
        </tr>
    );
}
