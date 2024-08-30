import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import userStore from "../store/userStore";
import socket from '../plugins/sockets'; // Import shared socket instance
import config from '../plugins/hosted';

const apiUrl = config.baseUrl;

const AllChat = () => {
    const { user } = userStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeMessageId, setActiveMessageId] = useState(null); // State for active reaction pop-up
    const chatContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch initial messages
        axios.get(`${apiUrl}/api/users/getMessages`)
            .then(response => {
                setMessages(response.data.messages || []);
            })
            .catch(err => console.error('Error fetching messages:', err));

        // Handle new messages
        socket.on('newMessage', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // Handle message updates
        socket.on('messageUpdated', (message) => {
            setMessages(prevMessages => {
                const updatedMessages = prevMessages.map(msg =>
                    msg._id === message._id ? message : msg
                );
                return updatedMessages;
            });
        });

        return () => {
            socket.off('newMessage');
            socket.off('messageUpdated');
        };
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async () => {
        try {
            const response = await axios.post(`${apiUrl}/api/users/sendMessage`, {
                senderId: user._id,
                senderUsername: user.username,
                senderPhoto: user.photo,
                content: newMessage
            });
            socket.emit('sendNotification', response.data.notification);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleReact = (messageId, reactionType) => {
        axios.post(`${apiUrl}/api/users/reactToMessage`, {
            messageId,
            userId: user._id,
            reactionType
        })
            .then(response => {
                socket.emit('sendNotification', response.data.notification);
            })
            .catch(err => console.error('Error reacting to message:', err));
    };


    const toggleReactionPopUp = (messageId) => {
        setActiveMessageId(activeMessageId === messageId ? null : messageId);
    };

    const renderReactionPopUp = (messageId, senderId) => {
        // Only render reaction pop-up if the message sender is not the current user
        if (senderId === user._id) {
            return null;
        }

        return (
            <div className="absolute bg-white border rounded-full p-2 flex space-x-2 shadow-lg z-10">
                {['❤️', '😂', '👍', '😲', '😡'].map(reaction => (
                    <button
                        key={reaction}
                        onClick={() => {
                            handleReact(messageId, reaction);
                            setActiveMessageId(null); // Close the pop-up after reacting
                        }}
                        className="hover:bg-gray-200 p-2 rounded-full"
                    >
                        {reaction}
                    </button>
                ))}
            </div>
        );
    };

    const getReactionsSummary = (reacts) => {
        const reactionSummary = reacts.reduce((acc, react) => {
            acc.count += react.users.length;
            if (react.users.length > 0) {
                acc.reactionTypes.push(react.type);
            }
            return acc;
        }, { count: 0, reactionTypes: [] });

        return reactionSummary;
    };

    return (
        <div className="flex flex-col bg-white rounded-lg shadow-md p-4 h-[100%] max-h-[600px] relative" style={{ flex: '3' }}>
            {/* Messages */}
            <div className="flex-grow overflow-y-auto mb-16 h-[100%]">
                {messages.map((message, index) => {
                    const isSameSenderAsPrevious = index > 0 && messages[index - 1].sender.senderId === message.sender.senderId;
                    const isActive = activeMessageId === message._id;

                    const reactionSummary = getReactionsSummary(message.reacts || []);

                    return (
                        <div key={message._id} className={`mb-3 ${isSameSenderAsPrevious ? 'mt-[-10px]' : 'mt-4'}`}>
                            {!isSameSenderAsPrevious && (
                                <div className="flex items-center gap-3">
                                    <img className="rounded-full w-[50px] h-[50px]" src={message.sender.senderPhoto} alt="" />
                                    <div>
                                        <span className="text-xl font-semibold">{message.sender.senderUsername}</span>
                                        <time className="text-xs text-gray-500 ml-2">
                                            {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString()}
                                        </time>
                                    </div>
                                </div>
                            )}
                            <div className={`pl-[60px] ${isSameSenderAsPrevious ? 'mt-[-5px]' : ''}`}>
                                <div className="relative">
                                    <p
                                        className="bg-gray-100 p-3 rounded-lg shadow-sm inline-block cursor-pointer"
                                        onClick={() => toggleReactionPopUp(message._id)}
                                    >
                                        {message.content}
                                    </p>
                                    {isActive && renderReactionPopUp(message._id, message.sender.senderId)}
                                </div>
                                {reactionSummary.count > 0 && (
                                    <div className="flex space-x-2 mt-2">
                                        {reactionSummary.reactionTypes.map((reaction) => (
                                            <span key={reaction} className="text-sm">
                                                {reaction}
                                            </span>
                                        ))}
                                        <span className="text-sm font-bold">
                                            {reactionSummary.count}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
                <div className="flex items-center">
                    <input
                        className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
                        type="text"
                        value={newMessage}
                        placeholder="Type a message..."
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                        onClick={sendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllChat;
