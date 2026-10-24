/**
 * HackSphere 3.0 — API Service
 * Centralizes all backend API calls for the dashboard.
 */

const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/** Health check */
export const getHealth = () => request('/health');

/** Model metadata */
export const getModelInfo = () => request('/model-info');

/** Training data statistics */
export const getTrainingStats = () => request('/training-stats');

/** Run 24-hour demo forecast (first 24 rows of sample_test_input.csv) */
export const getDemoForecast = () => request('/demo-forecast');

/** Run full forecast on all sample_test_input.csv rows */
export const getFullForecast = () => request('/full-forecast');

/** Predict from JSON data rows */
export const postPredict = (dataRows) =>
  request('/predict', {
    method: 'POST',
    body: JSON.stringify({ data: dataRows }),
  });

/** Upload CSV file for prediction */
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE}/upload-csv`, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
};

/** Single manual prediction */
export const postManualPredict = (row) =>
  request('/predict-manual', {
    method: 'POST',
    body: JSON.stringify(row),
  });

/** AI Grid Advisory (NVIDIA NIM) */
export const postAiAdvisory = (summary) =>
  request('/ai-advisory', {
    method: 'POST',
    body: JSON.stringify({ summary }),
  });

