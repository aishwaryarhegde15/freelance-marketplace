import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function FreelancerDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [biddingJob, setBiddingJob] = useState(null);
    const [bidData, setBidData] = useState({ bid_amount: '', proposal: '' });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data.filter(j => j.status === 'open'));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bids', {
                job_id: biddingJob.job_id,
                bid_amount: parseFloat(bidData.bid_amount),
                proposal: bidData.proposal
            });
            alert('Bid submitted successfully to the Escrow system waitlist.');
            setBiddingJob(null);
            setBidData({ bid_amount: '', proposal: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit bid.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Freelancer Workboard</h1>

            <h2 className="text-2xl font-semibold mb-4">Available Projects</h2>
            {loading ? <p>Loading projects...</p> : (
                <div className="grid gap-6">
                    {jobs.map(job => (
                        <div key={job.job_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Client: {job.company_name || 'Individual'} • Budget: ${job.budget}</p>
                                </div>
                                <span className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full">Open</span>
                            </div>
                            <p className="text-gray-700 mt-4">{job.description}</p>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setBiddingJob(job)}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 font-medium text-sm rounded shadow"
                                >
                                    Place Bid
                                </button>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && <p className="text-gray-500 italic">No open jobs available.</p>}
                </div>
            )}

            {/* Bidding Modal */}
            {biddingJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-2">Submit Proposal</h2>
                        <p className="text-gray-600 mb-6 font-medium">For: {biddingJob.title} (Budget: ${biddingJob.budget})</p>

                        <form onSubmit={handleBidSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Your Bid Amount ($)</label>
                                <input required type="number" min="1" value={bidData.bid_amount} onChange={(e) => setBidData({ ...bidData, bid_amount: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cover Letter / Proposal</label>
                                <textarea required rows="5" value={bidData.proposal} onChange={(e) => setBidData({ ...bidData, proposal: e.target.value })} className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-indigo-500" placeholder="Why should the client pick you?" />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setBiddingJob(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Submit Bid</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
