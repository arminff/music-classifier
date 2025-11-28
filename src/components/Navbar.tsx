'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Link href="/home" className="hover:underline">Home</Link>
          <Link href="/upload" className="hover:underline">Upload</Link>
          <Link href="/classify" className="hover:underline">Classify</Link>
          <Link href="/results" className="hover:underline">Results</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/datasets" className="hover:underline">Datasets</Link>
          <Link href="/users" className="hover:underline">Users</Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

