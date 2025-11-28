'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, apiRequestFormData } from '@/lib/utils/client';
import Navbar from '@/components/Navbar';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [datasetId, setDatasetId] = useState<number | undefined>();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load datasets
    loadDatasets();
  }, [router]);

  const loadDatasets = async () => {
    try {
      const data = await apiRequest('/api/datasets');
      setDatasets(data);
    } catch (err: any) {
      console.error('Failed to load datasets:', err);
      // Don't show error for unauthorized - user might not be admin
      if (err.message?.includes('Unauthorized')) {
        // Silently fail - user might not have admin access
        return;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!['wav', 'mp3'].includes(selectedFile.name.split('.').pop()?.toLowerCase() || '')) {
        setError('Invalid file format. Please upload WAV or MP3 files.');
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (datasetId) {
        formData.append('datasetId', datasetId.toString());
      }

      const result = await apiRequestFormData('/api/upload', formData);
      setMessage(`File uploaded successfully! ID: ${result.id}`);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Upload Audio File</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              Audio File (WAV or MP3, max 50MB)
            </label>
            <input
              type="file"
              id="file"
              accept=".wav,.mp3"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dataset">
              Dataset (Optional)
            </label>
            <select
              id="dataset"
              value={datasetId || ''}
              onChange={(e) => setDatasetId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">None</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name} ({dataset.status})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>
    </div>
  );
}

