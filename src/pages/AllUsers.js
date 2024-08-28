import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../plugins/sockets'; // Import shared socket instance
import AllChat from "../components/allChat";
import userStore from "../store/userStore";
import config from '../plugins/hosted'
const apiUrl = config.baseUrl;

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const {user} = userStore()

    const getUsers = () => {
        axios.get(`${apiUrl}/api/users/getUsers`)
            .then(response => {
                console.log(response.data);
                setUsers(response.data.users)
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    useEffect(() => {
        getUsers();

        socket.on('newUser', (newUser) => {
            setUsers((prevUsers) => [...prevUsers, newUser]);
        });

        return () => {
            socket.off('newUser');
        };
    }, []);

    const sendFriendRequest = (receiverId) => {
        axios.post(`${apiUrl}/api/users/sendFriendRequest`, {
            senderId: user._id,
            receiverId
        }).then(response => {
            console.log(response.data.message);
        }).catch(error => {
            console.error('Error sending friend request', error);
        });
    };

    return (
        <div className='flex justify-center'>
            {user && <AllChat/>}
            {users.length === 0 ? (
                <span className="loading loading-ring loading-lg"></span>
            ) : (
                <div className='flex flex-col flex-1'>
                    {users.map((x, i) => (
                        <div key={i}>
                            <p>{x.username}</p>
                            <img src={x.photo} alt={x.username} />
                            {x._id !== user._id &&
                                <button onClick={()=>sendFriendRequest(x._id)} className='btn btn-primary'>Add friend</button>
                            }
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllUsers;
