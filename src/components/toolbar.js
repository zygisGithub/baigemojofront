import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import userStore from "../store/userStore";
import icon from '../images/icon.png';
import Notifications from "./notifications";

const Toolbar = () => {
    const { user, clearUser } = userStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const nav = useNavigate();
    useEffect(function (){
        setMenuOpen(false)
    },[user])
    function handleLogout() {
        localStorage.removeItem('token');
        clearUser();
        nav('/login');
    }

    return (
        <div className='flex justify-between p-5 mb-8 bg-white shadow-lg relative items-center'>
            <div className='flex gap-3 items-center hidden sm:flex'>
                <img className='w-[50px]' src={icon} alt=""/>
            </div>
            <div className='flex gap-8 items-center'>
                {user &&
                    <div onClick={() => nav('/')} className='text-3xl decoration-2 cursor-pointer'>Home</div>
                }
                {user &&
                    <div onClick={() => nav('/conversations')} className='text-3xl cursor-pointer decoration-2'>Conversations</div>
                }
            </div>
            <div className='flex gap-3'>
                {user &&
                    <div className='relative flex gap-3'>
                        <div
                            className='flex gap-3 items-center cursor-pointer'
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <p className='text-3xl'>{user.username}</p>
                            <img className='w-[50px] border-4 border-primary rounded-full' src={user.photo} alt=""/>
                        </div>
                        <Notifications/>
                        {menuOpen && (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10'>
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
                }
                {!user && <button className='btn' onClick={() => nav('/login')}>Login</button>}
                {!user && <button className='btn' onClick={() => nav('/register')}>Register</button>}
            </div>
        </div>
    );
};

export default Toolbar;
