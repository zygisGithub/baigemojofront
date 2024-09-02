import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import config from '../plugins/hosted';
import userStore from '../store/userStore';

const apiUrl = config.baseUrl;


const Conversations = () => {
    const [chats, setChats] = useState([]);
    const nav = useNavigate();
    const { user } = userStore();
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Initialize socket connection
        const socket = io(apiUrl);

        // Fetch existing chats
        const fetchChats = async () => {
            try {
                const response = await axios.post(
                    `${apiUrl}/api/users/chats`,
                    { userId: user._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setChats(response.data.chats);
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();

        // Handle incoming new chats
        socket.on('newChat', ({ chat }) => {
            setChats(prevChats => [chat, ...prevChats]);
        });

        // Handle chat deletions
        socket.on('chatDeleted', (chatId) => {
            setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
        });

        // Handle when the user is added to a chat
        socket.on('youHaveBeenAdded', ({ newParticipant }) => {
            if (newParticipant === user._id) {
                fetchChats();
            }
        });

        // Cleanup event listeners
        return () => {
            socket.off('newChat');
            socket.off('chatDeleted');
            socket.off('userAdded');
        };
    }, [user._id, token]);


    const joinChat = (chatId) => {
        nav(`/chat/${chatId}`);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
            <div className="space-y-4">
                {chats.length > 0 ? (
                    chats.map(chat => (
                        <div
                            key={chat._id}
                            className="p-4 border border-gray-300 rounded-lg shadow-md flex items-center justify-between"
                        >
                            <div className="flex-1">
                                <div className='text-3xl font-bold'>{chat.name}</div>
                                <div className="text-lg font-semibold flex flex-wrap">
                                    Participants:
                                    {chat.participants
                                        .map(participant => (
                                            <span key={participant.userId} className="ml-2 text-blue-600">
                                                {participant.username}
                                            </span>
                                        ))}
                                </div>
                            </div>
                            <button
                                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={() => joinChat(chat._id)}
                            >
                                Join
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No conversations found.</p>
                )}
            </div>
        </div>
    );
};

export default Conversations;
