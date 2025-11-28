'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/utils/client';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<number | undefined>();
  const [algorithmType, setAlgorithmType] = useState('CNN');

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

    loadDatasets();
  }, [router]);

  const loadDatasets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await apiRequest('/api/datasets');
      setDatasets(data);
    } catch (err: any) {
      console.error('Failed to load datasets:', err);
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      // Don't show error to user for other failures
    }
  };

  const handleCreateDataset = async () => {
    if (!newDatasetName) return;

    try {
      await apiRequest('/api/datasets', {
        method: 'POST',
        body: JSON.stringify({ name: newDatasetName, status: 'valid' }),
      });
      setNewDatasetName('');
      loadDatasets();
    } catch (err: any) {
      alert(err.message || 'Failed to create dataset');
    }
  };

  const handleStartTraining = async () => {
    if (!selectedDataset) {
      alert('Please select a dataset');
      return;
    }

    setTraining(true);
    setTrainingProgress(null);

    try {
      const result = await apiRequest('/api/train', {
        method: 'POST',
        body: JSON.stringify({
          datasetId: selectedDataset,
          algorithmType,
        }),
      });

      // Simulate training progress
      const eventSource = new EventSource(`/api/train?trainingId=${result.trainingId}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setTrainingProgress(data);
      };

      eventSource.onerror = () => {
        eventSource.close();
        setTraining(false);
      };
    } catch (err: any) {
      alert(err.message || 'Training failed');
      setTraining(false);
    }
  };

  if (!user || user.role !== 'Administrator') {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-8">
          <p className="text-red-600">Access denied. Administrator role required.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datasets Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Datasets</h2>
            
            <div className="mb-4">
              <input
                type="text"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
                placeholder="New dataset name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
              />
              <button
                onClick={handleCreateDataset}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Dataset
              </button>
            </div>

            <div className="space-y-2">
              {datasets.map((dataset) => (
                <div key={dataset.id} className="p-2 border rounded">
                  <p className="font-bold">{dataset.name}</p>
                  <p className="text-sm text-gray-600">Status: {dataset.status}</p>
                  <p className="text-sm text-gray-600">Files: {dataset.files?.length || 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Training Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Train Model</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Dataset</label>
              <select
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(e.target.value ? parseInt(e.target.value) : undefined)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Algorithm</label>
              <select
                value={algorithmType}
                onChange={(e) => setAlgorithmType(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="CNN">CNN</option>
                <option value="SVM">SVM</option>
                <option value="RandomForest">Random Forest</option>
              </select>
            </div>

            <button
              onClick={handleStartTraining}
              disabled={training || !selectedDataset}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {training ? 'Training...' : 'Start Training'}
            </button>

            {trainingProgress && (
              <div className="mt-4">
                <p>Epoch: {trainingProgress.epoch}</p>
                <p>Loss: {trainingProgress.loss.toFixed(4)}</p>
                <p>Accuracy: {(trainingProgress.accuracy * 100).toFixed(2)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${trainingProgress.accuracy * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

