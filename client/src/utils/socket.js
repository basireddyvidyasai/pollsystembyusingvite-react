import { io } from 'socket.io-client';

// Make sure to use your server's address
// Use 'http://localhost:4000' for local development
const SERVER_URL = 'http://localhost:4000'; 
const socket = io(SERVER_URL);

export default socket;