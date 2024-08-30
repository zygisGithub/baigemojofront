import React from 'react';
import socket from "../plugins/sockets";
const Test = () => {
    const not = {
        userId: '66cdbe53028e792d9436e802',
        type: 'reaction',
        content: 'asdasdasdasdasd'
    }
    function test () {
        socket.emit('sendNotification', not);
    }

    return (
        <div>
            <button onClick={test}>test</button>
        </div>
    );
};

export default Test;