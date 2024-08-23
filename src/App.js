import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AllUsers from './pages/AllUsers';
import UserProfile from './pages/UserProfile';
import Conversations from './pages/Conversations';
import Chat from './pages/Chat';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<AllUsers />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
        </Routes>
      </Router>
  );
}

export default App;
