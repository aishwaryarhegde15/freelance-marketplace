import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Find the Perfect <span className="text-indigo-600">Freelancer</span> for Your Needs
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl">
                Freelance Marketplace is the ultimate platform for clients and freelancers to connect, collaborate, and succeed together. Backed by solid Escrow security.
            </p>
            <div className="flex space-x-4">
                <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl">
                    Get Started Now
                </Link>
                <Link to="/login" className="bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow">
                    Login to Account
                </Link>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-2">Secure Escrow</h3>
                    <p className="text-gray-600">Funds are locked securely and only released upon successful completion of the job.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-2">Top Talent</h3>
                    <p className="text-gray-600">Access a diverse pool of vetted, high-quality freelancers across multiple categories.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-2">Transparent Reviews</h3>
                    <p className="text-gray-600">Hire with confidence utilizing our verified rating and review system.</p>
                </div>
            </div>
        </div>
    );
}
