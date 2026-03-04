import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const { data } = await api.get('/admin/metrics');
            setStats(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;

    const barData = stats?.top_freelancers.map((f, i) => ({
        name: f.email.split('@')[0],
        rating: parseFloat(f.avg_rating).toFixed(1)
    })) || [];

    return (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Analytics Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-4xl font-extrabold text-indigo-600">{stats?.metrics?.total_users}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Active Contracts</h3>
                    <p className="text-4xl font-extrabold text-green-600">{stats?.metrics?.active_contracts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Released Revenue</h3>
                    <p className="text-4xl font-extrabold text-gray-900">${stats?.metrics?.total_revenue_released.toFixed(2) || '0.00'}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Rated Freelancers</h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="rating" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Average Rating" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
