import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function ClientDashboard() {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJobForm, setShowJobForm] = useState(false);

    // For simplicity, categories are hardcoded. In a real app they'd be fetched.
    const [newJob, setNewJob] = useState({ category_id: 1, title: '', description: '', budget: '' });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            // Filter only jobs by this client (in prod this should be a backend route)
            setJobs(data.filter(j => j.client_id === user?.user_id || j.company_name));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('/jobs', { ...newJob, budget: parseFloat(newJob.budget) });
            setShowJobForm(false);
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert('Failed to create job.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
                <button
                    onClick={() => setShowJobForm(!showJobForm)}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow"
                >
                    {showJobForm ? 'Cancel' : 'Post New Job'}
                </button>
            </div>

            {showJobForm && (
                <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Post a Project</h2>
                    <form onSubmit={handleCreateJob} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input required type="text" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea required rows="4" value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
                                <input required type="number" min="1" value={newJob.budget} onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category ID</label>
                                <input required type="number" min="1" value={newJob.category_id} onChange={(e) => setNewJob({ ...newJob, category_id: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-indigo-500 bg-gray-50" />
                            </div>
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">Publish Project</button>
                    </form>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-semibold mb-4">Your Posted Jobs</h2>
                {loading ? <p>Loading jobs...</p> : (
                    <div className="grid gap-6">
                        {jobs.map(job => (
                            <div key={job.job_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Status: <span className="uppercase font-semibold text-indigo-600">{job.status}</span> • Budget: ${job.budget}</p>
                                    </div>
                                    <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 mt-4 line-clamp-2">{job.description}</p>

                                {job.status === 'open' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View Bids &rarr;</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {jobs.length === 0 && <p className="text-gray-500 italic">No jobs posted yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
