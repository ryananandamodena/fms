import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchFn();
      setState({ data: result, loading: false, error: null });
    } catch (err: any) {
      setState({ data: null, loading: false, error: err.message || 'Failed to fetch data' });
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const setData = useCallback((value: React.SetStateAction<T | null>) => {
    setState(prev => ({
      ...prev,
      data: typeof value === 'function' ? (value as Function)(prev.data) : value,
    }));
  }, []);

  return {
    ...state,
    refetch: fetchData,
    setData,
  };
}

// Hook for CRUD operations
export function useCrud<T extends { id?: number | string }>(service: {
  getAll: (params?: Record<string, string>) => Promise<T[]>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: number | string, data: Partial<T>) => Promise<T>;
  delete: (id: number | string) => Promise<any>;
}, params?: Record<string, string>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.getAll(params);
      setData(result || []);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, []);

  const create = async (item: Partial<T>) => {
    try {
      const newItem = await service.create(item);
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err: any) {
      throw err;
    }
  };

  const update = async (id: number | string, item: Partial<T>) => {
    try {
      const updated = await service.update(id, item);
      setData(prev => prev.map(d => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const remove = async (id: number | string) => {
    try {
      await service.delete(id);
      setData(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove,
    setData,
  };
}
