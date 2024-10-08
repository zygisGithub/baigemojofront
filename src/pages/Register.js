import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../plugins/hosted';

const apiUrl = config.baseUrl;

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [errors, setErrors] = useState([]); // Changed from a single error to an array
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors([]); // Clear previous errors

        const data = {
            username,
            password,
            passwordRepeat
        };

        try {
            const response = await axios.post(`${apiUrl}/api/users/register`, data);
            if (response.status === 201) {
                navigate('/login');
            }
        } catch (err) {
            // Handle errors by setting the errors state
            setErrors(err.response?.data?.errors || ['Registration failed']); // Expecting errors as an array
        }
    };

    return (
        <form onSubmit={handleRegister} className="max-w-md mx-auto flex flex-col items-center p-4">
            <h1 className='mb-3 text-2xl'>Register</h1>
            <label className="input input-bordered flex items-center gap-2 mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"/>
                </svg>
                <input
                    type="text"
                    className="grow p-2"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </label>

            <label className="input input-bordered flex items-center gap-2 mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                        fillRule="evenodd"
                        d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                        clipRule="evenodd"
                    />
                </svg>
                <input
                    type="password"
                    className="grow p-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </label>

            <label className="input input-bordered flex items-center gap-2 mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70">
                    <path
                        fillRule="evenodd"
                        d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                        clipRule="evenodd"
                    />
                </svg>
                <input
                    type="password"
                    className="grow p-2"
                    placeholder="Repeat password"
                    value={passwordRepeat}
                    onChange={(e) => setPasswordRepeat(e.target.value)}
                    required
                />
            </label>

            {errors.length > 0 && (
                <div className="text-red-500 mb-4 text-center">
                    {errors.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}

            <button type="submit" className="btn btn-primary">
                Register
            </button>
        </form>
    );
}

export default Register;
