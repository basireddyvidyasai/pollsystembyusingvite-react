import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import socket from '../utils/socket';

const ParticipantsList = () => {
    const { participants } = useSelector((state) => state.user);
    const [activeTab, setActiveTab] = useState('Participants'); // Could be 'Chat' if combined

    const handleKick = (studentId) => {
        if (window.confirm("Are you sure you want to remove this student?")) {
            socket.emit('kick_student', studentId);
        }
    }

    return (
        <div className="participants-popup">
            <div className="popup-tabs">
                <button 
                    className={activeTab === 'Participants' ? 'active' : ''}
                    onClick={() => setActiveTab('Participants')}
                >
                    Participants
                </button>
                {/* Could add chat here if preferred */}
            </div>
            <div className="popup-content">
                {activeTab === 'Participants' && (
                    <div className='participants-list'>
                        {participants.teacher && <div className="participant-item teacher">👑 {participants.teacher.name} (Teacher)</div>}
                        {participants.students.map(student => (
                            <div key={student.id} className="participant-item">
                                <span>{student.name}</span>
                                <button className="kick-btn" onClick={() => handleKick(student.id)}>Kick out</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParticipantsList;