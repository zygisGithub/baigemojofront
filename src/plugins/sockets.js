import { io } from 'socket.io-client';
import config from './hosted';

// Use the correct base URL for your WebSocket server
const socket = io(config.baseUrl, {
    transports: ['websocket'], // Ensure WebSocket transport is used
});

export default socket;
