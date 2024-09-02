import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userStore from '../store/userStore';
import icon from '../images/icon.png';
import Notifications from './notifications';
import socket from '../plugins/sockets';

const Toolbar = () => {
    const { user, clearUser } = userStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
    const nav = useNavigate();

    // Refs for menu and burger menu
    const menuRef = useRef(null);
    const burgerMenuRef = useRef(null);

    useEffect(() => {
        // Close menu if user clicks outside of it
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (burgerMenuRef.current && !burgerMenuRef.current.contains(event.target)) {
                setBurgerMenuOpen(false);
            }
        }

        // Attach event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [user]);

    function handleLogout() {
        localStorage.removeItem('token');
        clearUser();
        socket.emit('userOffline', user._id);
        nav('/login');
    }

    return (
        <div className='flex justify-between p-5 max-h-[80px] mb-8 bg-white shadow-lg relative items-center'>
            {/* Logo and Burger Menu Button */}
            <div className='flex gap-3 items-center'>
                <div className='flex gap-3 items-center hidden sm:flex'>
                    <img className='w-[50px]' src={icon} alt="logo" />
                </div>
                <button
                    className='block sm:hidden text-3xl'
                    onClick={() => setBurgerMenuOpen(!burgerMenuOpen)}
                >
                    ☰
                </button>
            </div>

            {/* Desktop Menu */}
            <div className='flex gap-8 items-center hidden sm:flex'>
                {user && (
                    <>
                        <div onClick={() => nav('/')} className='text-3xl decoration-2 cursor-pointer'>Home</div>
                        <div onClick={() => nav('/conversations')} className='text-3xl cursor-pointer decoration-2'>Conversations</div>
                    </>
                )}
            </div>

            {/* Notifications and User Menu */}
            <div className='flex gap-3 items-center'>
                {user && (
                    <div className='relative flex gap-3' ref={menuRef}>
                        <div
                            className='flex gap-3 items-center cursor-pointer'
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <p className='text-3xl'>{user.username}</p>
                            <img className='w-[50px] h-[50px] border-4 border-primary rounded-full' src={user.photo} alt="user" />
                        </div>
                        <Notifications />
                        {menuOpen && (
                            <div className='absolute right-0 top-28 w-48 bg-white shadow-lg py-2 z-20'>
                                <button
                                    className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                                    onClick={() => {
                                        setMenuOpen(false);
                                        nav('/profile');
                                    }}
                                >
                                    Profile
                                </button>
                                <button
                                    className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {!user && <button className='btn' onClick={() => nav('/login')}>Login</button>}
                {!user && <button className='btn' onClick={() => nav('/register')}>Register</button>}
            </div>

            {/* Burger Menu */}
            {burgerMenuOpen && (
                <div className='absolute top-32 left-[20px] w-[70%] bg-white shadow-lg py-2 z-20 sm:hidden' ref={burgerMenuRef}>
                    {user && (
                        <>
                            <button
                                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                                onClick={() => {
                                    setBurgerMenuOpen(false);
                                    nav('/');
                                }}
                            >
                                Home
                            </button>
                            <button
                                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'
                                onClick={() => {
                                    setBurgerMenuOpen(false);
                                    nav('/conversations');
                                }}
                            >
                                Conversations
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Toolbar;
