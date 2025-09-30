import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socket from '../utils/socket';
import { setUser } from '../redux/userSlice';
import { setVoted } from '../redux/pollSlice';
import Timer from '../components/Timer';
import Chat from '../components/Chat';

const StudentView = () => {
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector((state) => state.user);
  const { currentPoll, hasVoted } = useSelector((state) => state.poll);
  
  // Redirect if user reloads and loses name state
  useEffect(() => {
    if (!user.name && isJoined) {
      navigate('/');
    }
  }, [user.name, isJoined, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      dispatch(setUser({ id: socket.id, name, role: 'student' }));
      socket.emit('join', { name, role: 'student' });
      setIsJoined(true);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption !== null) {
      socket.emit('submit_answer', { studentId: user.id, answerIndex: selectedOption });
      dispatch(setVoted());
    }
  };
  
  const getTotalVotes = () => {
      if (!currentPoll?.liveResults) return 0;
      return Object.values(currentPoll.liveResults).reduce((sum, count) => sum + count, 0);
  };

  if (!isJoined) {
    return (
      <div className="container join-container">
        <div className="brand-tag">✨ Intervue Poll</div>
        <div className="join-box">
          <h2>Let's Get Started</h2>
          <p>If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.</p>
          <form onSubmit={handleJoin}>
            <label>Enter your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required 
            />
            <button type="submit" className="btn-primary">Continue</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container poll-view-container">
      {!currentPoll ? (
        <div className="waiting-screen">
          <div className="brand-tag">✨ Intervue Poll</div>
          <div className="loader"></div>
          <h2>Wait for the teacher to ask questions..</h2>
        </div>
      ) : (
        <>
            <div className="poll-header">
                <h2>Question {currentPoll.id}</h2>
                <Timer />
            </div>
            <div className="poll-box">
                <div className="question-title">{currentPoll.question}</div>
                <div className="options-list">
                    {currentPoll.options.map((option, index) => {
                        const totalVotes = getTotalVotes();
                        const percentage = totalVotes > 0 ? ((currentPoll.liveResults[index] || 0) / totalVotes) * 100 : 0;
                        const isPollOver = hasVoted || currentPoll.timeRemaining <= 0;
                        
                        // CORRECTED: This logic now also checks for the correct answer to apply the 'correct' class
                        const isCorrectAnswer = isPollOver && index === currentPoll.correctAnswer;

                        return (
                            <div 
                                key={index} 
                                className={`
                                  option-item 
                                  ${selectedOption === index ? 'selected' : ''} 
                                  ${isPollOver ? 'disabled result-view' : ''}
                                  ${isCorrectAnswer ? 'correct' : ''}
                                `}
                                onClick={() => !isPollOver && setSelectedOption(index)}
                            >
                                <div className="option-text">
                                    <span className="option-number">{index + 1}</span> {option}
                                </div>
                                {isPollOver &&
                                    <div className="result-bar-container">
                                        <div className="result-bar" style={{ width: `${percentage}%` }}></div>
                                        <span className="percentage-label">{percentage.toFixed(0)}%</span>
                                    </div>
                                }
                            </div>
                        )
                    })}
                </div>
                 {/* This section for showing correct/incorrect counts is from the previous update */}
                {currentPoll.summary && (
                    <div className="poll-summary">
                        <span>Total Answers: <strong>{currentPoll.summary.total}</strong></span>
                        <span className="summary-correct">Correct: <strong>{currentPoll.summary.correct}</strong></span>
                        <span className="summary-incorrect">Incorrect: <strong>{currentPoll.summary.incorrect}</strong></span>
                    </div>
                )}
            </div>
            { !(hasVoted || currentPoll.timeRemaining <= 0) ? (
                 <button className="btn-primary" onClick={handleSubmitAnswer} disabled={selectedOption === null}>Submit</button>
            ) : (
                <p className='waiting-text'>Wait for the teacher to ask a new question..</p>
            )}
        </>
      )}
      <Chat />
    </div>
  );
};

export default StudentView;