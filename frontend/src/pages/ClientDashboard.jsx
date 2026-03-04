import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function ClientDashboard() {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJobForm, setShowJobForm] = useState(false);
    const [newJob, setNewJob] = useState({ category_id: '', title: '', description: '', budget: '' });

    // Bids viewing state
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [bids, setBids] = useState({}); // { jobId: [bids] }

    useEffect(() => {
        fetchJobs();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/jobs/categories');
            setCategories(data);
            if (data.length > 0) {
                setNewJob(prev => ({ ...prev, category_id: data[0].category_id }));
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data.filter(j => j.client_id === user?.user_id || j.company_name));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchBidsForJob = async (jobId) => {
        if (selectedJobId === jobId) {
            setSelectedJobId(null);
            return;
        }
        try {
            const { data } = await api.get(`/bids/job/${jobId}`);
            setBids(prev => ({ ...prev, [jobId]: data }));
            setSelectedJobId(jobId);
        } catch (err) {
            console.error('Failed to fetch bids:', err);
            alert('Could not load bids for this project.');
        }
    };

    const handleAcceptBid = async (bidId, jobId) => {
        if (!window.confirm('Are you sure you want to accept this bid? This will create a contract and escrow the funds.')) return;
        try {
            await api.post('/contracts/accept-bid', { bid_id: bidId });
            alert('Bid accepted! A contract has been generated and funds are now in escrow.');
            fetchJobs(); // Update job status
            setSelectedJobId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to accept bid.');
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('/jobs', {
                ...newJob,
                category_id: parseInt(newJob.category_id),
                budget: parseFloat(newJob.budget)
            });
            setShowJobForm(false);
            setNewJob({ category_id: categories[0]?.category_id || '', title: '', description: '', budget: '' });
            fetchJobs();
        } catch (err) {
            console.error(err);
            alert('Failed to create job.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Client Dashboard</h1>
                <button
                    onClick={() => setShowJobForm(!showJobForm)}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md font-medium"
                >
                    {showJobForm ? 'Cancel' : 'Post New Job'}
                </button>
            </div>

            {showJobForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8 animate-in slide-in-from-top duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a Project</h2>
                    <form onSubmit={handleCreateJob} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input required type="text" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Build a React Portfolio" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea required rows="4" value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Describe the requirements..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Budget ($)</label>
                                <input required type="number" min="1" value={newJob.budget} onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    required
                                    value={newJob.category_id}
                                    onChange={(e) => setNewJob({ ...newJob, category_id: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-sm">Publish Project</button>
                    </form>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Posted Jobs</h2>
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map(job => (
                            <div key={job.job_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${job.status === 'open' ? 'bg-green-100 text-green-700' :
                                                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {job.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-sm font-medium text-gray-600">Budget: ${job.budget}</span>
                                                <span className="text-xs text-gray-400">• {new Date(job.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mt-4 leading-relaxed">{job.description}</p>

                                    {job.status === 'open' && (
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end">
                                            <button
                                                onClick={() => fetchBidsForJob(job.job_id)}
                                                className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center transition"
                                            >
                                                {selectedJobId === job.job_id ? 'Hide Bids' : 'View Bids'}
                                                <span className="ml-1 text-lg">↓</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Bids Sub-section */}
                                {selectedJobId === job.job_id && (
                                    <div className="bg-gray-50 border-t border-gray-200 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <h4 className="text-lg font-bold mb-4 text-gray-800">Freelancer Bids</h4>
                                        {bids[job.job_id]?.length > 0 ? (
                                            <div className="space-y-4">
                                                {bids[job.job_id].map(bid => (
                                                    <div key={bid.bid_id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-bold text-gray-900">{bid.email.split('@')[0]}</span>
                                                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">${bid.hourly_rate}/hr</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1 italic">"{bid.proposal}"</p>
                                                            <div className="mt-2 text-xs text-gray-400 flex items-center space-x-3">
                                                                <span>Exp: {bid.experience_years} years</span>
                                                                <span>Rating: ★ 5.0 (vetted)</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="text-xl font-bold text-indigo-600 mb-2">${bid.bid_amount}</div>
                                                            <button
                                                                onClick={() => handleAcceptBid(bid.bid_id, job.job_id)}
                                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                                                            >
                                                                Accept This Bid
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic text-center py-4">No bids received yet for this project.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                                <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
                                <button onClick={() => setShowJobForm(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Get started by posting your first project</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
