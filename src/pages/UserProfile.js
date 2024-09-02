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
    const [showModal, setShowModal] = React.useState(false);
    const [chatName, setChatName] = React.useState('');
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

        // Listen to the profilePhotoChanged event
        socket.on('profilePhotoChanged', ({ userId, photoUrl }) => {
            if (user && user._id === userId) {
                setUser(prevState => ({
                    ...prevState,
                    photo: photoUrl
                }));
            }
        });

        // Cleanup the event listener on unmount
        return () => {
            socket.off('profilePhotoChanged');
        };
    }, [username, user]);

    const handleStartChatClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            setShowModal(false);
        }
    };

    const handleChatNameChange = (e) => {
        setChatName(e.target.value);
    };

    const handleStartChat = async () => {
        if (!chatName.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/api/users/startChat`,
                { userId: user._id, chatName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            socket.emit('sendNotification', response.data.notification);
            const chatId = response.data.chat._id;
            navigate(`/chat/${chatId}`);
            setShowModal(false);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <div className='flex items-center gap-8 flex-col'>
                <p className='text-5xl'>{user.username}</p>
                <img className='rounded-full w-32 h-32 object-cover border-4 border-gray-300 shadow-md' src={user.photo} alt="Profile"/>
                <button className='btn btn-primary' onClick={handleStartChatClick}>Start Chat</button>
            </div>

            {showModal && (
                <div className='modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' onClick={handleCloseModal}>
                    <div className='modal-container bg-white p-8 rounded shadow-lg' onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            placeholder="Type chat name here"
                            className="input input-bordered w-full max-w-xs mb-4"
                            value={chatName}
                            onChange={handleChatNameChange}
                        />
                        <button className='btn btn-primary' onClick={handleStartChat}>Start Chat</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
