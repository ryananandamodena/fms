const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const downloadFile = async (endpoint: string, filename: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportService = {
  exportVehicles: () => downloadFile('/export/vehicles', `vehicles_${new Date().toISOString().split('T')[0]}.xlsx`),
  exportBuildings: () => downloadFile('/export/buildings', `buildings_${new Date().toISOString().split('T')[0]}.xlsx`),
  exportAssets: (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return downloadFile(`/export/assets${query}`, `assets_${new Date().toISOString().split('T')[0]}.xlsx`);
  },
  exportVendors: () => downloadFile('/export/vendors', `vendors_${new Date().toISOString().split('T')[0]}.xlsx`),
};
