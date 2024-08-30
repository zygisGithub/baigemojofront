import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import config from '../plugins/hosted';
import axios from "axios";
import userStore from "../store/userStore";
const apiUrl = config.baseUrl;
const socket = io(apiUrl);

const Conversations = () => {
    const [chats, setChats] = useState([]);
    const nav = useNavigate();
    const {user} = userStore()
    const token = localStorage.getItem('token')

    useEffect(() => {
        // Fetch existing chats
        const fetchChats = async () => {
            try {
                const response = await axios.post(`${apiUrl}/api/users/chats`,
                    { userId: user._id },
                    { headers: { Authorization: `Bearer ${token}` } } // Include token in headers
                );
                setChats(response.data.chats);
                console.log('response:', response)
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();

        // Handle incoming new chats
        socket.on('newChat', ({ chat, userId }) => {
            setChats(prevChats => [chat, ...prevChats]);
        });

        return () => {
            socket.off('newChat');
        };
    }, []);

    const joinChat = (chatId) => {
        nav(`/chat/${chatId}`);
    };

    return (
        <div className='flex flex-col items-center gap-8'>
            {chats.map(chat => (
                <div key={chat._id}>
                    <div className='flex gap-3'>
                        Chat with: {chat.participants.map((x,i)=>
                        x !== user._id &&
                        <span key={i}>{x.username}</span>
                    )}
                    </div>
                    <button className='btn btn-primary' onClick={() => joinChat(chat._id)}>Join</button>
                </div>
            ))}
        </div>
    );
};

export default Conversations;
