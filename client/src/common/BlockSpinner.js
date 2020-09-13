import React from 'react';

export default function BlockSpinner(props) {
    return (
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.4)' }} className="rounded">
            <div style={{ position: 'absolute', left: '50%', top: '50%' }} {...props}>
                <div class="spinner-grow text-secondary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    );
}
