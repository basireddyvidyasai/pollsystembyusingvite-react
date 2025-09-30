import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import socket from './utils/socket';
import { setParticipants } from './redux/userSlice';
// UPDATED: Import the new action
import { setPoll, updateResults, setPollHistory, setTimeRemaining } from './redux/pollSlice';
import { addMessage, setChatHistory } from './redux/chatSlice';

import Home from './pages/Home';
import TeacherView from './pages/TeacherView';
import StudentView from './pages/StudentView';

// Wrapper component to use navigate in event handlers
const SocketEventManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('participants_update', (data) => dispatch(setParticipants(data)));
        socket.on('poll_update', (poll) => dispatch(setPoll(poll)));
        socket.on('poll_results_update', (results) => dispatch(updateResults(results)));
        socket.on('poll_history_update', (history) => dispatch(setPollHistory(history)));
        socket.on('chat_history', (messages) => dispatch(setChatHistory(messages)));
        socket.on('new_message', (message) => dispatch(addMessage(message)));
        socket.on('kicked', () => {
            alert("You have been removed from the session by the teacher.");
            socket.disconnect();
            navigate('/');
        });

        // UPDATED: This now dispatches the action to update the timer in real-time
        socket.on('timer_update', (time) => {
            dispatch(setTimeRemaining(time));
        });

        return () => {
            socket.off('participants_update');
            socket.off('poll_update');
            socket.off('poll_results_update');
            socket.off('poll_history_update');
            socket.off('chat_history');
            socket.off('new_message');
            socket.off('kicked');
            // UPDATED: Ensure the listener is removed on cleanup
            socket.off('timer_update');
        };
    }, [dispatch, navigate]);

    return null; // This component does not render anything
};

function App() {
  return (
    <Router>
        <SocketEventManager />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teacher" element={<TeacherView />} />
            <Route path="/student" element={<StudentView />} />
        </Routes>
    </Router>
  );
}

export default App;