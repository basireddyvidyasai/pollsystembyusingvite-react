import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="container welcome-container">
      <div className="brand-tag">✨ Intervue Poll</div>
      <h1>Welcome to the Live Polling System</h1>
      <p>Please select the role that best describes you to begin.</p>
      <div className="role-selector">
        <div 
            className={`role-card ${role === 'student' ? 'selected' : ''}`}
            onClick={() => setRole('student')}
        >
          <h2>I'm a Student</h2>
          <p>You'll be able to submit your answers, participate in live polls, and see how you compare.</p>
        </div>
        <div 
            className={`role-card ${role === 'teacher' ? 'selected' : ''}`}
            onClick={() => setRole('teacher')}
        >
          <h2>I'm a Teacher</h2>
          <p>Submit answers and view live poll results in real-time.</p>
        </div>
      </div>
      <button className="btn-primary" onClick={handleContinue}>Continue</button>
    </div>
  );
};

export default Home;