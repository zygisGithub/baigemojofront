import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import config from '../plugins/hosted';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import userStore from '../store/userStore';

const apiUrl = config.baseUrl;
const socket = io(apiUrl);

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(true);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [participants, setParticipants] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]); // State for online users
    const { user } = userStore();
    const { conversationId } = useParams();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            socket.emit('userOnline', user._id);
        }
        socket.emit('joinChat', conversationId);

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/messages/${conversationId}`);
                setMessages(response.data.messages);
                setParticipants(response.data.participants);
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

        const handleNewUser = () => fetchUsers();
        const handleAddUser = (chatId) => {
            if (chatId === conversationId) {
                fetchUsers();
                axios.get(`${apiUrl}/api/users/messages/${conversationId}`)
                    .then(res => setParticipants(res.data.participants))
                    .catch(error => console.error('Error fetching participants:', error));
            }
        };
        const handleNewMessage = (message) => {
            if (message.chatId === conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        };
        const handleUpdateOnlineUsers = (userIds) => {
            console.log(userIds)
            setOnlineUsers(userIds);
        };

        socket.on('newUser', handleNewUser);
        socket.on('addUser', handleAddUser);
        socket.on('newMessage', handleNewMessage);
        socket.on('updateOnlineUsers', handleUpdateOnlineUsers);

        fetchMessages();
        fetchUsers();

        return () => {
            socket.emit('leaveChat', conversationId);
            socket.off('newMessage');
            socket.off('addUser');
            socket.off('newUser');
        };
    }, [conversationId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async () => {
        try {
            const response = await axios.post(`${apiUrl}/api/users/sendMessageChat`, {
                chatId: conversationId,
                senderId: user._id,
                content: newMessage,
            });

            response.data.notifications.forEach(notification => {
                socket.emit('sendNotification', notification);
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    const handleAddUser = async (userId) => {
        try {
            const response = await axios.post(`${apiUrl}/api/users/addParticipants`, {
                chatId: conversationId,
                newParticipant: [userId],
                user: user,
            });

            socket.emit('sendNotification', response.data.notification);
            socket.emit('addUser', conversationId);
            setShowAddUserModal(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const filteredUsers = users.filter(u =>
        !participants.some(p => p.username === u.username) &&
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen mb-4 max-h-[600px]">
            {/* Users Section */}
            <div className="flex flex-col flex-1 bg-gray-50 rounded-lg shadow-md p-4 mr-4">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                <input
                    type="text"
                    className="mb-4 p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="overflow-y-auto max-h-[500px]">
                    {filteredUsers.map((x) => (
                        <div key={x._id} className="flex items-center gap-3 mb-4">
                            <img className={`rounded-full w-[40px] h-[40px] ${onlineUsers.includes(x._id) ? 'border-primary border-2' : ''}`} src={x.photo} alt="" />
                            <p className="text-lg">{x.username} {onlineUsers.includes(x._id) && <span className="text-green-500">Active</span>}</p>
                            <button
                                className="ml-auto bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                                onClick={() => handleAddUser(x._id)}
                            >
                                Add to chat
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Section */}
            <div className="flex flex-col bg-white rounded-lg shadow-md p-4 max-h-screen relative" style={{flex: '3'}}>
                {/* Messages */}
                <div className="flex-grow overflow-y-auto mb-16 h-[100%]">
                    {messages.map((msg, index) => {
                        const isSameSenderAsPrevious = index > 0 && messages[index - 1].senderId === msg.senderId;
                        return (
                            <div key={index} className={`mb-3 ${isSameSenderAsPrevious ? 'mt-[-10px]' : 'mt-4'}`}>
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
                                    <p className="bg-gray-100 p-3 rounded-lg shadow-sm inline-block">{msg.content}</p>
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

            {/* Participants Section */}
            <div className="flex flex-col flex-1 bg-gray-50 rounded-lg shadow-md p-4 ml-4">
                <h2 className="text-xl font-semibold mb-4">Participants</h2>
                <div className="overflow-y-auto max-h-[500px]">
                    {participants.map((x, i) => (
                        <div key={i} className="flex items-center gap-3 mb-4">
                            <img className={`rounded-full w-[40px] h-[40px] ${onlineUsers.includes(x.userId) ? 'border-primary border-2' : ''}`} src={x.photo} alt="" />
                            <p className="text-lg">{x.username} {onlineUsers.includes(x.userId) && <span className="text-green-500">Active</span>}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Chat;
