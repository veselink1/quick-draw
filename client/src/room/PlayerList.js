import React from 'react';
import moment from 'moment';

export default function PlayerList({ players, turnPlayer, scores }) {
    return (
        <div>
            <table className="table table-sm table-hover">
                <tbody>
                    {players.map(player => (
                        <PlayerItem
                            key={player.id}
                            player={player}
                            isCurrent={turnPlayer === player}
                            score={scores ? scores[player.id] || 0 : null}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PlayerItem({ player, isCurrent, score }) {
    const { id, name } = player;
    const className = isCurrent
        ? 'table-pink text-center'
        : 'text-center';
    return (
        <tr className={className}>
            <td className="align-middle">
                {typeof score === 'number' ? (
                    <span className="badge badge-orange badge-pill">{score}</span>
                ) : (
                    <span className="oi oi-person"></span>
                )}
            </td>
            <td>
                {id}
            </td>
            <td className="align-middle">
                {isCurrent ? <span className="oi oi-brush"></span> : null}
            </td>
        </tr>
    );
}
