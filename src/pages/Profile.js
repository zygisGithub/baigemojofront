import React, { useRef, useState } from 'react';
import userStore from '../store/userStore';
import axios from 'axios';
import config from '../plugins/hosted';
import { FaCamera, FaUser, FaKey } from 'react-icons/fa';

const apiUrl = config.baseUrl;

const Profile = () => {
    const [error, setError] = useState([]);
    const { user, updateUserPhoto, setUser } = userStore();
    const [activeTab, setActiveTab] = useState('changePhoto');
    const [newUsername, setNewUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const photoUrl = useRef(null);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token') || '';

    const handleChangePhoto = async () => {
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/api/users/changePhoto`,
                { photoUrl: photoUrl.current.value, userId: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            updateUserPhoto(photoUrl.current.value);
            setError(['Photo updated successfully']);
        } catch (error) {
            setError([error.response?.data?.errors || 'Failed to update photo']);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeUsername = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/users/changeUsername`,
                { userId: user._id, newUsername, oldPassword, oldUsername: user.username },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const updatedUser = { ...user, username: newUsername }
            localStorage.setItem('user', JSON.stringify(updatedUser))

            setUser(updatedUser);
            setError(['Username updated successfully']);
            setNewUsername('')
            setOldPassword('')
        } catch (error) {
            setError([error.response?.data?.errors || 'Failed to update username']);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/api/users/changePassword`,
                { userId: user._id, oldPassword, newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setError(['Password updated successfully']);
        } catch (error) {
            setError([error.response?.data?.errors || 'Failed to update password']);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError([]);  // Reset errors when changing tabs
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-center mb-8">
                <div className="flex flex-col items-center gap-4">
                    <img
                        src={user.photo}
                        alt="Profile"
                        className="rounded-full w-32 h-32 object-cover border-4 border-gray-300 shadow-md"
                    />
                    <h1 className="text-2xl md:text-3xl font-semibold">{user.username}</h1>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-lg md:text-xl font-bold mb-4">Profile Actions</h2>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md w-full ${activeTab === 'changePhoto' ? 'bg-blue-500 text-white' : 'bg-gray-200'} mb-2`}
                        onClick={() => handleTabChange('changePhoto')}
                    >
                        <FaCamera className="text-lg md:text-xl" /> <span className="text-sm md:text-base">Change Photo</span>
                    </button>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md w-full ${activeTab === 'changeUsername' ? 'bg-blue-500 text-white' : 'bg-gray-200'} mb-2`}
                        onClick={() => handleTabChange('changeUsername')}
                    >
                        <FaUser className="text-lg md:text-xl" /> <span className="text-sm md:text-base">Change Username</span>
                    </button>
                    <button
                        className={`flex items-center gap-2 p-2 rounded-md w-full ${activeTab === 'changePassword' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => handleTabChange('changePassword')}
                    >
                        <FaKey className="text-lg md:text-xl" /> <span className="text-sm md:text-base">Change Password</span>
                    </button>
                </div>
                <div className="w-full md:w-3/4 bg-white shadow-md rounded-lg p-4">
                    {activeTab === 'changePhoto' && (
                        <div>
                            <h2 className="text-lg md:text-xl font-bold mb-4">Change Profile Photo</h2>
                            <label className="input input-bordered flex items-center gap-2 mb-4">
                                <span className="text-sm md:text-base">Photo URL</span>
                                <input ref={photoUrl} type="text" className="grow text-sm md:text-base" />
                            </label>
                            <button
                                className={`mt-2 p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded text-sm md:text-base`}
                                onClick={handleChangePhoto}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Photo'}
                            </button>
                        </div>
                    )}
                    {activeTab === 'changeUsername' && (
                        <div>
                            <h2 className="text-lg md:text-xl font-bold mb-4">Change Username</h2>
                            <label className="input input-bordered flex items-center gap-2 mb-4">
                                <span className="text-sm md:text-base">New Username</span>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="grow text-sm md:text-base"
                                />
                            </label>
                            <label className="input input-bordered flex items-center gap-2 mb-4">
                                <span className="text-sm md:text-base">Password</span>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="grow text-sm md:text-base"
                                />
                            </label>
                            <button
                                className={`mt-2 p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded text-sm md:text-base`}
                                onClick={handleChangeUsername}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Username'}
                            </button>
                        </div>
                    )}
                    {activeTab === 'changePassword' && (
                        <div>
                            <h2 className="text-lg md:text-xl font-bold mb-4">Change Password</h2>
                            <label className="input input-bordered flex items-center gap-2 mb-4">
                                <span className="text-sm md:text-base">Old Password</span>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="grow text-sm md:text-base"
                                />
                            </label>
                            <label className="input input-bordered flex items-center gap-2 mb-4">
                                <span className="text-sm md:text-base">New Password</span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="grow text-sm md:text-base"
                                />
                            </label>
                            <label className="input input-bordered flex items-center gap-2 mb-4">
                                <span className="text-sm md:text-base">Repeat New Password</span>
                                <input
                                    type="password"
                                    value={repeatNewPassword}
                                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                                    className="grow text-sm md:text-base"
                                />
                            </label>
                            <button
                                className={`mt-2 p-2 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded text-sm md:text-base`}
                                onClick={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    )}
                    {error.length > 0 && (
                        <div className="mt-4">
                            {error.map((msg, index) => (
                                <p key={index} className="text-red-500 text-sm md:text-base">{msg}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
