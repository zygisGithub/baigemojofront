import React, { useEffect, useRef, useState } from 'react';
import userStore from '../store/userStore';
import axios from 'axios';
import socket from '../plugins/sockets';
import config from '../plugins/hosted';
import { FaCamera, FaUser, FaKey, FaUserFriends, FaUserPlus } from 'react-icons/fa';
const apiUrl = config.baseUrl;

const Profile = () => {
    const { user } = userStore();
    const [friendRequests, setFriendRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('friends');
    const [newPhoto, setNewPhoto] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const photoUrl = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        socket.on('friendRequest', (data) => {
            setFriendRequests((prevRequests) => [...prevRequests, data.senderId]);
        });

        socket.on('friendRequestAccepted', (data) => {
            console.log(`Friend request accepted by ${data.friendId}`);
        });

        return () => {
            socket.off('friendRequest');
            socket.off('friendRequestAccepted');
        };
    }, []);

    const acceptRequest = (senderId) => {
        setLoading(true);
        axios.post(`${apiUrl}/api/users/acceptFriendRequest`, {
            userId: user._id,
            friendId: senderId
        }).then(response => {
            console.log(response.data.message);
            setFriendRequests(friendRequests.filter(id => id !== senderId));
            setLoading(false);
        }).catch(error => {
            console.error('Error accepting friend request', error);
            setLoading(false);
        });
    };

    const handleChangePhoto = () => {
        setLoading(true);
        axios.post(`${apiUrl}/api/users/changePhoto`, photoUrl.current.value)
            .then(response => {
                console.log(response.data.message);
                setLoading(false);
            }).catch(error => {
            console.error('Error changing photo', error);
            setLoading(false);
        });
    };

    const handleChangeUsername = () => {
        if (!oldPassword || !newUsername) {
            console.error('Old password and new username are required');
            return;
        }
        setLoading(true);
        axios.post(`${apiUrl}/api/users/changeUsername`, {
            userId: user._id,
            newUsername,
            oldPassword
        }).then(response => {
            console.log(response.data.message);
            setLoading(false);
        }).catch(error => {
            console.error('Error changing username', error);
            setLoading(false);
        });
    };

    const handleChangePassword = () => {
        if (newPassword !== repeatNewPassword) {
            console.error('New passwords do not match');
            return;
        }
        if (!oldPassword || !newPassword) {
            console.error('All fields are required');
            return;
        }
        setLoading(true);
        axios.post(`${apiUrl}/api/users/changePassword`, {
            userId: user._id,
            oldPassword,
            newPassword
        }).then(response => {
            console.log(response.data.message);
            setLoading(false);
        }).catch(error => {
            console.error('Error changing password', error);
            setLoading(false);
        });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-center mb-8">
                <div className="flex flex-col items-center gap-4">
                    <img src={user.photo} alt="Profile" className="rounded-full w-32 h-32 object-cover border-4 border-gray-300 shadow-md" />
                    <h1 className="text-2xl font-semibold">{user.username}</h1>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-lg font-bold mb-4">Profile Actions</h2>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md ${activeTab === 'friends' ? 'bg-blue-500 text-white' : 'bg-gray-200'} mb-2`}
                        onClick={() => setActiveTab('friends')}
                    >
                        <FaUserFriends /> Friends List
                    </button>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md ${activeTab === 'requests' ? 'bg-blue-500 text-white' : 'bg-gray-200'} mb-2`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <FaUserPlus /> Friend Requests
                    </button>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md ${activeTab === 'changePhoto' ? 'bg-blue-500 text-white' : 'bg-gray-200'} mb-2`}
                        onClick={() => setActiveTab('changePhoto')}
                    >
                        <FaCamera /> Change Photo
                    </button>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md ${activeTab === 'changeUsername' ? 'bg-blue-500 text-white' : 'bg-gray-200'} mb-2`}
                        onClick={() => setActiveTab('changeUsername')}
                    >
                        <FaUser /> Change Username
                    </button>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md ${activeTab === 'changePassword' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab('changePassword')}
                    >
                        <FaKey /> Change Password
                    </button>
                </div>
                <div className="w-full md:w-3/4 bg-white shadow-md rounded-lg p-4">
                    {activeTab === 'friends' && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">Friends List</h2>
                            {user.friends.length > 0 ? (
                                user.friends.map((friend, i) => (
                                    <div key={i} className="p-2 border-b">{friend}</div>
                                ))
                            ) : (
                                <p className="text-gray-500">No friends added yet.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'requests' && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">Friend Requests</h2>
                            {friendRequests.length > 0 ? (
                                friendRequests.map((senderId, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 border-b">
                                        <p>{senderId} sent you a friend request.</p>
                                        <button
                                            className="text-sm text-blue-600"
                                            onClick={() => acceptRequest(senderId)}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No friend requests.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'changePhoto' && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">Change Profile Photo</h2>
                            <label className="block mb-2">
                                <span className="text-gray-700">Photo URL</span>
                                <input ref={photoUrl} type="text" className="form-input mt-1 block w-full" />
                            </label>
                            <button
                                className={`mt-2 p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded`}
                                onClick={handleChangePhoto}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Photo'}
                            </button>
                        </div>
                    )}
                    {activeTab === 'changeUsername' && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">Change Username</h2>
                            <label className="block mb-2">
                                <span className="text-gray-700">New Username</span>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="form-input mt-1 block w-full"
                                />
                            </label>
                            <label className="block mb-4">
                                <span className="text-gray-700">Password</span>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="form-input mt-1 block w-full"
                                />
                            </label>
                            <button
                                className={`mt-2 p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded`}
                                onClick={handleChangeUsername}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Username'}
                            </button>
                        </div>
                    )}
                    {activeTab === 'changePassword' && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">Change Password</h2>
                            <label className="block mb-2">
                                <span className="text-gray-700">Old Password</span>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="form-input mt-1 block w-full"
                                />
                            </label>
                            <label className="block mb-2">
                                <span className="text-gray-700">New Password</span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="form-input mt-1 block w-full"
                                />
                            </label>
                            <label className="block mb-4">
                                <span className="text-gray-700">Repeat New Password</span>
                                <input
                                    type="password"
                                    value={repeatNewPassword}
                                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                                    className="form-input mt-1 block w-full"
                                />
                            </label>
                            <button
                                className={`mt-2 p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded`}
                                onClick={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
