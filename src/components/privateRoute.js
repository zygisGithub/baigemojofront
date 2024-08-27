import React from 'react';
import { Navigate } from 'react-router-dom';
import userStore from "../store/userStore";

const PrivateRoute = ({ children }) => {
    const { user } = userStore();
    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
