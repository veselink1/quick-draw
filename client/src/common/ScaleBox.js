import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

export default function ScaleBox({ children, ...props }) {
    const container = useRef(null);
    const holder = useRef(null);

    const [tick, setTick] = useState(0);
    const [scale, setScale] = useState([1, 1]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(tick + 1);
        }, 50);
        return () => clearInterval(interval);
    });

    useLayoutEffect(() => {
        setScale([container.current.clientWidth / holder.current.clientWidth, container.current.clientHeight / holder.current.clientHeight]);
    }, [tick]);

    return (
        <div ref={container} {...props}>
            <div ref={holder} style={{ transform: `scale(${scale[0]}, ${scale[1]})` }}>{children}</div>
        </div>
    );
}
