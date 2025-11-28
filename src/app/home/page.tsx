'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/utils/client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'Administrator';

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Music Classification System</h1>
          <p className="text-gray-600">Hello, {user?.email}!</p>
          <p className="text-sm text-gray-500 mt-1">Role: {user?.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upload Audio */}
          <Link href="/upload" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-4">Upload Audio</h2>
            </div>
            <p className="text-gray-600">Upload WAV or MP3 files for classification</p>
          </Link>

          {/* Classify Audio */}
          <Link href="/classify" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-4">Classify Audio</h2>
            </div>
            <p className="text-gray-600">Classify audio files into music genres</p>
          </Link>

          {/* View Results */}
          <Link href="/results" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-4">View Results</h2>
            </div>
            <p className="text-gray-600">View model metrics and classification results</p>
          </Link>

          {/* Admin Only Features */}
          {isAdmin && (
            <>
              <Link href="/dashboard" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-yellow-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold ml-4">Admin Dashboard</h2>
                </div>
                <p className="text-gray-600">Manage datasets and train models</p>
              </Link>

              <Link href="/datasets" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-yellow-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold ml-4">Manage Datasets</h2>
                </div>
                <p className="text-gray-600">Create, rename, and delete datasets</p>
              </Link>

              <Link href="/users" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-yellow-300">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold ml-4">User Management</h2>
                </div>
                <p className="text-gray-600">Manage user roles and permissions</p>
              </Link>
            </>
          )}
        </div>

        {/* Quick Stats for Regular Users */}
        {!isAdmin && (
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <div className="space-y-2 text-gray-700">
              <p>• <strong>Upload</strong> your audio files (WAV or MP3 format)</p>
              <p>• <strong>Classify</strong> audio to identify music genres</p>
              <p>• <strong>View Results</strong> to see classification metrics and confidence scores</p>
              <p className="mt-4 text-sm text-gray-600">
                Need admin access? Contact an administrator to upgrade your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

