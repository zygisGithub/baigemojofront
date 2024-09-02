// src/plugins/socket.js
import { io } from 'socket.io-client';
import config from './hosted';

const socket = io(config.baseUrl);


export default socket;
