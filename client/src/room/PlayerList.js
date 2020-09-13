import React from 'react';
import moment from 'moment';

export default function PlayerList({ players, turnPlayer }) {
    return (
        <div className="table-responsive">
            <table className="table table-sm table-striped table-hover table-pink">
                <tbody>
                    {players.map(player => (
                        <PlayerItem
                            key={player.id}
                            player={player}
                            isCurrent={turnPlayer === player}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PlayerItem({ player, isCurrent }) {
    const { id, name } = player;
    const className = isCurrent
        ? 'table-indigo text-center'
        : 'text-center';
    return (
        <tr className={className}>
            <td className="text-truncate">
                <span class="oi oi-person"></span>
            </td>
            <td className="text-truncate">
                {name}
            </td>
            <td>
                {isCurrent ? <span class="oi oi-brush"></span> : null}
            </td>
        </tr>
    );
}
