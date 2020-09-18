import { useState, useEffect } from 'react';

export function useTime(freq = 1000) {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        let isRunning = true;
        function tick() {
            setTimeout(() => {
                setTime(Date.now());
                if (isRunning) {
                    tick();
                }
            }, time % freq);
        }
        tick();
        return () => isRunning = false;
    }, []);
    return time;
}
