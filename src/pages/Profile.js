import React, {useEffect, useRef, useState} from 'react';
import userStore from "../store/userStore";
import axios from "axios";
import socket from "../plugins/sockets";
import config from "../plugins/hosted";
const apiUrl = config.baseUrl;

const Profile = () => {
    const { user } = userStore();
    const [friendRequests, setFriendRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('friends'); // State to manage the active tab
    const [newPhoto, setNewPhoto] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const photoUrl = useRef()

    useEffect(() => {
        // Listen for friend request notifications
        socket.on('friendRequest', (data) => {
            setFriendRequests((prevRequests) => [...prevRequests, data.senderId]);
        });

        socket.on('friendRequestAccepted', (data) => {
            // Handle the case when a friend request is accepted
            console.log(`Friend request accepted by ${data.friendId}`);
        });

        return () => {
            socket.off('friendRequest');
            socket.off('friendRequestAccepted');
        };
    }, []);

    const acceptRequest = (senderId) => {
        axios.post(`${apiUrl}/api/users/acceptFriendRequest`, {
            userId: user._id,
            friendId: senderId
        }).then(response => {
            console.log(response.data.message);
            setFriendRequests(friendRequests.filter(id => id !== senderId));
        }).catch(error => {
            console.error('Error accepting friend request', error);
        });
    };

    const handleChangePhoto = () => {

        axios.post(`${apiUrl}/api/users/changePhoto`, photoUrl.current.value, {
        }).then(response => {
            console.log(response.data.message);
        }).catch(error => {
            console.error('Error changing photo', error);
        });
    };

    const handleChangeUsername = () => {
        if (!oldPassword || !newUsername) {
            console.error('Old password and new username are required');
            return;
        }
        axios.post(`${apiUrl}/api/users/changeUsername`, {
            userId: user._id,
            newUsername,
            oldPassword
        }).then(response => {
            console.log(response.data.message);
        }).catch(error => {
            console.error('Error changing username', error);
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
        axios.post(`${apiUrl}/api/users/changePassword`, {
            userId: user._id,
            oldPassword,
            newPassword
        }).then(response => {
            console.log(response.data.message);
        }).catch(error => {
            console.error('Error changing password', error);
        });
    };

    return (
        <div>
            <div className='flex justify-center gap-8'>
                <div className='flex flex-col items-center gap-8'>
                    <img src={user.photo} alt="Profile" className="rounded-full w-24 h-24"/>
                    <h1>{user.username}</h1>
                </div>
                <div className='flex flex-col w-1/2'>
                    <div className='flex gap-4 mb-4'>
                        <button
                            className={`p-2 ${activeTab === 'friends' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => setActiveTab('friends')}
                        >
                            Friends List
                        </button>
                        <button
                            className={`p-2 ${activeTab === 'requests' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => setActiveTab('requests')}
                        >
                            Friend Requests
                        </button>
                        <button
                            className={`p-2 ${activeTab === 'changePhoto' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => setActiveTab('changePhoto')}
                        >
                            Change Photo
                        </button>
                        <button
                            className={`p-2 ${activeTab === 'changeUsername' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => setActiveTab('changeUsername')}
                        >
                            Change Username
                        </button>
                        <button
                            className={`p-2 ${activeTab === 'changePassword' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
                            onClick={() => setActiveTab('changePassword')}
                        >
                            Change Password
                        </button>
                    </div>
                    <div>
                        {activeTab === 'friends' && (
                            <div>
                                <h1>Friends list:</h1>
                                {user.friends.length > 0 ? (
                                    user.friends.map((x, i) => (
                                        <div key={i}>{x}</div>
                                    ))
                                ) : (
                                    <p>No friends added yet.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'requests' && (
                            <div>
                                <h1>Friend requests:</h1>
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
                                    <p>No friend requests.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'changePhoto' && (
                            <div>
                                <h1>Change Profile Photo:</h1>
                                <label className="input input-bordered flex items-center gap-2">
                                    Photo url
                                    <input ref={photoUrl} type="text" className="grow"/>
                                </label>
                                <button
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                    onClick={handleChangePhoto}
                                >
                                    Change Photo
                                </button>
                            </div>
                        )}
                        {activeTab === 'changeUsername' && (
                            <div>
                                <h1>Change Username:</h1>
                                <label className="input input-bordered flex items-center gap-2">
                                    New Username
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="grow"
                                    />
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                    Password
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="grow"
                                    />
                                </label>
                                <button
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                    onClick={handleChangeUsername}
                                >
                                    Change Username
                                </button>
                            </div>
                        )}
                        {activeTab === 'changePassword' && (
                            <div>
                                <h1>Change Password:</h1>
                                <label className="input input-bordered flex items-center gap-2">
                                    Old Password
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="grow"
                                    />
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                    New Password
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="grow"
                                    />
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                    Repeat New Password
                                    <input
                                        type="password"
                                        value={repeatNewPassword}
                                        onChange={(e) => setRepeatNewPassword(e.target.value)}
                                        className="grow"
                                    />
                                </label>
                                <button
                                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                                    onClick={handleChangePassword}
                                >
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
