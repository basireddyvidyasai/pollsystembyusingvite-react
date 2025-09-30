import { io } from 'socket.io-client';

// Make sure to use your server's address
// Use 'http://localhost:4000' for local development
const PRODUCTION_URL = 'https://backendpolling.onrender.com';
const socket = io(PRODUCTION_URL);

export default socket;