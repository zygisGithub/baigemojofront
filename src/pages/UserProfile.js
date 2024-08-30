import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../plugins/hosted';
import socket from "../plugins/sockets";

const apiUrl = config.baseUrl;

const UserProfile = () => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const { username } = useParams();
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/getUserByUsername/${username}`);
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    const startChat = async () => {
        try {
            // Retrieve token from local storage
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${apiUrl}/api/users/startChat`,
                { userId: user._id },
                { headers: { Authorization: `Bearer ${token}` } } // Include token in headers
            );
            socket.emit('sendNotification', response.data.notification)
            const chatId = response.data.chat._id;
            navigate(`/chat/${chatId}`);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <p>Username: {user.username}</p>
            <button onClick={startChat}>Chat</button>
        </div>
    );
};

export default UserProfile;
