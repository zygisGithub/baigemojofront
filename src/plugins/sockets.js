// src/plugins/socket.js
import { io } from 'socket.io-client';
import config from './hosted';

const socket = io(config.baseUrl);

socket.on('connect', () => {
    console.log('Connected to socket server');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
});

socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
});

export default socket;
