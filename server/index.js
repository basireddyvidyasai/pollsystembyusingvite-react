const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"],
  },
});

// --- In-memory state management ---
let teacher = null;
let students = [];
let currentPoll = null;
let pollHistory = [];
let chatMessages = [];
let pollTimer = null;

// UPDATED: Helper function now accepts the 'students' array to map IDs to names
const calculatePollSummary = (poll, studentList) => {
    const summary = {
        correct: 0,
        incorrect: 0,
        total: 0,
        correctStudents: [],
        incorrectStudents: [],
    };

    if (!poll || poll.correctAnswer === null || poll.correctAnswer === undefined) {
        return summary;
    }

    const studentAnswers = poll.results; // { studentId: answerIndex, ... }
    summary.total = Object.keys(studentAnswers).length;

    for (const studentId in studentAnswers) {
        const student = studentList.find(s => s.id === studentId);
        if (!student) continue; // Skip if student has disconnected

        const answerIndex = studentAnswers[studentId];
        if (parseInt(answerIndex, 10) === poll.correctAnswer) {
            summary.correct++;
            summary.correctStudents.push(student.name);
        } else {
            summary.incorrect++;
            summary.incorrectStudents.push(student.name);
        }
    }
    return summary;
};


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // --- Role & User Management ---
  socket.on('join', ({ name, role }) => {
    const user = { id: socket.id, name };
    if (role === 'teacher') {
      teacher = user;
      socket.join('teacher_room');
    } else {
      students.push(user);
    }
    io.emit('participants_update', { teacher, students });
    if (currentPoll) {
        socket.emit('poll_update', currentPoll);
    }
    socket.emit('chat_history', chatMessages);
  });

  // --- Polling Logic ---
  socket.on('create_poll', (pollData) => {
    if (socket.id === teacher?.id) {
        if (pollTimer) clearInterval(pollTimer);
        const newPoll = {
            ...pollData,
            id: Date.now(),
            results: {},
            liveResults: {},
        };
        pollData.options.forEach((_, index) => {
            newPoll.liveResults[index] = 0;
        });
        currentPoll = newPoll;
        pollTimer = setInterval(() => {
            if (currentPoll && currentPoll.timeRemaining > 0) {
                currentPoll.timeRemaining -= 1;
                io.emit('timer_update', currentPoll.timeRemaining);
            } else if (currentPoll && currentPoll.timeRemaining <= 0) {
                clearInterval(pollTimer);
                pollTimer = null;
                
                // UPDATED: Pass 'students' array to get names
                currentPoll.summary = calculatePollSummary(currentPoll, students);
                io.emit('poll_update', currentPoll); 

                if (!pollHistory.find(p => p.id === currentPoll.id)) {
                    pollHistory.unshift(currentPoll);
                    io.emit('poll_history_update', pollHistory);
                }
            }
        }, 1000);
        io.emit('poll_update', currentPoll);
    }
  });

  socket.on('submit_answer', ({ studentId, answerIndex }) => {
    if (currentPoll && !currentPoll.results[studentId]) {
      currentPoll.results[studentId] = answerIndex;
      currentPoll.liveResults[answerIndex]++;
      io.emit('poll_results_update', currentPoll.liveResults);
    }
  });

  socket.on('ask_new_question', () => {
    if (socket.id === teacher?.id) {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
        if(currentPoll && !pollHistory.find(p => p.id === currentPoll.id)) {
            // UPDATED: Pass 'students' array to get names
            currentPoll.summary = calculatePollSummary(currentPoll, students);
            pollHistory.unshift(currentPoll);
            io.emit('poll_history_update', pollHistory);
        }
        currentPoll = null;
        io.emit('poll_update', null);
    }
  });

  // --- Other Features ---
  socket.on('kick_student', (studentId) => {
    if (socket.id === teacher?.id) {
        students = students.filter(s => s.id !== studentId);
        io.to(studentId).emit('kicked');
        io.sockets.sockets.get(studentId)?.disconnect();
        io.emit('participants_update', { teacher, students });
    }
  });

  socket.on('send_message', (message) => {
    chatMessages.push(message);
    if(chatMessages.length > 100) chatMessages.shift();
    io.emit('new_message', message);
  });

  socket.on('disconnect', () => {
    if (socket.id === teacher?.id) teacher = null;
    else students = students.filter(student => student.id !== socket.id);
    io.emit('participants_update', { teacher, students });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));