'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/utils/client';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ResultsPage() {
  const router = useRouter();
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // In a real app, load models from API
    // For now, use placeholder
    setModels([{ id: 1, algorithmType: 'CNN', createdAt: new Date() }]);
  }, [router]);

  const loadMetrics = async (modelId: number) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/models/${modelId}/metrics`);
      setMetrics(data);
    } catch (err: any) {
      alert(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (modelId: number) => {
    setSelectedModel(modelId);
    loadMetrics(modelId);
  };

  const exportCSV = () => {
    if (!metrics) return;

    const csv = [
      ['Metric', 'Value'],
      ['Accuracy', metrics.accuracy],
      ['Precision', metrics.precision],
      ['Recall', metrics.recall],
      ['F1 Score', metrics.f1Score],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-${selectedModel}-metrics.csv`;
    a.click();
  };

  const chartData = metrics ? [
    { name: 'Accuracy', value: metrics.accuracy },
    { name: 'Precision', value: metrics.precision },
    { name: 'Recall', value: metrics.recall },
    { name: 'F1 Score', value: metrics.f1Score },
  ] : [];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Model Results & Metrics</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Select Model</h2>
          <div className="space-y-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`w-full text-left p-3 border rounded ${
                  selectedModel === model.id ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
                }`}
              >
                Model {model.id} - {model.algorithmType}
              </button>
            ))}
          </div>
        </div>

        {loading && <p>Loading metrics...</p>}

        {metrics && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                  <p className="text-2xl font-bold">{(metrics.accuracy * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precision</p>
                  <p className="text-2xl font-bold">{(metrics.precision * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recall</p>
                  <p className="text-2xl font-bold">{(metrics.recall * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">F1 Score</p>
                  <p className="text-2xl font-bold">{(metrics.f1Score * 100).toFixed(2)}%</p>
                </div>
              </div>

              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={exportCSV}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {metrics.confusionMatrix && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Confusion Matrix</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2"></th>
                        {metrics.confusionMatrix[0]?.map((_: any, i: number) => (
                          <th key={i} className="border border-gray-300 px-4 py-2">
                            Predicted {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.confusionMatrix.map((row: number[], i: number) => (
                        <tr key={i}>
                          <th className="border border-gray-300 px-4 py-2">Actual {i + 1}</th>
                          {row.map((cell: number, j: number) => (
                            <td
                              key={j}
                              className={`border border-gray-300 px-4 py-2 text-center ${
                                i === j ? 'bg-green-100' : 'bg-red-100'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

