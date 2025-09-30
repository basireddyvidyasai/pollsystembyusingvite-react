import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socket from '../utils/socket';
import { setUser } from '../redux/userSlice';
import Chat from '../components/Chat';
import ParticipantsList from '../components/ParticipantsList';

const TeacherView = () => {
    const dispatch = useDispatch();
    const [isJoined, setIsJoined] = useState(false);
    const [viewHistory, setViewHistory] = useState(false);
    
    // Form state
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [timeLimit, setTimeLimit] = useState(60);

    const { currentPoll, pollHistory } = useSelector((state) => state.poll);

    useEffect(() => {
        if (!isJoined) {
            const teacherName = "Teacher";
            dispatch(setUser({ id: socket.id, name: teacherName, role: 'teacher' }));
            socket.emit('join', { name: teacherName, role: 'teacher' });
            setIsJoined(true);
        }
    }, [isJoined, dispatch]);

    const handleAddOption = () => setOptions([...options, '']);
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreatePoll = (e) => {
        e.preventDefault();
        const pollData = {
            question,
            options: options.filter(opt => opt.trim() !== ''),
            correctAnswer,
            timeLimit,
            timeRemaining: timeLimit
        };
        socket.emit('create_poll', pollData);
    };
    
    const handleAskNewQuestion = () => {
        socket.emit('ask_new_question');
        setQuestion('');
        setOptions(['', '']);
        setCorrectAnswer(null);
    }
    
    const getTotalVotes = (liveResults) => {
      if (!liveResults) return 0;
      return Object.values(liveResults).reduce((sum, count) => sum + count, 0);
    };

    const PollResults = ({ poll }) => {
        const totalVotes = getTotalVotes(poll.liveResults);
        return (
            <div className="poll-box">
                <div className="question-title">{poll.question}</div>
                <div className="options-list">
                    {poll.options.map((option, index) => {
                        const percentage = totalVotes > 0 ? ((poll.liveResults[index] || 0) / totalVotes) * 100 : 0;
                        return (
                            <div key={index} className={`option-item result-view ${poll.correctAnswer === index ? 'correct' : ''}`}>
                                <div className="option-text">
                                    <span className="option-number">{index + 1}</span> {option}
                                </div>
                                <div className="result-bar-container">
                                    <div className="result-bar" style={{ width: `${percentage}%` }}></div>
                                    <span className="percentage-label">{percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {poll.summary && (
                    <>
                        <div className="poll-summary">
                            <span>Total Answers: <strong>{poll.summary.total}</strong></span>
                            <span className="summary-correct">Correct: <strong>{poll.summary.correct}</strong></span>
                            <span className="summary-incorrect">Incorrect: <strong>{poll.summary.incorrect}</strong></span>
                        </div>
                        {/* UPDATED: Display lists of student names */}
                        <div className="student-answer-lists">
                            <div className="student-list">
                                <h4>✅ Correct Answers</h4>
                                <ul>
                                    {poll.summary.correctStudents.length > 0 ? (
                                        poll.summary.correctStudents.map(name => <li key={name}>{name}</li>)
                                    ) : (
                                        <li>None</li>
                                    )}
                                </ul>
                            </div>
                             <div className="student-list">
                                <h4>❌ Incorrect Answers</h4>
                                <ul>
                                    {poll.summary.incorrectStudents.length > 0 ? (
                                        poll.summary.incorrectStudents.map(name => <li key={name}>{name}</li>)
                                    ) : (
                                        <li>None</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    };

    if (viewHistory) {
        return (
            <div className="container poll-history-container">
                <button className="btn-secondary" onClick={() => setViewHistory(false)}>← Back to Poll</button>
                <h1>Poll History</h1>
                {pollHistory.length > 0 ? pollHistory.map(poll => <PollResults key={poll.id} poll={poll} />) : <p>No past polls to show.</p>}
                <Chat />
                <ParticipantsList />
            </div>
        )
    }

    return (
        <div className="container teacher-view-container">
            <div className="teacher-header">
                <h2>Teacher Dashboard</h2>
                <button className="btn-secondary" onClick={() => setViewHistory(true)}>View Poll History</button>
            </div>
            {currentPoll ? (
                <div className='live-results-section'>
                    <h3>Live Results</h3>
                    <PollResults poll={currentPoll} />
                    <button className="btn-primary" onClick={handleAskNewQuestion}>+ Ask a new question</button>
                </div>
            ) : (
                <form className="create-poll-form" onSubmit={handleCreatePoll}>
                    {/* Form content remains the same */}
                    <h3>Create a New Poll</h3>
                    <div className="form-group">
                        <label>Enter your question</label>
                        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="E.g., Which planet is known as the Red Planet?" required></textarea>
                    </div>
                    <div className="form-group">
                        <label>Edit Options</label>
                        {options.map((option, index) => (
                            <div key={index} className="option-input-group">
                                <span className="option-number">{index + 1}</span>
                                <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} required />
                                <div className='correct-answer-toggle'>
                                  <span>Is it Correct?</span>
                                  <input type="radio" name="correctAnswer" checked={correctAnswer === index} onChange={() => setCorrectAnswer(index)} /> Yes
                                </div>
                            </div>
                        ))}
                        <button type="button" className="btn-add-option" onClick={handleAddOption}>+ Add More option</button>
                    </div>
                    <div className="form-group">
                       <label>Time Limit</label>
                       <select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}>
                            <option value={15}>15 seconds</option>
                            <option value={30}>30 seconds</option>
                            <option value={60}>60 seconds</option>
                            <option value={90}>90 seconds</option>
                       </select>
                    </div>
                    <button type="submit" className="btn-primary">Ask Question</button>
                </form>
            )}
            <Chat />
            <ParticipantsList />
        </div>
    );
};

export default TeacherView;