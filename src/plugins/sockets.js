import { io } from 'socket.io-client';
import config from './hosted';

const socket = io('wss://www.helsword.org/socket.io/', {
    transports: ['websocket']
});


export default socket;
