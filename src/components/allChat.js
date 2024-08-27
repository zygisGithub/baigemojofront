import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import userStore from "../store/userStore";
import socket from '../plugins/sockets'; // Import shared socket instance

const AllChat = () => {
    const { user } = userStore();
    const [messages, setMessages] = useState([]);
    const currentMessage = useRef();
    const chatContainerRef = useRef(null);

    useEffect(() => {
        axios.post('http://localhost:3001/api/users/getMessages')
            .then(response => {
                setMessages(response.data.messages || []);
            })
            .catch(err => console.error('Error fetching messages:', err));

        socket.on('newMessage', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

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
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        const senderId = user._id;
        const senderUsername = user.username;
        const senderPhoto = user.photo;
        const content = currentMessage.current.value;

        axios.post('http://localhost:3001/api/users/sendMessage', {
            senderId,
            senderUsername,
            senderPhoto,
            content
        })
            .then(response => {
                console.log(response);
                currentMessage.current.value = '';
            })
            .catch(err => console.error('Error sending message:', err));
    };

    const handleReact = (messageId, reactionType) => {
        axios.post('http://localhost:3001/api/users/reactToMessage', {
            messageId,
            userId: user._id,
            reactionType
        })
            .then(response => {
                console.log(response);
            })
            .catch(err => console.error('Error reacting to message:', err));
    };

    const userReaction = (message, reactionType) => {
        return message.reacts?.some(r => r.type === reactionType && Array.isArray(r.users) && r.users.includes(user._id)) || false;
    };

    return (
        <div className='p-5 flex-1'>
            <div ref={chatContainerRef} className='overflow-y-auto h-[600px] p-3'>
                {messages.map((message) => (
                    <div key={message._id}
                         className={`chat-message-container ${message.sender.senderId === user._id ? 'chat-end' : 'chat-start'}`}>
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img alt="User Avatar" src={message.sender.senderPhoto}/>
                            </div>
                        </div>
                        <div className="chat-header flex items-center">
                            <div>{message.sender.senderUsername}</div>
                            <time className="text-xs opacity-50 p-3">
                                {new Date(message.timestamp).toLocaleDateString()} {new Date(message.timestamp).toLocaleTimeString()}
                            </time>
                        </div>
                        <div className="chat-bubble w-full" style={{whiteSpace: 'pre-wrap'}}>
                            {message.content}
                        </div>
                        <div className="reactions-container">
                            {['❤️', '👍', '😂', '🫶'].map(reaction => {
                                const reactionData = message.reacts?.find(r => r.type === reaction) || {};
                                const reactionCount = Array.isArray(reactionData.users) ? reactionData.users.length : 0;
                                return (
                                    <React.Fragment key={reaction}>
                                        {reactionCount > 0 && (
                                            <div className="reaction-count">
                                                {reaction} {reactionCount}
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            <div className="chat-reactions">
                                {['❤️', '👍', '😂', '🫶'].map(reaction => (
                                    user.username !== message.sender.senderUsername && (
                                        <button
                                            key={reaction}
                                            className="reaction-button"
                                            onClick={() => handleReact(message._id, reaction)}
                                            style={{
                                                backgroundColor: userReaction(message, reaction) ? 'lightgray' : 'transparent'
                                            }}
                                        >
                                            {reaction}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className='flex flex-col gap-3'>
                <textarea ref={currentMessage} className="textarea textarea-accent"
                          style={{resize: 'none', whiteSpace: 'pre-wrap'}} placeholder="Message"></textarea>
                <button className='btn btn-primary' onClick={handleSendMessage}>Send Message</button>
            </div>
        </div>
    );
};

export default AllChat;
