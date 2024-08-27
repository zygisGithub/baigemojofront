import React, {useEffect, useState} from 'react';
import userStore from "../store/userStore";
import axios from "axios";
import io from "socket.io-client";
const socket = io('http://localhost:3001');

const Profile = () => {
    const { user } = userStore();
    const [friendRequests, setFriendRequests] = useState([]);

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
        axios.post('http://localhost:3001/api/users/acceptFriendRequest', {
            userId: user._id,
            friendId: senderId
        }).then(response => {
            console.log(response.data.message);
            setFriendRequests(friendRequests.filter(id => id !== senderId));
        }).catch(error => {
            console.error('Error accepting friend request', error);
        });
    };
    return (
        <div>
            <div>
                <h1>Friend requests:</h1>
                {user.friendRequests.map((senderId, index) =>
                    <div key={index} className="flex justify-between items-center p-2 border-b">
                        <p>{senderId} sent you a friend request.</p>
                        <button
                            className="text-sm text-blue-600"
                            onClick={() => acceptRequest(senderId)}
                        >
                            Accept
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;