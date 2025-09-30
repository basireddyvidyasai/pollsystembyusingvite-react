import React from 'react';
import { useSelector } from 'react-redux';

const Timer = () => {
    // UPDATED: This now gets the live-updating time directly from the Redux store.
    // No useState or useEffect needed here anymore.
    const timeRemaining = useSelector((state) => state.poll.currentPoll?.timeRemaining ?? 0);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        // Added a small UI touch to make the timer red when time is low
        <div className="timer" style={{ color: timeRemaining <= 10 ? '#DC2626' : 'inherit' }}>
            🕒 {formatTime(timeRemaining)}
        </div>
    );
};

export default Timer;