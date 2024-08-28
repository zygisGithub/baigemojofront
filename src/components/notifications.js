import React, { useEffect, useState } from 'react';
import socket from '../plugins/sockets'; // Import shared socket instance
import userStore from '../store/userStore';
import axios from 'axios'; // Import axios to make API calls
import config from '../plugins/hosted'
const apiUrl = config.baseUrl;
const Notifications = () => {
    const { user } = userStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Fetch existing notifications when the component mounts
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/users/notifications/${user._id}`);
                setNotifications(response.data.notifications);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [user]);

    // Listen for new notifications via socket.io
    useEffect(() => {
        socket.on('newNotification', (notification) => {
            if (notification.userId === user._id) {
                setNotifications((prevNotifications) => [...prevNotifications, notification]);
            }
        });

        return () => {
            socket.off('newNotification');
        };
    }, [user._id]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        console.log(notifications);
    };

    return (
        <div className="relative">
            <div
                className="flex text-3xl items-center"
                onClick={toggleMenu}
            >
                <svg className='w-[50px] pt-0' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                    <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                          d="M38.5,35.5c1.5,0,2.4-1.5,1.8-2.9L38,28.1c-0.3-0.7-0.5-1.5-0.5-2.2V19c0-7.7-6.4-13.8-14.2-13.5	c-5.1,0.2-9.4,3.4-11.5,7.8"></path>
                    <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                          d="M10.5,21.7l0,4.1c0,0.8-0.2,1.5-0.5,2.2l-2.3,4.6C7.1,34,8,35.5,9.5,35.5h21.9"></path>
                    <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                          d="M26.9,40.4c-0.8,0.7-1.8,1.1-2.9,1.1c-2.5,0-4.5-2-4.5-4.5"></path>
                </svg>
                {notifications.length > 0 && (
                    <span>
                        ({notifications.length})
                    </span>
                )}
            </div>

            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg">
                    <div className="p-4">
                        <h3 className="font-bold">Notifications</h3>
                        {notifications.length === 0 ? (
                            <p>No new notifications</p>
                        ) : (
                            notifications.map((notification, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border-b">
                                    <p>{notification.content}</p>
                                    {notification.type === 'request' &&
                                        <button className="text-sm text-blue-600">Accept</button>
                                    }
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
