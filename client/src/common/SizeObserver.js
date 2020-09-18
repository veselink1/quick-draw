import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

export default function SizeObserver({ children, ...props }) {
    const holder = useRef(null);

    const [tick, setTick] = useState(0);
    const [clientWidth, setClientWidth] = useState(0);
    const [clientHeight, setClientHeight] = useState(0);
    const [containerClientWidth, setContainerClientWidth] = useState(0);
    const [containerClientHeight, setContainerClientHeight] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(tick + 1);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useLayoutEffect(() => {
        setClientWidth(holder.current.clientWidth);
        setClientHeight(holder.current.clientHeight);
        setContainerClientWidth(holder.current.parentNode.clientWidth);
        setContainerClientHeight(holder.current.parentNode.clientHeight);
    }, [tick]);

    return children({ ref: holder, clientWidth, clientHeight, containerClientWidth, containerClientHeight });
}
