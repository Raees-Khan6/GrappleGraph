'use client';

import { useState } from 'react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Upload failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Import Matches from CSV</h1>
      
      <div style={{ marginTop: '20px' }}>
        <h2>CSV Format:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', color: '#000' }}>
{`firstName1,lastName1,firstName2,lastName2,winner,competition,date,ruleset
Gordon,Ryan,Felipe,Pena,1,ADCC 2024,2024-09-15,nogi
Craig,Jones,Yuri,Simoes,1,ADCC 2024,2024-09-14,nogi`}
        </pre>
        <p><strong>winner:</strong> 1 = athlete1 wins, 2 = athlete2 wins</p>
        <p><strong>ruleset:</strong> gi or nogi</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '10px' }}
        />
        
        <button
          onClick={handleUpload}
          style={{
            padding: '10px 20px',
            background: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'wait' : 'pointer',
            marginLeft: '10px'
          }}
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', background: result.error ? '#ffe0e0' : '#e0ffe0', borderRadius: '4px' }}>
          {result.error ? (
            <p><strong>Error:</strong> {result.error}</p>
          ) : (
            <>
              <p><strong>✓ Success!</strong></p>
              <p>Created {result.created} matches</p>
              {result.errors && result.errors.length > 0 && (
                <>
                  <p><strong>Errors:</strong></p>
                  <ul>
                    {result.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}