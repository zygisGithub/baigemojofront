import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AllUsers from './pages/AllUsers';
import UserProfile from './pages/UserProfile';
import Conversations from './pages/Conversations';
import Chat from './pages/Chat';
import Toolbar from "./components/toolbar";
import userStore from "./store/userStore";
import PrivateRoute from './components/privateRoute';
import {useEffect} from "react";

function App() {
    const { user, setUser } = userStore();
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');

        if (token) {
            if (userString) {
                try {
                    const parsedUser = JSON.parse(userString);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                }
            }
        }
    }, [setUser]);
    return (
        <div className='min-h-screen flex flex-col'>
            <Router>
                <Toolbar />
                <div className='flex-grow'>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />

                        {/* Private Routes */}
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <AllUsers />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/user/:username"
                            element={
                                <PrivateRoute>
                                    <UserProfile />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/conversations"
                            element={
                                <PrivateRoute>
                                    <Conversations />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/chat/:conversationId"
                            element={
                                <PrivateRoute>
                                    <Chat />
                                </PrivateRoute>
                            }
                        />

                        {/* Redirect any unknown route to login */}
                        <Route
                            path="*"
                            element={<Navigate to={user ? "/" : "/login"} />}
                        />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
