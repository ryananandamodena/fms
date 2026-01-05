const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const uploadService = {
  uploadFile: async (file: File, category: string = 'documents'): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  uploadMultiple: async (files: File[], category: string = 'documents'): Promise<{ files: any[]; count: number }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('category', category);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  deleteFile: async (category: string, filename: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/upload/${category}/${filename}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  },

  getFileUrl: (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
  },
};
