'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, apiRequestFormData } from '@/lib/utils/client';
import Navbar from '@/components/Navbar';

export default function ClassifyPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [audioId, setAudioId] = useState<number | undefined>();
  const [modelId, setModelId] = useState<number | undefined>();
  const [models, setModels] = useState<any[]>([]);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadModels();
  }, [router]);

  const loadModels = async () => {
    try {
      // In a real app, you'd have an endpoint to list models
      // For now, we'll use a placeholder
      setModels([]);
    } catch (err) {
      console.error('Failed to load models:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleClassify = async () => {
    setError('');
    setResult(null);
    setClassifying(true);
    setStartTime(Date.now());

    try {
      let audioFileId = audioId;

      // If file is provided, upload it first
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResult = await apiRequestFormData('/api/upload', formData);
        audioFileId = uploadResult.id;
      }

      if (!audioFileId) {
        throw new Error('Please provide a file or select an existing audio file');
      }

      const classificationResult = await apiRequest('/api/classify', {
        method: 'POST',
        body: JSON.stringify({
          audioId: audioFileId,
          modelId: modelId,
        }),
      });

      setResult(classificationResult);
    } catch (err: any) {
      setError(err.message || 'Classification failed');
    } finally {
      setClassifying(false);
    }
  };

  const processingTime = startTime ? Date.now() - startTime : null;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Classify Audio File</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              Upload New Audio File
            </label>
            <input
              type="file"
              id="file"
              accept=".wav,.mp3"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="audioId">
              Or Enter Audio File ID
            </label>
            <input
              type="number"
              id="audioId"
              value={audioId || ''}
              onChange={(e) => setAudioId(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Audio File ID"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modelId">
              Model ID (Optional - uses latest if not provided)
            </label>
            <input
              type="number"
              id="modelId"
              value={modelId || ''}
              onChange={(e) => setModelId(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Model ID"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <button
            onClick={handleClassify}
            disabled={classifying || (!file && !audioId)}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {classifying ? 'Classifying...' : 'Classify Audio'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Classification Result</h2>
            <div className="space-y-2">
              <p className="text-lg">
                <span className="font-bold">Predicted Genre:</span> {result.genre}
              </p>
              <p className="text-lg">
                <span className="font-bold">Confidence:</span> {(result.confidence * 100).toFixed(2)}%
              </p>
              <p className="text-lg">
                <span className="font-bold">Certainty:</span>{' '}
                <span className={result.isHighCertainty ? 'text-green-600' : 'text-yellow-600'}>
                  {result.isHighCertainty ? 'High' : 'Low'}
                </span>
              </p>
              {processingTime && (
                <p className="text-lg">
                  <span className="font-bold">Processing Time:</span> {processingTime}ms
                  {processingTime < 5000 ? (
                    <span className="text-green-600 ml-2">✓ Under 5s</span>
                  ) : (
                    <span className="text-red-600 ml-2">⚠ Exceeded 5s</span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

