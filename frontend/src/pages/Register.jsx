import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '', password: '', role: 'client', company_name: '', bio: '', hourly_rate: '', experience_years: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            email: formData.email,
            password: formData.password,
            role: formData.role,
            profile_data: formData.role === 'client'
                ? { company_name: formData.company_name }
                : { bio: formData.bio, hourly_rate: parseFloat(formData.hourly_rate), experience_years: parseInt(formData.experience_years) }
        };

        try {
            const user = await register(payload);
            if (user.role === 'client') navigate('/client-dashboard');
            else navigate('/freelancer-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center py-10">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-100">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Create an Account</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={`p-4 border rounded-lg cursor-pointer text-center ${formData.role === 'client' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setFormData({ ...formData, role: 'client' })}
                        >
                            <span className="font-semibold block">I'm a Client</span>
                            <span className="text-xs text-gray-500">Hiring talent</span>
                        </div>
                        <div
                            className={`p-4 border rounded-lg cursor-pointer text-center ${formData.role === 'freelancer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setFormData({ ...formData, role: 'freelancer' })}
                        >
                            <span className="font-semibold block">I'm a Freelancer</span>
                            <span className="text-xs text-gray-500">Looking for work</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input name="password" type="password" required minLength="6" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                    </div>

                    {formData.role === 'client' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                            <input name="company_name" type="text" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Acme Corp" />
                        </div>
                    )}

                    {formData.role === 'freelancer' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea name="bio" rows="3" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tell us about yourself..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                                    <input name="hourly_rate" type="number" required min="0" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="25" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                    <input name="experience_years" type="number" required min="0" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="3" />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition shadow mt-4">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
