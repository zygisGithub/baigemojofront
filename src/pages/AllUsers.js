import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../plugins/sockets'; // Import shared socket instance
import AllChat from "../components/allChat";
import userStore from "../store/userStore";
import { useNavigate } from "react-router-dom";
import config from '../plugins/hosted';

const apiUrl = config.baseUrl;

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUsers, setShowUsers] = useState(false);
    const { user } = userStore();
    const nav = useNavigate();

    useEffect(() => {
        // Fetch users when component mounts
        const getUsers = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/getUsers`);
                setUsers(response.data.users);
            } catch (error) {
                console.error('There was an error!', error);
            }
        };

        getUsers();

        socket.on('newUser', () => {
            getUsers();
        });

        // Listen for online users updates
        socket.on('updateOnlineUsers', (userIds) => {
            setOnlineUsers(userIds);
        });

        // Inform the server about user going online
        if (user) {
            socket.emit('userOnline', user._id);
        }

    }, [user]);


    // Filter out the current user from the list
    const filteredUsers = users
        .filter(u => u._id !== user._id)
        .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    // Determine if the user is typing
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setShowUsers(e.target.value.length > 0);
    };

    return (
        <div className='flex p-4 gap-3 flex-col md:flex-row'>
            <div className='flex flex-col bg-gray-50 rounded-lg shadow-md p-4 md:w-1/4'>
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='mb-4 p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300'
                />
                {showUsers && (
                    <>
                        {filteredUsers.length === 0 ? (
                            <span className="loading loading-ring loading-lg"></span>
                        ) : (
                            <div className='flex flex-col gap-3'>
                                {filteredUsers.map((x, i) => (
                                    <div key={i}
                                         className='user-card p-4 border rounded shadow-sm flex items-center justify-between'>
                                        <img
                                            onClick={() => nav(`user/${x.username}`)}
                                            className={`w-12 h-12 rounded-full ${onlineUsers.includes(x._id) ? 'border-primary border-2' : ''}`}
                                            src={x.photo}
                                            alt={x.username}
                                        />
                                        <div className='flex-1 ml-4'>
                                            <p onClick={() => nav(`user/${x.username}`)}
                                               className='font-semibold'>{x.username}</p>
                                            {onlineUsers.includes(x._id) &&
                                                <span className="text-green-500">Active</span>}
                                        </div>
                                        {x._id !== user._id &&
                                            <button
                                                onClick={() => nav(`user/${x.username}`)}
                                                className='btn bg-blue-500 text-white py-1 px-3 rounded'
                                            >
                                                Visit profile
                                            </button>
                                        }
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <AllChat/>
        </div>
    );
};

export default AllUsers;
