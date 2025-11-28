'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/utils/client';
import Navbar from '@/components/Navbar';

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadDatasets();
  }, [router]);

  const loadDatasets = async () => {
    try {
      const data = await apiRequest('/api/datasets');
      setDatasets(data);
    } catch (err: any) {
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        alert('Administrator access required');
        router.push('/dashboard');
      } else {
        console.error('Failed to load datasets:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: number) => {
    try {
      await apiRequest('/api/datasets', {
        method: 'PATCH',
        body: JSON.stringify({ id, name: editName }),
      });
      setEditingId(null);
      setEditName('');
      loadDatasets();
    } catch (err: any) {
      alert(err.message || 'Failed to rename dataset');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await apiRequest(`/api/datasets?id=${id}`, {
        method: 'DELETE',
      });
      loadDatasets();
    } catch (err: any) {
      alert(err.message || 'Failed to delete dataset');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Datasets Management</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datasets.map((dataset) => (
                <tr key={dataset.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dataset.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === dataset.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded px-2 py-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleRename(dataset.id);
                          }
                        }}
                      />
                    ) : (
                      dataset.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        dataset.status === 'valid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dataset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dataset.files?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === dataset.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRename(dataset.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(dataset.id);
                            setEditName(dataset.name);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(dataset.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

