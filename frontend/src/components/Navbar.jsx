import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-indigo-600">Freelance Marketplace</Link>

                <div className="flex items-center space-x-4">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Log In</Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium">Sign Up</Link>
                        </>
                    ) : (
                        <div className="flex items-center space-x-6">
                            <span className="text-sm text-gray-500 font-medium hidden sm:block">Role: {user.role}</span>

                            {user.role === 'client' && (
                                <Link to="/client-dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                            )}
                            {user.role === 'freelancer' && (
                                <Link to="/freelancer-dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
                            )}

                            <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600 transition font-medium">
                                <LogOut className="w-5 h-5 mr-1" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
