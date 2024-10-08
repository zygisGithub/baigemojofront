import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import config from '../plugins/hosted';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import userStore from '../store/userStore';
import { useNavigate } from 'react-router-dom';

const apiUrl = config.baseUrl;
const socket = io(apiUrl);

const Chat = () => {
    const nav = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [participants, setParticipants] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState(null); // State for active reaction pop-up
    const { user } = userStore();
    const { conversationId } = useParams();
    const messagesEndRef = useRef(null);
    const [chatOwnerId, setChatOwnerId] = useState();
    const [isParticipant, setIsParticipant] = useState(false);
    
    useEffect(() => {
        const fetchChatDetails = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/messages/${conversationId}`);
                const { participants } = response.data;

                // Check if the current user is a participant
                const userIsParticipant = participants.some(participant => participant.userId === user._id);
                setIsParticipant(userIsParticipant);

                if (!userIsParticipant) {
                    nav('/conversations'); // Redirect if not a participant
                }
            } catch (error) {
                console.error('Error fetching chat details:', error);
                nav('/conversations'); // Redirect on error
            }
        };

        fetchChatDetails();
    }, [conversationId, user._id, nav]);
    useEffect(() => {
        // Listen for when a new user is added
        const handleUserAdded = ({ chatId, newParticipant }) => {
            if (conversationId === chatId) {
                setParticipants(prevParticipants => [...prevParticipants, newParticipant]);
            }
        };

        socket.on('userAdded', handleUserAdded);

        return () => {
            socket.off('userAdded', handleUserAdded);
        };
    }, [conversationId]);

    useEffect(() => {
        const handleUserLeft = ({ chatId, userId }) => {
            if (conversationId === chatId) {
                setParticipants((prevParticipants) =>
                    prevParticipants.filter(p => p.userId !== userId)
                );
            }
        };

        // Listening for the 'chatDeleted' event
        const handleChatDeleted = (chatId) => {
            if (conversationId === chatId) {
                nav('/conversations');  // Redirect to the conversations list
            }
        };

        socket.on('userLeft', handleUserLeft);
        socket.on('chatDeleted', handleChatDeleted);

        return () => {
            socket.off('userLeft', handleUserLeft);
            socket.off('chatDeleted', handleChatDeleted);
        };
    }, [conversationId, nav]);

    useEffect(() => {
        const handleReactionUpdated = (message) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === message._id ? message : msg
                )
            );
        };

        socket.on('profileUsernameChanged', ({ userId, newUsername }) => {
            setUsers(users => users.map(user => user._id === userId ? { ...user, username: newUsername } : user));
        });

        socket.on('profilePhotoChanged', ({ userId, photoUrl }) => {
            setUsers(users => users.map(user => user._id === userId ? { ...user, photo: photoUrl } : user));
        });

        socket.on('reactionUpdated', handleReactionUpdated);

        return () => {
            socket.off('reactionUpdated', handleReactionUpdated);
        };
    }, []);

    useEffect(() => {

        const livePhotoChange = ({ userId, photoUrl }) => {
            setParticipants((prevParticipants) =>
                prevParticipants.map((p) =>
                    p.userId === userId ? { ...p, photo: photoUrl } : p
                )
            );

            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.senderId === userId ? { ...msg, senderPhoto: photoUrl } : msg
                )
            );
        };

        const liveUsernameChange = ({ userId, newUsername }) => {
            setParticipants((prevParticipants) =>
                prevParticipants.map((p) =>
                    p.userId === userId ? { ...p, username: newUsername } : p
                )
            );

            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.senderId === userId ? { ...msg, senderUsername: newUsername } : msg
                )
            );
        };

        if (user) {
            socket.emit('userOnline', user._id);
        }
        socket.emit('joinChat', conversationId);

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/messages/${conversationId}`);
                setMessages(response.data.messages);
                setParticipants(response.data.participants);
                setChatOwnerId(response.data.creatorId);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/getUsers`);
                setUsers(response.data.users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const handleAddUserSocket = (chatId) => {
            if (chatId === conversationId) {
                fetchUsers();
                axios.get(`${apiUrl}/api/users/messages/${conversationId}`)
                    .then(res => {
                        setParticipants(res.data.participants)
                    })

                    .catch(error => console.error('Error fetching participants:', error));
            }
        };

        const handleNewMessage = (message) => {
            if (message.chatId === conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        };

        const handleUpdateOnlineUsers = (userIds) => {
            setOnlineUsers(userIds);
        };

        socket.on('profilePhotoChanged', livePhotoChange);
        socket.on('profileUsernameChanged', liveUsernameChange);
        socket.on('newUser', fetchUsers);
        socket.on('addUser', handleAddUserSocket);
        socket.on('newMessage', handleNewMessage);
        socket.on('updateOnlineUsers', handleUpdateOnlineUsers);

        fetchMessages();

        return () => {
            socket.off('profileUsernameChanged');
            socket.off('newMessage');
            socket.off('addUser');
            socket.off('newUser');
            socket.off('profilePhotoChanged');
        };
    }, [conversationId, user]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (isTyping) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/api/users/getUsers`);
                    setUsers(response.data.users);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
            setIsTyping(false);
        }
    }, [isTyping]);

    const sendMessage = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await axios.post(
                `${apiUrl}/api/users/sendMessageChat`,
                {
                    chatId: conversationId,
                    senderId: user._id,
                    content: newMessage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                        'Content-Type': 'application/json',   
                    },
                }
            );
    
            response.data.notifications.forEach(notification => {
                socket.emit('sendNotification', notification);
            });
    
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };
    
    const handleAddUser = async (userId) => {
        const token = localStorage.getItem('token')
        try {
            const response = await axios.post(
                `${apiUrl}/api/users/addParticipants`,
                {
                    chatId: conversationId,
                    newParticipant: [userId],
                    user: user,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Replace userToken with your token variable
                        'Content-Type': 'application/json',   // Optional, but often needed
                    },
                }
            );
    
            socket.emit('sendNotification', response.data.notification);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };
    

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setIsTyping(true);
    };

    const filteredUsers = users.filter(u =>
        !participants.some(p => p.username === u.username) &&
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sendReaction = async (messageId, reactionType) => {
        const token = localStorage.getItem('token')
        try {
            const existingReaction = messages.find(msg => msg._id === messageId)?.reacts.find(r => r.users.includes(user._id));
    
            const requestData = {
                messageId,
                userId: user._id,
                reaction: existingReaction && existingReaction.type === reactionType ? null : reactionType,
                username: user.username,
                conversationId: conversationId
            };
    
            const response = await axios.post(
                `${apiUrl}/api/users/reactToMessageConversation`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',  
                    },
                }
            );
    
            socket.emit('sendNotification', response.data.notification);
        } catch (error) {
            console.error('Error reacting to message:', error);
        }
    };
    

    const toggleReactionPopUp = (messageId) => {
        setActiveMessageId(activeMessageId === messageId ? null : messageId);
    };

    const renderReactionPopUp = (messageId, senderId) => {
        if (senderId === user._id) {
            return null;
        }

        return (
            <div className="absolute bg-white border rounded-full p-2 flex space-x-2 shadow-lg z-10">
                {['❤️', '😂', '👍', '😲', '😡'].map(reaction => (
                    <button
                        key={reaction}
                        onClick={() => {
                            sendReaction(messageId, reaction);
                            setActiveMessageId(null);
                        }}
                        className="hover:bg-gray-200 p-2 rounded-full"
                    >
                        {reaction}
                    </button>
                ))}
            </div>
        );
    };

    const handleLeaveChat = async () => {
        try {
            await axios.post(`${apiUrl}/api/users/leaveChat`, {
                chatId: conversationId,
                userId: user._id,
            });
            nav('/conversations');
        } catch (error) {
            console.error('Error leaving chat:', error);
        }
    };

    const handleDeleteChat = async () => {
        try {
            await axios.post(`${apiUrl}/api/users/deleteChat`, {
                chatId: conversationId,
                userId: user._id,
            });
            // Redirect to conversations page
            nav('/conversations');
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevents the default behavior of adding a new line
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen md:flex-row gap-8 mb-4">
            {/* Users Section */}
            <div className="flex flex-col bg-gray-50 rounded-lg shadow-md p-4 md:w-1/4">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                <input
                    type="text"
                    className="mb-4 p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {searchTerm && (
                    <div className="overflow-y-auto sm:h-full max-h-[500px]">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((x) => (
                                <div key={x._id} className="flex items-center gap-3 mb-4">
                                    <img onClick={() => nav(`/user/${x.username}`)} className={`rounded-full w-[40px] h-[40px] ${onlineUsers.includes(x._id) ? 'border-primary border-2' : ''}`} src={x.photo} alt="" />
                                    <p onClick={() => nav(`/user/${x.username}`)} className="text-lg">{x.username} {onlineUsers.includes(x._id) && <span className="text-green-500">Active</span>}</p>
                                    <button
                                        className="ml-auto bg-green-500 text-white px-1 py-1 rounded-lg hover:bg-green-600 transition-colors"
                                        onClick={() => handleAddUser(x._id)}
                                    >
                                        Add to chat
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No users found</p>
                        )}
                    </div>
                )}
            </div>

            {/* Chat Section */}
            <div className="flex flex-col bg-white rounded-lg shadow-md p-4 flex-1 relative sm:max-h-full max-h-[500px]">
                {/* Messages */}
                <div className="flex-grow overflow-y-auto mb-16 sm:h-full ">
                    {messages.map((msg, index) => {
                        const isSameSenderAsPrevious = index > 0 && messages[index - 1].senderId === msg.senderId;
                        const isActive = activeMessageId === msg._id;

                        const reactionSummary = getReactionsSummary(msg.reacts || []);

                        return (
                            <div key={msg._id} className={`mb-3 ${isSameSenderAsPrevious ? 'mt-[-10px]' : 'mt-4'}`}>
                                {!isSameSenderAsPrevious && (
                                    <div className="flex items-center gap-3">
                                        <img className="rounded-full w-[50px] h-[50px]" src={msg.senderPhoto} alt="" />
                                        <div>
                                            <span className="text-xl font-semibold">{msg.senderUsername}</span>
                                            <time className="text-xs text-gray-500 ml-2">
                                                {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                                            </time>
                                        </div>
                                    </div>
                                )}
                                <div className={`pl-[60px] ${isSameSenderAsPrevious ? 'mt-[-5px]' : ''}`}>
                                    <div className="relative">
                                        <p
                                            className="bg-gray-100 p-3 rounded-lg shadow-sm inline-block cursor-pointer break-words"
                                            onClick={() => toggleReactionPopUp(msg._id)}
                                        >
                                            {msg.content}
                                        </p>
                                        {isActive && renderReactionPopUp(msg._id, msg.senderId)}
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
                            onKeyDown={handleKeyDown}
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

            {/* Participants Section */}
            <div className="flex flex-col bg-gray-50 rounded-lg shadow-md p-4 md:w-1/4">
                <h2 className="text-xl font-semibold mb-4">Participants</h2>
                <div className="overflow-y-auto sm:h-full max-h-[500px]">
                    {participants.map((x, i) => (
                        <div key={i} className="flex items-center gap-3 mb-4">
                            <img onClick={() => nav(`/user/${x.username}`)} className={`rounded-full w-[40px] h-[40px] ${onlineUsers.includes(x.userId) ? 'border-primary border-2' : ''}`} src={x.photo} alt="" />
                            <p onClick={() => nav(`/user/${x.username}`)} className="text-lg">{x.username} {onlineUsers.includes(x.userId) && <span className="text-green-500">Active</span>}</p>
                            {x.username === user.username && x.userId !== chatOwnerId &&
                                <button
                                    className="bg-red-500 text-white px-2 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    onClick={handleLeaveChat}
                                >
                                    Leave Chat
                                </button>
                            }
                            {x.userId === chatOwnerId && user._id === chatOwnerId && (
                                <button
                                    className="bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    onClick={handleDeleteChat}
                                >
                                    Delete Chat
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Chat;
